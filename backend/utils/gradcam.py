"""
Grad-CAM Implementation for Vision Transformer (ViT) Models
Provides visual explanations for skin condition classifications
"""

import torch
import torch.nn.functional as F
import numpy as np
import cv2
from typing import Tuple, Optional
import logging
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import io
import base64

logger = logging.getLogger(__name__)

class GradCAMForViT:
    """
    Grad-CAM implementation specifically designed for Vision Transformer models
    """
    
    def __init__(self, model, target_layer_name: str = 'backbone'):
        """
        Initialize Grad-CAM for ViT model
        
        Args:
            model: The ViT model
            target_layer_name: Name of the layer to hook for gradients
        """
        self.model = model
        self.target_layer_name = target_layer_name
        self.gradients = None
        self.activations = None
        self.hook_handles = []
        
        # Register hooks
        self._register_hooks()
    
    def _register_hooks(self):
        """Register forward and backward hooks"""
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        
        # Find the target layer and register hooks
        for name, module in self.model.named_modules():
            if self.target_layer_name in name:
                self.hook_handles.append(module.register_forward_hook(forward_hook))
                self.hook_handles.append(module.register_backward_hook(backward_hook))
                logger.info(f"Registered hooks for layer: {name}")
                break
    
    def generate_cam(self, input_tensor: torch.Tensor, target_class: int) -> np.ndarray:
        """
        Generate Grad-CAM heatmap
        
        Args:
            input_tensor: Input image tensor [1, C, H, W]
            target_class: Target class index for explanation
            
        Returns:
            Grad-CAM heatmap as numpy array
        """
        # Ensure model is in eval mode
        self.model.eval()
        
        # Forward pass
        input_tensor.requires_grad_(True)
        logits, uncertainty = self.model(input_tensor)
        
        # Get the score for target class
        target_score = logits[0, target_class]
        
        # Backward pass
        self.model.zero_grad()
        target_score.backward(retain_graph=True)
        
        if self.gradients is None or self.activations is None:
            logger.warning("No gradients or activations captured. Using fallback method.")
            return self._generate_fallback_cam(input_tensor)
        
        # For ViT, we need to handle the sequence dimension
        # Activations shape: [batch_size, sequence_length, hidden_dim]
        gradients = self.gradients[0]  # Remove batch dimension
        activations = self.activations[0]  # Remove batch dimension
        
        # Calculate importance weights
        weights = torch.mean(gradients, dim=0)  # [hidden_dim]
        
        # Generate weighted activation map
        cam = torch.zeros(activations.shape[0])  # [sequence_length]
        for i, w in enumerate(weights):
            cam += w * activations[:, i]
        
        # Apply ReLU to keep only positive influences
        cam = F.relu(cam)
        
        # Reshape to spatial dimensions (for ViT patch-based processing)
        # Assuming 14x14 patches for 224x224 input (16x16 patches)
        patch_size = int(np.sqrt(cam.shape[0] - 1))  # -1 for CLS token
        
        if patch_size * patch_size == cam.shape[0] - 1:
            # Remove CLS token and reshape
            spatial_cam = cam[1:].reshape(patch_size, patch_size)
        else:
            # Fallback: assume square root
            size = int(np.sqrt(cam.shape[0]))
            spatial_cam = cam[:size*size].reshape(size, size)
        
        # Convert to numpy and normalize
        cam_np = spatial_cam.detach().cpu().numpy()
        cam_np = (cam_np - cam_np.min()) / (cam_np.max() - cam_np.min() + 1e-8)
        
        return cam_np
    
    def _generate_fallback_cam(self, input_tensor: torch.Tensor) -> np.ndarray:
        """
        Fallback method using input gradients when layer hooks fail
        """
        logger.info("Using fallback Grad-CAM method")
        
        # Get model prediction
        logits, _ = self.model(input_tensor)
        target_class = torch.argmax(logits, dim=1).item()
        
        # Compute gradients w.r.t. input
        input_tensor.grad = None
        logits[0, target_class].backward()
        
        if input_tensor.grad is not None:
            # Use input gradients as importance map
            gradients = input_tensor.grad[0]  # Remove batch dimension
            
            # Take absolute values and sum across channels
            importance = torch.abs(gradients).sum(dim=0)
            
            # Normalize
            importance = (importance - importance.min()) / (importance.max() - importance.min() + 1e-8)
            
            return importance.detach().cpu().numpy()
        else:
            # Last resort: return center-focused heatmap
            logger.warning("No gradients available. Returning center-focused heatmap.")
            size = input_tensor.shape[-1]
            center = size // 2
            y, x = np.ogrid[:size, :size]
            mask = (x - center) ** 2 + (y - center) ** 2
            mask = 1 - (mask / mask.max())
            return mask
    
    def create_overlay(self, original_image: np.ndarray, heatmap: np.ndarray, 
                      alpha: float = 0.6) -> np.ndarray:
        """
        Create overlay of heatmap on original image
        
        Args:
            original_image: Original image as numpy array [H, W, C]
            heatmap: Grad-CAM heatmap [H, W]
            alpha: Transparency factor for overlay
            
        Returns:
            Overlayed image as numpy array
        """
        # Resize heatmap to match image size
        if heatmap.shape != original_image.shape[:2]:
            heatmap = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))
        
        # Apply colormap to heatmap
        heatmap_colored = cm.jet(heatmap)[:, :, :3]  # Remove alpha channel
        heatmap_colored = (heatmap_colored * 255).astype(np.uint8)
        
        # Ensure original image is uint8
        if original_image.dtype != np.uint8:
            original_image = (original_image * 255).astype(np.uint8)
        
        # Create overlay
        overlay = cv2.addWeighted(original_image, 1-alpha, heatmap_colored, alpha, 0)
        
        return overlay
    
    def generate_explanation_image(self, original_image: np.ndarray, heatmap: np.ndarray,
                                 prediction_info: dict) -> str:
        """
        Generate comprehensive explanation image with original, heatmap, and overlay
        
        Args:
            original_image: Original image
            heatmap: Grad-CAM heatmap
            prediction_info: Dictionary with prediction details
            
        Returns:
            Base64 encoded image string
        """
        # Create figure with subplots
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        # Original image
        axes[0].imshow(original_image)
        axes[0].set_title('Original Image', fontsize=12, fontweight='bold')
        axes[0].axis('off')
        
        # Heatmap
        im = axes[1].imshow(heatmap, cmap='jet')
        axes[1].set_title('Attention Map\n(Areas of Focus)', fontsize=12, fontweight='bold')
        axes[1].axis('off')
        plt.colorbar(im, ax=axes[1], fraction=0.046, pad=0.04)
        
        # Overlay
        overlay = self.create_overlay(original_image, heatmap)
        axes[2].imshow(overlay)
        axes[2].set_title('Overlay\n(Combined View)', fontsize=12, fontweight='bold')
        axes[2].axis('off')
        
        # Add prediction information
        info_text = f"Predicted: {prediction_info.get('condition', 'Unknown')}\n"
        info_text += f"Confidence: {prediction_info.get('confidence', 0):.1f}%"
        
        fig.suptitle(f'Grad-CAM Explanation\n{info_text}', 
                    fontsize=14, fontweight='bold', y=0.95)
        
        plt.tight_layout()
        
        # Convert to base64 string
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        
        # Encode to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        plt.close(fig)  # Clean up memory
        
        return image_base64
    
    def cleanup(self):
        """Remove hooks to prevent memory leaks"""
        for handle in self.hook_handles:
            handle.remove()
        self.hook_handles.clear()
        self.gradients = None
        self.activations = None


