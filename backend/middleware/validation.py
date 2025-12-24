import re
from functools import wraps
from flask import request, jsonify
import bleach

def sanitize_text(text):
    if not isinstance(text, str):
        return text
    # Remove HTML tags using bleach
    clean_text = bleach.clean(text, tags=[], strip=True)
    # Basic SQL injection prevention (though ORM handles parameterization)
    clean_text = re.sub(r"['\";]", "", clean_text)
    return clean_text

def validate_image_upload(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        if not ('.' in file.filename and \
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, webp'}), 400
            
        return f(*args, **kwargs)
    return decorated_function

def sanitize_chat_input(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.get_json()
        if 'message' in data:
            data['message'] = sanitize_text(data['message'])
            
        return f(*args, **kwargs)
    return decorated_function
