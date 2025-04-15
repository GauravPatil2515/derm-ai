"""
DermAI - AI-Powered Dermatology Consultation Service
Version: 1.0.2
Created: 2025-03-31
Author: gaurav252005-ML
License: Proprietary
"""

import os
import logging
from datetime import datetime
from typing import Optional, Dict, List
from flask import Blueprint, request, jsonify
import groq
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv
from api.skin_analysis import db, ChatMessage

# Create Flask Blueprint
bp = Blueprint('chat', __name__)

# Load environment variables at module level
load_dotenv()

# Ensure logs directory exists
if not os.path.exists('logs'):
    os.makedirs('logs')

# Configure logging with both file and console handlers
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_format)
logger.addHandler(console_handler)

# File handler
file_handler = logging.FileHandler('logs/chat_debug.log')
file_handler.setLevel(logging.DEBUG)
file_format = logging.Formatter('%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s')
file_handler.setFormatter(file_format)
logger.addHandler(file_handler)

# ===================== CONFIGURATION =====================
class Config:
    # API and Service Configuration
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    MAX_RETRIES = 3
    MAX_CONVERSATION_HISTORY = 20
    
    # Service Info
    VERSION = "1.0.2"
    CURRENT_UTC_TIME = datetime.utcnow().isoformat()
    CURRENT_USER = "gaurav252005-ML"
    
    # Security
    API_KEY_NAME = "X-API-Key"
    API_KEY = os.getenv('SERVICE_API_KEY', "derm-ai-dev-key")
    
    # CORS Configuration
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:8000",
    ]

