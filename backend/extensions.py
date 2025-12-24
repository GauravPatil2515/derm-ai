from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request

# Initialize extensions
db = SQLAlchemy()

# Configure CORS with specific origins
cors = CORS(
    origins=[
        "http://localhost:5176", 
        "http://localhost:5177", 
        "http://localhost:5178",
        "https://gauravpatil2515.github.io"  # Production GitHub Pages
    ],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

def get_user_identifier():
    """
    Get user identifier for rate limiting.
    Uses Firebase UID if provided, otherwise falls back to IP.
    """
    # Check for user_id in request body (for POST)
    if request.method == 'POST' and request.is_json:
        data = request.get_json(silent=True)
        if data and 'user_id' in data and data['user_id'] != 'anonymous':
            return f"user:{data['user_id']}"
    
    # Check for user_id in query params (for GET)
    user_id = request.args.get('user_id')
    if user_id and user_id != 'anonymous':
        return f"user:{user_id}"
    
    # Fallback to IP address
    return get_remote_address()

# Initialize rate limiter with user-based limiting
limiter = Limiter(
    key_func=get_user_identifier,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Custom rate limit decorators
def user_rate_limit(limit_string):
    """Rate limit decorator that uses user ID."""
    return limiter.limit(limit_string, key_func=get_user_identifier)
