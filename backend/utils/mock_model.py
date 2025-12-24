"""
Mock Model for DermAI - Demo Mode
This allows the application to run without the actual trained model file.
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class MockViTWithUncertainty(nn.Module):
    """Mock Vision Transformer model for demo purposes"""
    
    def __init__(self, num_classes=8):
        super(MockViTWithUncertainty, self).__init__()
        self.num_classes = num_classes
        
    def forward(self, x):
        """
        Mock forward pass - returns random predictions
        
        Args:
            x: Input tensor [B, C, H, W]
            
        Returns:
            logits: Class predictions [B, num_classes]
            uncertainty: Uncertainty estimates [B, 1]
        """
        batch_size = x.shape[0]
        
        # Generate mock predictions with some randomness
        logits = torch.randn(batch_size, self.num_classes)
        
        # Make one class more likely (simulate prediction)
        primary_class = np.random.randint(0, self.num_classes)
        logits[0, primary_class] += 2.0  # Boost primary prediction
        
        # Generate mock uncertainty
        uncertainty = torch.rand(batch_size, 1) * 0.3  # Low uncertainty
        
        return logits, uncertainty


def create_mock_model(num_classes=8):
    """
    Create a mock model for demo purposes
    
    Args:
        num_classes: Number of skin condition classes
        
    Returns:
        Mock model instance
    """
    logger.warning("=" * 60)
    logger.warning("RUNNING IN DEMO MODE - USING MOCK MODEL")
    logger.warning("Predictions are randomly generated for demonstration only")
    logger.warning("Download the actual model file for real predictions")
    logger.warning("=" * 60)
    
    model = MockViTWithUncertainty(num_classes=num_classes)
    model.eval()
    
    return model


def get_mock_checkpoint():
    """
    Create a mock checkpoint with class mappings
    
    Returns:
        Dictionary with model metadata
    """
    class_names = [
        'BA- cellulitis',
        'BA-impetigo', 
        'FU-athlete-foot',
        'FU-nail-fungus',
        'FU-ringworm',
        'PA-cutaneous-larva-migrans',
        'VI-chickenpox',
        'VI-shingles'
    ]
    
    class_to_idx = {name: idx for idx, name in enumerate(class_names)}
    idx_to_class = {idx: name for idx, name in enumerate(class_names)}
    
    return {
        'class_to_idx': class_to_idx,
        'idx_to_class': idx_to_class,
        'model_state_dict': None,  # Not needed for mock
        'demo_mode': True
    }
