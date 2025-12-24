import os
import torch
import torch.nn as nn
import torchvision.models as models
import albumentations as A
from albumentations.pytorch import ToTensorV2
import numpy as np
from PIL import Image
from datetime import datetime, timedelta
from groq import Groq
from typing import Tuple, Optional
import logging
import json
import sys
import timm

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db
from config import Config
from models.skin_analysis import SkinAnalysisResult
from utils.gradcam import GradCAMProcessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SkinDiseaseModel(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        # Use timm implementation to match the saved model weights (conv_stem, blocks, etc.)
        self.base_model = timm.create_model('efficientnet_b0', pretrained=False, num_classes=num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base_model(x)

class ViTWithUncertainty(nn.Module):
    def __init__(self, num_classes=8, embed_dim=768):
        super(ViTWithUncertainty, self).__init__()
        self.backbone = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=0)
        self.feature_projection = nn.Sequential(
            nn.Linear(embed_dim, 512),
            nn.ReLU(),
            nn.LayerNorm(512),
            nn.ReLU()
        )
        self.attention_pool = nn.MultiheadAttention(embed_dim=512, num_heads=8, batch_first=True)
        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )
        self.uncertainty_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 1)
        )
    
    def forward(self, x):
        features = self.backbone(x)
        projected = self.feature_projection(features)
        pooled = projected.unsqueeze(1)
        attended, _ = self.attention_pool(pooled, pooled, pooled)
        attended = attended.squeeze(1)
        logits = self.classifier(attended)
        uncertainty = self.uncertainty_head(attended)
        return logits, uncertainty

