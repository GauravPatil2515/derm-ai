from flask import Flask
from api.skin_analysis import db, ChatMessage, SkinAnalysisResult
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def init_database():
    try:
        # Get the absolute path to the instance directory
        base_dir = os.path.abspath(os.path.dirname(__file__))
        instance_dir = os.path.join(base_dir, 'instance')
        db_path = os.path.join(instance_dir, 'app.db')
        
        # Ensure instance directory exists with proper permissions
        os.makedirs(instance_dir, mode=0o755, exist_ok=True)
        logger.info(f"Instance directory created/verified at: {instance_dir}")
        
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        db.init_app(app)
        
        with app.app_context():
            # Create all database tables
            db.create_all()
            logger.info(f"Database created at: {db_path}")
            
            # Verify tables exist by querying them
            ChatMessage.query.first()
            SkinAnalysisResult.query.first()
            logger.info("Database tables verified successfully")
            
            return True
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = init_database()
    if success:
        print("Database initialized successfully")
    else:
        print("Failed to initialize database")
        exit(1)