# ===================== DERMAI CLASS =====================
class DermAI:
    def __init__(self):
        """Initialize DermAI with configuration"""
        try:
            self.api_key = os.getenv('GROQ_API_KEY')
            if not self.api_key:
                logger.error("GROQ_API_KEY not found in environment variables")
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            logger.info("Initializing Groq client...")
            self.client = self._initialize_client()
            logger.info("Groq client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize DermAI: {str(e)}", exc_info=True)
            raise
        
    def _initialize_client(self) -> groq.Client:
        """Initialize and return the Groq client"""
        try:
            client = groq.Client(api_key=self.api_key)
            # Test the client connection
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": "Test connection"}],
                max_tokens=1
            )
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {str(e)}", exc_info=True)
            raise

    def _format_prompt(self, user_input: str) -> str:
        try:
            formatted_prompt = f"""As a dermatology AI assistant, provide helpful information about the following skin-related query. 
            Remember to:
            1. Stay within medical information boundaries
            2. Encourage consultation with healthcare providers
            3. Provide general educational information only
            4. Include relevant skincare best practices

            User Query: {user_input}
            """
            logger.debug(f"Formatted prompt: {formatted_prompt}")
            return formatted_prompt
        except Exception as e:
            logger.error(f"Error formatting prompt: {str(e)}", exc_info=True)
            raise

    def _get_user_history(self, user_id: str) -> List:
        """Get chat history from database"""
        try:
            logger.debug(f"Fetching chat history for user_id: {user_id}")
            messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.timestamp).all()
            history = [{"role": msg.role, "content": msg.content} for msg in messages]
            logger.debug(f"Found {len(history)} messages in history")
            return history
        except Exception as e:
            logger.error(f"Error retrieving chat history for user {user_id}: {str(e)}", exc_info=True)
            raise

    def _save_message(self, user_id: str, role: str, content: str):
        """Save message to database"""
        try:
            logger.debug(f"Saving message for user_id: {user_id}, role: {role}")
            message = ChatMessage(user_id=user_id, role=role, content=content)
            db.session.add(message)
            db.session.commit()
            logger.debug("Message saved successfully")
        except Exception as e:
            logger.error(f"Error saving message for user {user_id}: {str(e)}", exc_info=True)
            db.session.rollback()
            raise

    @retry(
        stop=stop_after_attempt(Config.MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def get_response(self, user_input: str, user_id: str) -> Dict[str, any]:
        try:
            logger.info(f"Processing chat request for user_id: {user_id}")
            
            # Validate input
            if not user_input.strip():
                raise ValueError("Empty user input")
                
            # Format prompt and get history
            formatted_prompt = self._format_prompt(user_input)
            history = self._get_user_history(user_id)
            
            logger.debug("Preparing messages for Groq API")
            messages = [
                {"role": "system", "content": "You are a dermatology AI assistant providing skin health information."},
                *history[-5:],  # Keep last 5 messages for context
                {"role": "user", "content": formatted_prompt}
            ]
            
            logger.info("Sending request to Groq API")
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            if not completion or not completion.choices:
                raise ValueError("No response received from Groq API")
                
            ai_response = completion.choices[0].message.content.strip()
            logger.debug(f"Received response from Groq API: {ai_response[:100]}...")
            
            # Save messages to database
            logger.info("Saving conversation to database")
            self._save_message(user_id, "user", user_input)
            self._save_message(user_id, "assistant", ai_response)
            
            return {
                "success": True,
                "response": ai_response,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
            
        except groq.error.AuthenticationError as e:
            logger.error(f"Groq API authentication error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": "Authentication error with AI service. Please check API key.",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
        except groq.error.APIConnectionError as e:
            logger.error(f"Groq API connection error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": "Unable to connect to AI service. Please try again later.",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
        except groq.error.RateLimitError as e:
            logger.error(f"Groq API rate limit error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": "Rate limit exceeded. Please try again in a few moments.",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
        except Exception as e:
            logger.error(f"Unexpected error in get_response: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": f"An unexpected error occurred: {str(e)}",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }

    def clear_conversation(self, user_id: str) -> Dict[str, any]:
        try:
            # Delete all messages for this user from the database
            ChatMessage.query.filter_by(user_id=user_id).delete()
            db.session.commit()
            
            return {
                "success": True,
                "message": "Conversation history cleared",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error clearing conversation: {e}")
            db.session.rollback()
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }

# Initialize DermAI instance
derm_ai = DermAI()

# ===================== ROUTES =====================
@bp.route('/chat', methods=['POST'])
def chat():
    try:
        logger.debug(f"Received chat request. Content-Type: {request.headers.get('Content-Type')}")
        logger.debug(f"Request data: {request.get_data(as_text=True)}")
        
        if not request.is_json:
            logger.error("Request Content-Type is not application/json")
            return jsonify({
                "success": False,
                "error": "Request must be JSON with Content-Type: application/json",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        data = request.get_json()
        logger.debug(f"Parsed JSON data: {data}")

        if not data:
            logger.error("Empty JSON body received")
            return jsonify({
                "success": False,
                "error": "Empty request body",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        if 'message' not in data or 'user_id' not in data:
            logger.error(f"Missing required fields. Received fields: {list(data.keys())}")
            return jsonify({
                "success": False,
                "error": "Missing required fields: message and user_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400
        
        response = derm_ai.get_response(data['message'], data['user_id'])
        logger.info(f"Chat response generated successfully for user_id: {data['user_id']}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error occurred",
            "details": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@bp.route('/chat/clear', methods=['POST'])
def clear_chat():
    try:
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: user_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400
        
        response = derm_ai.clear_conversation(data['user_id'])
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error clearing chat: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@bp.route('/chat/history', methods=['GET'])
def get_chat_history():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                "success": False,
                "error": "Missing required parameter: user_id",
                "timestamp": datetime.utcnow().isoformat()
            }), 400

        messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.timestamp).all()
        history = [{
            "id": str(msg.id),
            "role": msg.role,
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat()
        } for msg in messages]

        return jsonify({
            "success": True,
            "history": history,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@bp.route('/health', methods=['GET'])
def chat_health():
    try:
        # Test database connection
        ChatMessage.query.first()
        
        # Test GROQ API key
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment")

        return jsonify({
            "success": True,
            "status": "healthy",
            "database": "connected",
            "api": "configured",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Chat system health check failed: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500