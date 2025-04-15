from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from prometheus_flask_exporter import PrometheusMetrics
import os
import json
import time
import logging
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
from api.skin_analysis import DermatologyAnalyzer, db, ChatMessage, SkinAnalysisResult
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64
from api.derm_ai_chat import bp as chat_bp
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10485760, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
logger.addHandler(file_handler)
logger.setLevel(logging.INFO)
logger.info('DermAI startup')

# Create instance directory if it doesn't exist
instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)
    logger.info(f"Created instance directory at {instance_path}")

app = Flask(__name__)

# Initialize Prometheus metrics
metrics = PrometheusMetrics(app)
metrics.info('app_info', 'Application info', version='1.0.0')

# Custom metrics
by_endpoint_counter = metrics.counter(
    'by_endpoint_counter', 'Request count by endpoint',
    labels={'endpoint': lambda: request.endpoint}
)

model_prediction_latency = metrics.histogram(
    'model_prediction_latency_seconds',
    'Time spent processing model predictions',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

database_operation_latency = metrics.histogram(
    'database_operation_latency_seconds',
    'Time spent on database operations',
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5]
)

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Database configuration
db_path = os.path.join(instance_path, 'app.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Enable SQL logging

# Initialize database with app
db.init_app(app)

# Configure CORS
CORS(app, resources={
    r"/*": {  # Allow all routes
        "origins": ["http://localhost:5176"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "max_age": 600,
        "supports_credentials": True
    }
})

try:
    # Register the chat blueprint with the correct URL prefix
    app.register_blueprint(chat_bp, url_prefix='/chat')
    logger.info("Chat blueprint registered successfully")
except Exception as e:
    logger.error(f"Error registering chat blueprint: {e}")
    raise

# Initialize the analyzer within app context
with app.app_context():
    try:
        # Create database tables
        db.create_all()
        logger.info("Database tables created successfully")
        
        # Initialize the analyzer
        analyzer = DermatologyAnalyzer()
        if analyzer.is_model_loaded():
            logger.info("Model initialized successfully")
        else:
            logger.error("Model initialization failed")
            
    except Exception as e:
        logger.error(f"Error during initialization: {str(e)}")
        raise

# Debug route to list all registered routes
@app.route('/debug/routes')
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            "endpoint": rule.endpoint,
            "methods": list(rule.methods),
            "path": str(rule)
        })
    return jsonify(routes)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_IMAGE_SIZE

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file_path):
    try:
        with Image.open(file_path) as img:
            # Validate image dimensions
            if any(dim > 4096 for dim in img.size):
                return False, "Image dimensions too large. Maximum dimension is 4096px."
            
            # Validate image format
            if img.format.lower() not in ['jpeg', 'jpg', 'png']:
                return False, "Invalid image format. Only JPEG and PNG are supported."
            
            # Basic image quality check
            if img.mode not in ['RGB', 'RGBA']:
                return False, "Invalid image mode. Only RGB images are supported."
            
            return True, None
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"

