import os
import sys
import logging
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# Add the current directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Set up logging
logger = logging.getLogger(__name__)

from config import Config
from extensions import db, cors, limiter
from api.derm_ai_chat import bp as chat_bp

def create_app(config_class=Config):
    # Initialize Flask app
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Ensure required directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['LOG_FILE']), exist_ok=True)
    os.makedirs(os.path.join(Config.BASE_DIR, 'instance'), exist_ok=True)
    
    # Initialize extensions
    db.init_app(app)
    cors.init_app(app)
    limiter.init_app(app)
    
    # Register blueprints
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    
    # Configure logging
    if not app.debug:
        file_handler = RotatingFileHandler(
            Config.LOG_FILE, 
            maxBytes=10240, 
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('DermAI startup')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

@app.route('/api/model-status')
def model_status():
    """Check model status without importing heavy dependencies"""
    try:
        # Check if the model file exists
        model_path = os.path.join(os.path.dirname(__file__), '..', 'advanced_skin_disease_model.pth')
        model_exists = os.path.exists(model_path)
        
        # Try basic imports
        try:
            import torch
            torch_available = True
            torch_version = torch.__version__
        except ImportError:
            torch_available = False
            torch_version = "Not available"
        
        try:
            import albumentations
            albumentations_available = True
            albumentations_version = albumentations.__version__
        except ImportError:
            albumentations_available = False
            albumentations_version = "Not available"
            
        try:
            import timm
            timm_available = True
            timm_version = timm.__version__
        except ImportError:
            timm_available = False
            timm_version = "Not available"
            
        # Try to import the analyzer
        try:
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
            from api.skin_analysis import DermatologyAnalyzer
            analyzer_import = True
            analyzer_error = None
        except Exception as e:
            analyzer_import = False
            analyzer_error = str(e)
            
        return jsonify({
            'status': 'available' if model_exists else 'unavailable',
            'model_file_exists': model_exists,
            'model_path': model_path,
            'torch_available': torch_available,
            'torch_version': torch_version,
            'albumentations_available': albumentations_available,
            'albumentations_version': albumentations_version,
            'timm_available': timm_available,
            'timm_version': timm_version,
            'analyzer_import': analyzer_import,
            'analyzer_error': analyzer_error,
            'python_path': sys.executable
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'python_path': sys.executable
        }), 500

@app.route('/api/health')
def health_check():
    """Enhanced health check endpoint with service status"""
    try:
        # Check model status using global analyzer
        global analyzer
        model_loaded = False
        if analyzer is not None:
            model_loaded = analyzer.is_model_loaded()
        
        # Check database connection
        database_connected = False
        try:
            from models.chat import ChatMessage
            ChatMessage.query.first()
            database_connected = True
        except:
            database_connected = False
        
        # Check upload folder
        upload_folder_ready = os.path.exists(app.config['UPLOAD_FOLDER']) and os.access(app.config['UPLOAD_FOLDER'], os.W_OK)
        
        return jsonify({
            'status': 'healthy',
            'message': 'Server is running',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model_loaded,
            'database_connected': database_connected,
            'upload_folder': upload_folder_ready
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'message': f'Health check failed: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': False,
            'database_connected': False,
            'upload_folder': False
        }), 500

@app.route('/api/test')
def test_route():
    """Simple test route"""
    return jsonify({
        'message': 'Test endpoint working',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """Analyze uploaded image using the global analyzer"""
    try:
        global analyzer
        
        # Check if analyzer is available
        if analyzer is None:
            return jsonify({
                'success': False,
                'error': 'Analysis service unavailable - model not loaded'
            }), 503
        
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Get user_id from form data
        user_id = request.form.get('user_id', 'anonymous')
        
        # Save the file temporarily
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the uploaded file
        file.save(filepath)
        
        try:
            # Process the analysis with the file path
            result = analyzer.analyze_image(filepath)
            
            # Generate analysis ID
            analysis_id = f"analysis_{timestamp}_{os.urandom(4).hex()}"
            
            # Save the analysis to database
            from models.skin_analysis import SkinAnalysisResult
            
            # Extract key information from result
            primary_analysis = result.get('primary_analysis', {})
            predicted_condition = primary_analysis.get('condition', 'Unknown')
            confidence_score = primary_analysis.get('confidence', 0) / 100  # Convert to decimal
            
            # Create database record
            analysis_record = SkinAnalysisResult(
                analysis_id=analysis_id,
                user_id=user_id,
                image_path=filepath,
                image_filename=unique_filename,
                analysis_data=json.dumps(result),
                predicted_condition=predicted_condition,
                confidence_score=confidence_score
            )
            
            db.session.add(analysis_record)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'result': {
                    'id': analysis_id,
                    'analysis': result
                }
            })
        
        except Exception as analysis_error:
            # Clean up file on analysis error
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except:
                pass
            raise analysis_error
    
    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/api/analysis/history', methods=['GET'])
def get_analysis_history():
    """Get analysis history for a user"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        # Query the database for user's analysis history
        from models.skin_analysis import SkinAnalysisResult
        
        analyses = SkinAnalysisResult.query.filter_by(user_id=user_id).order_by(
            SkinAnalysisResult.timestamp.desc()
        ).all()
        
        history = []
        for analysis in analyses:
            # Parse the analysis data
            try:
                analysis_data = json.loads(analysis.analysis_data) if analysis.analysis_data else {}
                primary_analysis = analysis_data.get('primary_analysis', {})
                
                history.append({
                    'id': analysis.analysis_id,
                    'timestamp': analysis.timestamp.isoformat(),
                    'primary_condition': primary_analysis.get('condition', 'Unknown'),
                    'confidence': primary_analysis.get('confidence', 0) / 100,  # Convert to decimal
                    'detailed_analysis': analysis_data.get('detailed_analysis', {}),
                    'image_preview': None  # Could add base64 thumbnail here if needed
                })
            except (json.JSONDecodeError, AttributeError) as e:
                # Skip malformed records
                continue
        
        return jsonify({
            'success': True,
            'history': history,
            'total_count': len(history)
        })
        
    except Exception as e:
        logger.error(f"Error fetching analysis history: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch analysis history: {str(e)}',
            'history': []
        }), 500

@app.route('/api/analysis/<analysis_id>', methods=['GET'])
def get_analysis_details(analysis_id):
    """Get detailed analysis results for a specific analysis"""
    try:
        from models.skin_analysis import SkinAnalysisResult
        
        analysis = SkinAnalysisResult.query.filter_by(analysis_id=analysis_id).first()
        
        if not analysis:
            return jsonify({
                'success': False,
                'error': 'Analysis not found'
            }), 404
        
        # Parse the analysis data
        try:
            analysis_data = json.loads(analysis.analysis_data) if analysis.analysis_data else {}
        except json.JSONDecodeError:
            analysis_data = {}
        
        return jsonify({
            'success': True,
            'result': analysis_data  # Return the analysis data directly as 'result'
        })
        
    except Exception as e:
        logger.error(f"Error fetching analysis details: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch analysis details: {str(e)}'
        }), 500

# Global variables for services
analyzer = None
analyzer_error = None

def initialize_analyzer():
    """Initialize the analyzer at startup"""
    global analyzer, analyzer_error
    try:
        from api.skin_analysis import DermatologyAnalyzer
        print("Initializing DermatologyAnalyzer...")
        analyzer = DermatologyAnalyzer()
        print(f"Analyzer initialized. Model loaded: {analyzer.is_model_loaded()}")
        analyzer_error = None
        return True
    except Exception as e:
        print(f"Failed to initialize analyzer: {str(e)}")
        analyzer = None
        analyzer_error = str(e)
        return False

if __name__ == '__main__':
    # Initialize analyzer before starting server
    print("=" * 50)
    print("Starting DermAI Backend Server")
    print("=" * 50)
    initialize_analyzer()
    
    port = int(os.environ.get('PORT', 5002))  # Use port 5002 as expected by frontend
    print(f"Starting Flask app on port {port}")
    print(f"Server will be available at: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)  # Disabled debug for stable testing