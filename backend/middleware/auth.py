import os
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from flask import request, jsonify, g

# Initialize Firebase Admin
# Note: In production, use environment variables for credentials
cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    # Fallback/Dev mode - initialize without credentials (limited functionality)
    # or skip initialization if running locally without service account
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app()

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip verification in development if configured
        if os.getenv('FLASK_ENV') == 'development' and os.getenv('SKIP_AUTH_VERIFICATION') == 'true':
            g.user_id = request.headers.get('X-User-ID', 'anonymous')
            return f(*args, **kwargs)

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header provided'}), 401
        
        try:
            # Bearer <token>
            token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(token)
            g.user_id = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
            
    return decorated_function

def optional_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                decoded_token = auth.verify_id_token(token)
                g.user_id = decoded_token['uid']
            except:
                g.user_id = 'anonymous'
        else:
            g.user_id = request.args.get('user_id', 'anonymous')
        return f(*args, **kwargs)
    return decorated_function
