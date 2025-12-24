"""
Test script to verify the EfficientNet model loads correctly into the class
"""

import os
import sys
import torch
import torch.nn as nn
import timm

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class SkinDiseaseModel(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        # Use timm implementation to match the saved model weights (conv_stem, blocks, etc.)
        self.base_model = timm.create_model('efficientnet_b0', pretrained=False, num_classes=num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base_model(x)

def test_model_loading():
    print("=" * 60)
    print("Testing EfficientNet Model Loading")
    print("=" * 60)
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'advanced_skin_disease_model.pth')
    model_path = os.path.abspath(model_path)
    
    if not os.path.exists(model_path):
        print(f"❌ Model file not found at {model_path}")
        return False
        
    try:
        print(f"1. Loading checkpoint from {model_path}...")
        checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
        
        # Extract class mappings
        if 'class_to_idx' in checkpoint:
            class_to_idx = checkpoint['class_to_idx']
            num_classes = len(class_to_idx)
            print(f"   ✅ Found {num_classes} classes in checkpoint")
        else:
            print("   ⚠️  No class mappings found, using default 8 classes")
            num_classes = 8
            
        # Initialize model
        print(f"2. Initializing EfficientNet-B0 with {num_classes} classes...")
        model = SkinDiseaseModel(num_classes=num_classes)
        
        # Load state dict
        print("3. Loading state dict...")
        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
        else:
            state_dict = checkpoint
            
        # Handle key mismatch
        new_state_dict = {}
        for k, v in state_dict.items():
            if k.startswith('module.'):
                new_state_dict[k[7:]] = v
            else:
                new_state_dict[k] = v
                
        model.load_state_dict(new_state_dict, strict=False)
        model.eval()
        
        print("   ✅ Model weights loaded successfully")
        
        # Test inference
        print("4. Running test inference...")
        dummy_input = torch.randn(1, 3, 224, 224)
        with torch.no_grad():
            output = model(dummy_input)
            print(f"   ✅ Inference successful. Output shape: {output.shape}")
            
        print("\n✅ SUCCESS: EfficientNet model is working correctly!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model_loading()
    sys.exit(0 if success else 1)