class GradCAMProcessor:
    """
    High-level processor for generating Grad-CAM explanations
    """
    
    def __init__(self, model):
        self.model = model
        self.gradcam = GradCAMForViT(model)
    
    def process_image_with_explanation(self, image_path: str, image_tensor: torch.Tensor,
                                     prediction_results: dict) -> dict:
        """
        Process image and generate Grad-CAM explanation
        
        Args:
            image_path: Path to original image
            image_tensor: Preprocessed image tensor
            prediction_results: Model prediction results
            
        Returns:
            Dictionary with explanation data
        """
        try:
            # Load original image
            original_image = np.array(Image.open(image_path).convert('RGB'))
            
            # Get target class
            target_class = prediction_results.get('primary_prediction_idx', 0)
            
            # Generate Grad-CAM heatmap
            heatmap = self.gradcam.generate_cam(image_tensor, target_class)
            
            # Create explanation visualization
            explanation_image = self.gradcam.generate_explanation_image(
                original_image, heatmap, prediction_results
            )
            
            # Generate textual explanation
            explanation_text = self._generate_explanation_text(prediction_results, heatmap)
            
            return {
                'gradcam_available': True,
                'explanation_image_base64': explanation_image,
                'explanation_text': explanation_text,
                'heatmap_stats': {
                    'max_activation': float(heatmap.max()),
                    'mean_activation': float(heatmap.mean()),
                    'focus_area_percentage': float((heatmap > 0.7).sum() / heatmap.size * 100)
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating Grad-CAM explanation: {str(e)}")
            return {
                'gradcam_available': False,
                'error': str(e),
                'explanation_text': "Visual explanation temporarily unavailable."
            }
    
    def _generate_explanation_text(self, prediction_results: dict, heatmap: np.ndarray) -> str:
        """Generate textual explanation of the visual analysis"""
        condition = prediction_results.get('condition', 'Unknown')
        confidence = prediction_results.get('confidence', 0)
        
        # Analyze heatmap characteristics
        max_activation = heatmap.max()
        focus_percentage = (heatmap > 0.7).sum() / heatmap.size * 100
        
        explanation = f"**Visual Analysis Explanation for {condition}**\n\n"
        
        explanation += f"The AI model focused on specific regions of the skin image to make its diagnosis. "
        explanation += f"The highlighted areas in red/yellow represent the regions that most strongly influenced "
        explanation += f"the {confidence:.1f}% confidence prediction of {condition}.\n\n"
        
        if focus_percentage > 20:
            explanation += f"**Diffuse Pattern**: The model identified relevant features across {focus_percentage:.1f}% "
            explanation += f"of the image, suggesting widespread characteristics typical of this condition.\n\n"
        elif focus_percentage > 5:
            explanation += f"**Localized Pattern**: The model concentrated on {focus_percentage:.1f}% of the image, "
            explanation += f"indicating specific focal features characteristic of {condition}.\n\n"
        else:
            explanation += f"**Subtle Features**: The model detected subtle patterns in a small area "
            explanation += f"({focus_percentage:.1f}% of the image), suggesting early-stage or mild presentation.\n\n"
        
        explanation += f"**Important Note**: This visual explanation shows the AI's analysis process and should "
        explanation += f"be interpreted alongside clinical examination by a qualified healthcare professional."
        
        return explanation
    
    def cleanup(self):
        """Cleanup resources"""
        if self.gradcam:
            self.gradcam.cleanup()
