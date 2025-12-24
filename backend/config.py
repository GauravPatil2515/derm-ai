import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database configuration
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "instance", "skin_analysis.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # API configuration
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    
    # File upload configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # API rate limiting
    RATELIMIT_DEFAULT = "200 per day"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5176').split(',')
    
    # Model configuration
    MODEL_PATH = os.path.join(BASE_DIR, '..', 'advanced_skin_disease_model.pth')
    
    # Logging configuration
    LOG_LEVEL = 'INFO' if FLASK_ENV == 'production' else 'DEBUG'
    LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'
    LOG_FILE = os.path.join(BASE_DIR, 'logs', 'app.log')
    CHAT_LOG_FILE = os.path.join(BASE_DIR, 'logs', 'chat_debug.log')