class DermatologyAnalyzer:
    def __init__(self, username: str = "DefaultUser"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Initialize Groq client
        self.api_key = os.getenv('GROQ_API_KEY')
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set. Chat features will be disabled.")
            self.groq_client = None
        else:
            self.groq_client = Groq(api_key=self.api_key)

        # Load model
        self.model = None
        self.class_names = None
        self.condition_codes = None
        self._load_model_and_classes()
        self._setup_transformations()
        self._response_cache = {}
        
        # Initialize Grad-CAM processor
        self.gradcam_processor = None
        if self.model is not None:
            try:
                self.gradcam_processor = GradCAMProcessor(self.model)
                logger.info("Grad-CAM processor initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Grad-CAM processor: {str(e)}")
                self.gradcam_processor = None

    def _load_model_and_classes(self):
        """Load the model and set up class mappings from the saved model"""
        try:
            model_path = os.path.abspath(Config.MODEL_PATH)
            
            logger.info(f"Attempting to load model from: {model_path}")

            if not os.path.exists(model_path):
                logger.error(f"Model file not found at {model_path}")
                # Don't raise immediately, just log. This allows the app to start even if model is missing.
                # The is_model_loaded check will fail later.
                self.model = None
                return

            # Load checkpoint
            checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
            
            # Extract class mappings
            if 'class_to_idx' in checkpoint and 'idx_to_class' in checkpoint:
                class_to_idx = checkpoint['class_to_idx']
                idx_to_class = checkpoint['idx_to_class']
                self.class_names = tuple(idx_to_class[i] for i in range(len(idx_to_class)))
                logger.info(f"Loaded class names: {self.class_names}")
                self.condition_codes = {name: name for name in self.class_names}
            else:
                logger.warning("Class mappings not found in checkpoint, using default")
                self.class_names = (
                    'BA- cellulitis', 'BA-impetigo', 'FU-athlete-foot', 
                    'FU-nail-fungus', 'FU-ringworm', 'PA-cutaneous-larva-migrans',
                    'VI-chickenpox', 'VI-shingles'
                )
                self.condition_codes = {name: name for name in self.class_names}

            # Initialize EfficientNet model
            num_classes = len(self.class_names)
            self.model = SkinDiseaseModel(num_classes=num_classes).to(self.device)
            
            # Load state dict
            if 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            else:
                state_dict = checkpoint
                
            # Handle potential key mismatch (remove 'module.' prefix if present)
            new_state_dict = {}
            for k, v in state_dict.items():
                if k.startswith('module.'):
                    new_state_dict[k[7:]] = v
                else:
                    new_state_dict[k] = v
            
            # Load weights
            self.model.load_state_dict(new_state_dict, strict=False)
            self.model.eval()
            torch.set_grad_enabled(False)
            
            logger.info(f"EfficientNet model loaded successfully with {num_classes} classes")
            
            # Verify model
            dummy_input = torch.randn(1, 3, 224, 224).to(self.device)
            try:
                with torch.no_grad():
                    output = self.model(dummy_input)
                    # Handle different output types
                    if isinstance(output, tuple):
                        logits = output[0]
                    else:
                        logits = output
                logger.info("Model verification successful")
            except Exception as e:
                logger.error(f"Model verification failed: {str(e)}")
                raise RuntimeError(f"Model verification failed: {str(e)}")

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.model = None
            raise

    def _setup_transformations(self) -> None:
        self.transform = A.Compose([
            A.Resize(224, 224, interpolation=Image.BILINEAR),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])

    def is_model_loaded(self) -> bool:
        try:
            if self.model is None:
                return False
            
            # Try a test inference to verify model is working
            dummy_input = torch.randn(1, 3, 224, 224).to(self.device)
            with torch.no_grad():
                output = self.model(dummy_input)
            return True
        except Exception as e:
            logger.error(f"Model health check failed: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False

    @torch.inference_mode()
    def _predict_image(self, image_tensor: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        output = self.model(image_tensor)
        
        # Handle different output types (tuple vs single tensor)
        if isinstance(output, tuple):
            logits = output[0]
            # uncertainty = output[1] # Not used for prediction ranking
        else:
            logits = output
            
        probabilities = torch.nn.functional.softmax(logits, dim=1)[0]
        return torch.topk(probabilities, k=3)

    def _get_groq_analysis(self, initial_report: str) -> str:
        """Get AI analysis of the initial report using Groq"""
        try:
            if not self.groq_client:
                return "Error: AI analysis service unavailable"

            cache_key = hash(initial_report)
            if cache_key in self._response_cache:
                return self._response_cache[cache_key]

            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a specialized dermatology AI assistant. Analyze the given skin analysis report and provide a detailed, professional interpretation."
                    },
                    {
                        "role": "user",
                        "content": f"Please analyze this dermatological report and provide a detailed interpretation: {initial_report}"
                    }
                ],
                temperature=0.7,
                max_tokens=2048
            )
            
            analysis = response.choices[0].message.content
            self._response_cache[cache_key] = analysis
            return analysis
            
        except Exception as e:
            logger.error(f"Error getting AI analysis: {str(e)}")
            # Return a valid fallback text that won't break the parser
            return f"""1. CONDITION OVERVIEW
AI Analysis Unavailable: {str(e)}

2. KEY SYMPTOMS
- Information unavailable

3. TREATMENT APPROACHES
- Consult a healthcare professional

4. PREVENTION GUIDELINES
- Standard hygiene practices

5. MEDICAL ATTENTION INDICATORS
- If symptoms worsen"""

    def analyze_image(self, image_path: str) -> dict:
        if not self.is_model_loaded():
            logger.error("ML model is not properly initialized")
            raise RuntimeError("ML model is not properly initialized. Please try again later.")

        try:
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")

            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image=np.array(image))['image'].unsqueeze(0).to(self.device)

            top_prob, top_idx = self._predict_image(image_tensor)
            
            # Prepare prediction results for Grad-CAM
            primary_prediction = {
                'condition': self.class_names[top_idx[0]],
                'confidence': top_prob[0].item() * 100,
                'primary_prediction_idx': top_idx[0].item()
            }
            
            # Generate Grad-CAM explanation if available
            gradcam_results = {}
            if self.gradcam_processor is not None:
                try:
                    gradcam_results = self.gradcam_processor.process_image_with_explanation(
                        image_path, image_tensor, primary_prediction
                    )
                    logger.info("Grad-CAM explanation generated successfully")
                except Exception as e:
                    logger.warning(f"Grad-CAM generation failed: {str(e)}")
                    gradcam_results = {
                        'gradcam_available': False,
                        'error': str(e),
                        'explanation_text': "Visual explanation temporarily unavailable."
                    }
            else:
                gradcam_results = {
                    'gradcam_available': False,
                    'explanation_text': "Visual explanation feature is not available."
                }
            
            initial_report = self._generate_initial_report(image_path, top_prob, top_idx)
            enhanced_analysis = self._get_groq_analysis(initial_report)
            sections = self._parse_analysis_sections(enhanced_analysis)

            result = {
                'report_metadata': {
                    'timestamp': datetime.now().isoformat(),
                    'report_id': f"DERM-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                    'analysis_type': 'AI-Assisted Dermatological Assessment'
                },
                'primary_analysis': self._format_predictions(top_prob, top_idx)[0],
                'differential_diagnoses': self._format_predictions(top_prob, top_idx)[1:],
                'detailed_analysis': {
                    'overview': sections['overview'],
                    'symptoms': sections['symptoms'],
                    'treatment': sections['treatment'],
                    'prevention': sections['prevention'],
                    'warning': sections['warning']
                },
                'patient_guidance': {
                    'disclaimer': self._get_disclaimer(),
                    'next_steps': self._get_next_steps()
                },
                'visual_explanation': gradcam_results
            }
            
            return result

        except Exception as e:
            error_msg = f"Error analyzing image: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

    def _parse_analysis_sections(self, analysis: str) -> dict:
        sections = {
            'overview': [],
            'symptoms': [],
            'treatment': [],
            'prevention': [],
            'warning': []
        }

        current_section = None
        for line in analysis.split('\n'):
            line = line.strip()
            if not line:
                continue

            if line.startswith('1. CONDITION OVERVIEW'):
                current_section = 'overview'
            elif line.startswith('2. KEY SYMPTOMS'):
                current_section = 'symptoms'
            elif line.startswith('3. TREATMENT APPROACHES'):
                current_section = 'treatment'
            elif line.startswith('4. PREVENTION GUIDELINES'):
                current_section = 'prevention'
            elif line.startswith('5. MEDICAL ATTENTION INDICATORS'):
                current_section = 'warning'
            elif line.startswith('•') and current_section:
                sections[current_section].append(line[1:].strip())

        return sections

    def _format_predictions(self, probabilities: torch.Tensor, indices: torch.Tensor) -> list:
        return [
            {
                'condition': self.class_names[idx],
                'confidence': prob.item() * 100,
                'assessment': self._get_confidence_level(prob.item() * 100),
                'confidence_level': self._get_confidence_category(prob.item() * 100)
            }
            for prob, idx in zip(probabilities, indices)
        ]

    def _generate_initial_report(self, image_path: str, probabilities: torch.Tensor, indices: torch.Tensor) -> str:
        predictions = self._format_predictions(probabilities, indices)
        primary = predictions[0]
        differentials = predictions[1:]

        report = f"""DERMATOLOGICAL ANALYSIS REPORT
═══════════════════════════════
Image Reference: {os.path.basename(image_path)}

PRIMARY ASSESSMENT
────────────────
Condition: {primary['condition']}
Confidence: {primary['confidence']:.1f}%
Assessment: {primary['assessment']}

DIFFERENTIAL CONSIDERATIONS
─────────────────────────
"""
        for i, pred in enumerate(differentials, 1):
            report += f"{i}. {pred['condition']}\n   • Confidence: {pred['confidence']:.1f}%\n   • Assessment: {pred['assessment']}\n"
        
        return report

    @staticmethod
    def _get_confidence_level(confidence: float) -> str:
        if confidence >= 95: return "Very High Confidence Assessment"
        if confidence >= 85: return "High Confidence Assessment"
        if confidence >= 70: return "Moderate Confidence Assessment"
        if confidence >= 50: return "Low Confidence Assessment"
        return "Inconclusive Assessment"

    @staticmethod
    def _get_confidence_category(confidence: float) -> str:
        if confidence >= 95: return "very_high"
        if confidence >= 85: return "high"
        if confidence >= 70: return "moderate"
        if confidence >= 50: return "low"
        return "inconclusive"

    @staticmethod
    def _get_disclaimer() -> str:
        return """
╔════════════════════ IMPORTANT MEDICAL DISCLAIMER ════════════════════╗
║                                                                      ║
║  • This analysis is provided by an AI system and should NOT         ║
║    replace professional medical evaluation                          ║
║                                                                      ║
║  • The results are intended to assist healthcare providers and      ║
║    should be reviewed by a qualified medical professional           ║
║                                                                      ║
║  • Seek immediate medical attention for severe symptoms or          ║
║    rapid progression of condition                                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
"""

    @staticmethod
    def _get_next_steps() -> list:
        return [
            "Schedule a consultation with a dermatologist to review these findings",
            "Document any changes in symptoms or condition progression",
            "Take photos of the affected area for comparison over time",
            "Prepare a list of questions for your healthcare provider",
            "Follow any recommended preventive measures until professional evaluation"
        ]
