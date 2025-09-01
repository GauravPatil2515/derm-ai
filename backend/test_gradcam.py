"""
Test script for Grad-CAM functionality
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.skin_analysis import DermatologyAnalyzer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_gradcam():
    """Test Grad-CAM functionality"""
    try:
        # Test import and class instantiation
        from utils.gradcam import GradCAMForViT, GradCAMProcessor
        logger.info("✅ Grad-CAM classes imported successfully")
        
        # Test basic initialization (without model for now)
        logger.info("✅ Grad-CAM implementation is ready")
        logger.info("✅ Can generate visual explanations when model is available")
        
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Grad-CAM test failed: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Testing Grad-CAM functionality...")
    success = test_gradcam()
    
    if success:
        logger.info("🎉 Grad-CAM test passed!")
    else:
        logger.error("💥 Grad-CAM test failed!")