def create_image_preview(file_path, max_size=(800, 800)):
    try:
        with Image.open(file_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize image while maintaining aspect ratio
            img.thumbnail(max_size)
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr = img_byte_arr.getvalue()
            
            # Convert to base64
            return base64.b64encode(img_byte_arr).decode()
    except Exception as e:
        logger.error(f"Error creating image preview: {str(e)}")
        return None

@app.route('/api/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'}), 400
        
        file = request.files['image']
        user_id = request.form.get('user_id', 'anonymous')
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400
        
        # Check file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400

        # Save and validate file
        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(filepath)
            is_valid, error_msg = validate_image(filepath)
            
            if not is_valid:
                os.remove(filepath)
                return jsonify({'success': False, 'error': error_msg}), 400
                
            # Analyze image
            result = analyzer.analyze_image(filepath)
            
            # Store analysis in database
            analysis = SkinAnalysisResult(
                user_id=user_id,
                image_path=filepath,
                primary_condition=result['primary_analysis']['condition'],
                confidence=result['primary_analysis']['confidence'],
                detailed_analysis=json.dumps(result['detailed_analysis'])
            )
            
            db.session.add(analysis)
            db.session.commit()
            
            # Add analysis ID to result
            result['id'] = str(analysis.id)
            
            return jsonify({
                'success': True,
                'result': result,
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
            
        finally:
            # Clean up temporary files
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/init', methods=['POST'])
def initialize_system():
    try:
        with app.app_context():
            # Create all database tables
            db.create_all()
            
            # Verify database connection
            ChatMessage.query.first()
            SkinAnalysisResult.query.first()
            
            # Check model initialization
            model_status = analyzer.is_model_loaded()
            
            # Check upload directory
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            return jsonify({
                'status': 'success',
                'database': 'connected',
                'model_loaded': model_status,
                'upload_folder': os.path.exists(app.config['UPLOAD_FOLDER']),
                'message': 'System initialized successfully'
            })
    except Exception as e:
        logger.error(f"Initialization error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Initialization failed: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
@limiter.limit("30 per minute")
def health_check():
    try:
        # Check database connection
        db_status = False
        try:
            ChatMessage.query.first()
            SkinAnalysisResult.query.first()
            db_status = True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")

        model_loaded = analyzer.is_model_loaded()
        return jsonify({
            'status': 'healthy' if (model_loaded and db_status) else 'unhealthy',
            'model_loaded': model_loaded,
            'database_connected': db_status,
            'upload_folder': os.path.exists(app.config['UPLOAD_FOLDER'])
        })
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/api/analysis/history', methods=['GET'])
def get_analysis_history():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing required parameter: user_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        analyses = SkinAnalysisResult.query.filter_by(user_id=user_id).order_by(SkinAnalysisResult.timestamp.desc()).all()
        history = [{
            "id": str(analysis.id),
            "timestamp": analysis.timestamp.isoformat(),
            "primary_condition": analysis.primary_condition,
            "confidence": analysis.confidence,
            "detailed_analysis": json.loads(analysis.detailed_analysis)
        } for analysis in analyses]

        return jsonify({
            "success": True,
            "history": history,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"Error retrieving analysis history: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/api/analysis/delete', methods=['POST'])
def delete_analysis():
    try:
        data = request.get_json()
        if not data or 'analysis_id' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: analysis_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        analysis = SkinAnalysisResult.query.get(data['analysis_id'])
        if not analysis:
            return jsonify({
                "success": False,
                "error": "Analysis not found",
                "timestamp": datetime.utcnow().isoformat()
            }), 404

        db.session.delete(analysis)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Analysis deleted successfully",
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"Error deleting analysis: {e}")
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/api/system/status', methods=['GET'])
def system_status():
    """Check the status of all system components"""
    try:
        status = {
            'chat_service': {
                'status': 'unknown',
                'message': None
            },
            'analysis_service': {
                'status': 'unknown',
                'message': None
            },
            'database': {
                'status': 'unknown',
                'message': None
            }
        }

        # Check database connection
        try:
            ChatMessage.query.first()
            SkinAnalysisResult.query.first()
            status['database'] = {
                'status': 'healthy',
                'message': 'Database connection verified'
            }
        except Exception as e:
            status['database'] = {
                'status': 'error',
                'message': f'Database error: {str(e)}'
            }

        # Check skin analysis model
        try:
            if analyzer.is_model_loaded():
                status['analysis_service'] = {
                    'status': 'healthy',
                    'message': 'Skin analysis model loaded and ready'
                }
            else:
                status['analysis_service'] = {
                    'status': 'error',
                    'message': 'Skin analysis model not loaded'
                }
        except Exception as e:
            status['analysis_service'] = {
                'status': 'error',
                'message': f'Model error: {str(e)}'
            }

        # Check chat service
        try:
            groq_key = os.getenv('GROQ_API_KEY')
            if groq_key:
                status['chat_service'] = {
                    'status': 'healthy',
                    'message': 'Chat service configured'
                }
            else:
                status['chat_service'] = {
                    'status': 'error',
                    'message': 'Missing GROQ API key'
                }
        except Exception as e:
            status['chat_service'] = {
                'status': 'error',
                'message': f'Chat service error: {str(e)}'
            }

        overall_status = all(s['status'] == 'healthy' for s in status.values())
        
        return jsonify({
            'success': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'services': status
        })

    except Exception as e:
        logger.error(f"System status check failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def get_analysis_details(analysis_id):
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing required parameter: user_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        analysis = SkinAnalysisResult.query.filter_by(
            id=analysis_id,
            user_id=user_id
        ).first()

        if not analysis:
            return jsonify({
                "success": False,
                "error": "Analysis not found",
                "timestamp": datetime.utcnow().isoformat()
            }), 404

        result = {
            "id": str(analysis.id),
            "timestamp": analysis.timestamp.isoformat(),
            "primary_condition": analysis.primary_condition,
            "confidence": analysis.confidence,
            "detailed_analysis": json.loads(analysis.detailed_analysis),
        }

        # Try to get the image preview if it exists
        try:
            image_preview = create_image_preview(analysis.image_path)
            if image_preview:
                result["image_preview"] = image_preview
        except Exception as e:
            logger.warning(f"Failed to create image preview: {e}")

        return jsonify({
            "success": True,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"Error retrieving analysis details: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    logger.warning(f"Rate limit exceeded for IP {get_remote_address()}")
    return jsonify({
        "success": False,
        "error": "Rate limit exceeded. Please try again later.",
        "timestamp": datetime.utcnow().isoformat()
    }), 429

@app.before_request
def before_request():
    request._start_time = datetime.utcnow()

@app.after_request
def after_request(response):
    if hasattr(request, '_start_time'):
        elapsed = datetime.utcnow() - request._start_time
        logger.info('Request completed', extra={
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'duration': elapsed.total_seconds(),
            'ip': request.remote_addr
        })
    return response

def init_app():
    """Initialize the application"""
    try:
        # Create database tables
        with app.app_context():
            db.create_all()
            logger.info("Database tables created successfully")

        # Initialize the analyzer
        global analyzer
        analyzer = DermatologyAnalyzer()
        
        # Initialize database-related operations
        analyzer.initialize_with_app(app)
        
        # Ensure upload directory exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        logger.info(f"Upload directory initialized: {app.config['UPLOAD_FOLDER']}")
        
        # Test database connections
        with app.app_context():
            max_retries = 3
            retry_delay = 5  # seconds
            
            for attempt in range(max_retries):
                try:
                    ChatMessage.query.first()
                    SkinAnalysisResult.query.first()
                    logger.info("Database connections verified")
                    return True
                except Exception as e:
                    if attempt < max_retries - 1:
                        logger.warning(f"Database initialization attempt {attempt + 1} failed: {str(e)}")
                        time.sleep(retry_delay)
                    else:
                        logger.error(f"Database initialization failed after {max_retries} attempts: {str(e)}")
                        return False
            
        return True
    except Exception as e:
        logger.error(f"Application initialization failed: {e}", exc_info=True)
        return False

def scheduled_cleanup():
    """Periodic cleanup and health check task"""
    with app.app_context():
        try:
            # Cleanup old records
            analyzer._cleanup_old_records()
            
            # Check database connections
            ChatMessage.query.first()
            SkinAnalysisResult.query.first()
            
            # Verify model status
            analyzer.is_model_loaded()
            
            logger.info("Scheduled health check and cleanup completed successfully")
        except Exception as e:
            logger.error(f"Scheduled task failed: {e}")

def start_scheduler():
    """Start the background scheduler for periodic tasks"""
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=scheduled_cleanup,
        trigger=IntervalTrigger(hours=24),  # Run once per day
        id='cleanup_task',
        name='Daily cleanup and health check',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Background scheduler started")

if __name__ == '__main__':
    if init_app():
        start_scheduler()  # Start the background scheduler
        app.run(debug=True, port=5001)
    else:
        logger.error("Failed to initialize application. Exiting...")
        exit(1)