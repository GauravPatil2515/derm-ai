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
from typing import Tuple
import logging
import json
from flask_sqlalchemy import SQLAlchemy
from tenacity import retry, stop_after_attempt, wait_exponential

# Initialize SQLAlchemy
db = SQLAlchemy()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RetryableDBOperation:
    """Decorator for database operations that should be retried on failure"""
    @staticmethod
    def retry_if_db_error(exception):
        from sqlalchemy.exc import SQLAlchemyError
        return isinstance(exception, SQLAlchemyError)

    @staticmethod
    def with_retry(func):
        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=4, max=10),
            retry=RetryableDBOperation.retry_if_db_error,
            before_sleep=lambda retry_state: logger.warning(
                f"Retrying {func.__name__} after attempt {retry_state.attempt_number}"
            )
        )
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
                raise
        return wrapper

# Define ChatMessage model
class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @RetryableDBOperation.with_retry
    def save(self):
        try:
            db.session.add(self)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise

class SkinAnalysisResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    image_path = db.Column(db.String(255), nullable=False)
    primary_condition = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    detailed_analysis = db.Column(db.Text, nullable=False)

    @RetryableDBOperation.with_retry
    def save(self):
        try:
            db.session.add(self)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise

class SkinDiseaseModel(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.base_model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
        in_features = self.base_model.classifier[1].in_features
        self.base_model.classifier = nn.Sequential(
            nn.Dropout(p=0.5, inplace=True),
            nn.Linear(in_features, num_classes, bias=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base_model(x)

class DermatologyAnalyzer:
    def __init__(self, username: str = "DefaultUser"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Initialize Groq client with API key from environment variable
        self.api_key = os.getenv('GROQ_API_KEY', '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')
        self.groq_client = Groq(api_key=self.api_key)

        # Define class names
        self.class_names = (
            'BA-cellulitis', 'BA-impetigo', 'FU-athlete-foot',
            'FU-nail-fungus', 'FU-ringworm', 'PA-cutaneous-larva-migrans',
            'VI-chickenpox', 'VI-shingles'
        )

        self.model = None
        self._initialize_model()
        self._setup_transformations()
        self._response_cache = {}

    def initialize_with_app(self, app):
        """Initialize database-related operations within app context"""
        with app.app_context():
            try:
                self._cleanup_old_records()
                logger.info("Database cleanup completed successfully")
            except Exception as e:
                logger.error(f"Database cleanup failed: {str(e)}")
                # Don't raise the error, as this is not critical for model operation

    def _initialize_model(self) -> None:
        try:
            self.model = SkinDiseaseModel(num_classes=len(self.class_names)).to(self.device)
            # Use absolute path for the model file
            model_path = r"C:\Users\GAURAV PATIL\Desktop\gaurav's code\mini project derm ai\project\project\best_model_acc_0.9978.pth"
            
            logger.info(f"Attempting to load model from: {model_path}")

            if not os.path.exists(model_path):
                logger.error(f"Model file not found at {model_path}")
                raise FileNotFoundError(f"Model file not found at {model_path}")

            try:
                checkpoint = torch.load(model_path, map_location=self.device)
                if isinstance(checkpoint, dict):
                    self.model.load_state_dict(checkpoint.get('model_state_dict', checkpoint))
                else:
                    self.model.load_state_dict(checkpoint)

                self.model.eval()
                torch.set_grad_enabled(False)
                logger.info(f"Model loaded successfully from {model_path}")
                
                # Verify model loaded correctly by running a test inference
                dummy_input = torch.randn(1, 3, 224, 224).to(self.device)
                try:
                    with torch.no_grad():
                        _ = self.model(dummy_input)
                    logger.info("Model verification successful - test inference passed")
                except Exception as e:
                    logger.error(f"Model verification failed: {str(e)}")
                    raise RuntimeError(f"Model verification failed: {str(e)}")

            except Exception as e:
                logger.error(f"Error loading model weights: {str(e)}")
                raise RuntimeError(f"Error loading model weights: {str(e)}")

        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
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
                _ = self.model(dummy_input)
            return True
        except Exception as e:
            logger.error(f"Model health check failed: {str(e)}")
            return False

    @torch.inference_mode()
    def _predict_image(self, image_tensor: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        outputs = self.model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        return torch.topk(probabilities, k=3)

    def _get_groq_analysis(self, initial_report: str) -> str:
        try:
            cache_key = hash(initial_report)
            if (cache_key in self._response_cache):
                return self._response_cache[cache_key]

            prompt = f"""
Please provide a detailed dermatological analysis following this exact structure:

1. CONDITION OVERVIEW
   • [Provide a clear, detailed description of the condition]
   • [List key characteristics and typical presentation]
   • [Include common affected areas and populations]

2. KEY SYMPTOMS
   • [List primary symptoms in order of significance]
   • [Describe how symptoms typically present]
   • [Include any characteristic patterns or progression]

3. TREATMENT APPROACHES
   • [Specify first-line treatments and medications]
   • [List alternative treatment options]
   • [Include relevant self-care measures]
   • [Mention typical treatment duration]

4. PREVENTION GUIDELINES
   • [List specific preventive measures]
   • [Include lifestyle modifications]
   • [Specify risk factors to avoid]
   • [Recommend protective measures]

5. MEDICAL ATTENTION INDICATORS
   • [List urgent warning signs]
   • [Specify when to seek immediate care]
   • [Include complications to watch for]

Analysis Request:
{initial_report}

Format each section with bullet points (•) for clear readability.
Ensure each point is concise but informative.
Use medical terminology with layman explanations where needed.
"""

            response = self.groq_client.chat.completions.create(
                model="llama-3.2-90b-vision-preview",
                messages=[
                    {"role": "system", "content": "You are a specialized dermatology AI assistant. Provide structured, clear, and professional analysis using bullet points."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )

            analysis = response.choices[0].message.content.strip()
            # Clean up and standardize the bullet points
            analysis = analysis.replace('*', '•').replace('-', '•')
            self._response_cache[cache_key] = analysis
            return analysis

        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return "Unable to get enhanced analysis. Please try again later."

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
            initial_report = self._generate_initial_report(image_path, top_prob, top_idx)
            enhanced_analysis = self._get_groq_analysis(initial_report)
            sections = self._parse_analysis_sections(enhanced_analysis)

            return {
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
                }
            }

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

    @RetryableDBOperation.with_retry
    def _cleanup_old_records(self, days_to_keep: int = 30) -> None:
        """Clean up old records from the database"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Delete old analysis results
            old_analyses = SkinAnalysisResult.query.filter(
                SkinAnalysisResult.timestamp < cutoff_date
            ).all()
            
            if old_analyses:
                for analysis in old_analyses:
                    try:
                        if os.path.exists(analysis.image_path):
                            os.remove(analysis.image_path)
                    except Exception as e:
                        logger.error(f"Error deleting image file: {e}")
                        
                    db.session.delete(analysis)
                
                db.session.commit()
                logger.info(f"Cleaned up {len(old_analyses)} old analysis records")
                
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            db.session.rollback()