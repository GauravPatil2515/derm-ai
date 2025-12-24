# DermAI Backend Redesign & Supabase Migration Plan

## 🎯 Current Issues Identified

### Problems

1. ❌ Frontend shows "Service unavailable" despite backend running
2. ❌ SQLite database not suitable for production
3. ❌ No proper API error handling
4. ❌ Service health check inconsistencies
5. ❌ No scalable file storage
6. ❌ Limited database features

### Root Causes

- Frontend ServiceContext may be checking wrong endpoint
- CORS configuration issues
- Database connection timing issues
- No centralized error handling

---

## 🚀 New Backend Architecture with Supabase

### Why Supabase?

- ✅ PostgreSQL database (production-ready)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ File storage (for images)
- ✅ Auto-generated REST API
- ✅ Row-level security
- ✅ Free tier available

### New Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│              http://localhost:5176                   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│              Flask Backend (Redesigned)              │
│              http://localhost:5002                   │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │         API Routes (Blueprint-based)          │  │
│  │  • /api/v1/health                            │  │
│  │  • /api/v1/analysis                          │  │
│  │  • /api/v1/chat                              │  │
│  │  • /api/v1/user                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │         Services Layer                        │  │
│  │  • AnalysisService                           │  │
│  │  • ChatService                               │  │
│  │  • StorageService                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │         Error Handling Middleware             │  │
│  │  • Global error handler                      │  │
│  │  • Request validation                        │  │
│  │  • Response formatting                       │  │
│  └──────────────────────────────────────────────┘  │
└───────────────┬───────────────┬─────────────────────┘
                │               │
                ↓               ↓
    ┌───────────────────┐   ┌──────────────────┐
    │    Supabase       │   │   Groq AI API    │
    │                   │   │                  │
    │  • PostgreSQL DB  │   │  • Chat Service  │
    │  • File Storage   │   │                  │
    │  • Auth           │   └──────────────────┘
    └───────────────────┘
```

---

## 📋 Migration Steps

### Phase 1: Supabase Setup

1. Create Supabase project
2. Set up database schema
3. Configure storage buckets
4. Get API keys

### Phase 2: Backend Redesign

1. Restructure Flask app
2. Implement Supabase client
3. Create service layer
4. Add error handling
5. Update API endpoints

### Phase 3: Database Migration

1. Export existing data
2. Import to Supabase
3. Update models
4. Test connections

### Phase 4: Frontend Updates

1. Update API endpoints
2. Fix service context
3. Add proper error handling
4. Test integration

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

### Tables

#### 1. `users` (Optional - for future auth)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `skin_analyses`

```sql
CREATE TABLE skin_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    image_filename VARCHAR(255),
    predicted_condition VARCHAR(100),
    confidence_score DECIMAL(5,4),
    analysis_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX idx_skin_analyses_created_at ON skin_analyses(created_at DESC);
```

#### 3. `chat_messages`

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

---

## 📁 New Backend Structure

```
backend/
├── app.py                      # Main Flask application
├── config.py                   # Configuration
├── requirements.txt            # Dependencies
│
├── api/                        # API Routes (Blueprints)
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── health.py          # Health check endpoints
│   │   ├── analysis.py        # Analysis endpoints
│   │   ├── chat.py            # Chat endpoints
│   │   └── user.py            # User endpoints
│
├── services/                   # Business Logic
│   ├── __init__.py
│   ├── analysis_service.py    # AI analysis logic
│   ├── chat_service.py        # Chat logic
│   ├── storage_service.py     # File storage
│   └── supabase_client.py     # Supabase connection
│
├── models/                     # Data Models
│   ├── __init__.py
│   ├── analysis.py            # Analysis model
│   └── chat.py                # Chat model
│
├── utils/                      # Utilities
│   ├── __init__.py
│   ├── errors.py              # Custom exceptions
│   ├── validators.py          # Input validation
│   ├── responses.py           # Response formatting
│   └── gradcam.py             # Grad-CAM (existing)
│
└── middleware/                 # Middleware
    ├── __init__.py
    ├── error_handler.py       # Global error handling
    ├── cors.py                # CORS configuration
    └── rate_limiter.py        # Rate limiting
```

---

## 🔧 Implementation Details

### 1. Supabase Client Setup

```python
# services/supabase_client.py
from supabase import create_client, Client
import os

class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.client: Client = create_client(url, key)
    
    def get_client(self) -> Client:
        return self.client
```

### 2. Analysis Service

```python
# services/analysis_service.py
class AnalysisService:
    def __init__(self, supabase_client, storage_service):
        self.supabase = supabase_client
        self.storage = storage_service
        self.analyzer = DermatologyAnalyzer()
    
    async def analyze_image(self, file, user_id):
        # Upload to Supabase Storage
        image_url = await self.storage.upload_image(file)
        
        # Run AI analysis
        result = self.analyzer.analyze_image(file)
        
        # Save to database
        data = {
            'user_id': user_id,
            'image_url': image_url,
            'predicted_condition': result['primary_analysis']['condition'],
            'confidence_score': result['primary_analysis']['confidence'] / 100,
            'analysis_data': result
        }
        
        response = self.supabase.table('skin_analyses').insert(data).execute()
        return response.data[0]
```

### 3. Error Handling

```python
# middleware/error_handler.py
from flask import jsonify

class APIError(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

def handle_api_error(error):
    response = {
        'success': False,
        'error': error.message,
        'status_code': error.status_code
    }
    if error.payload:
        response['details'] = error.payload
    return jsonify(response), error.status_code
```

### 4. Response Formatting

```python
# utils/responses.py
def success_response(data, message=None):
    return {
        'success': True,
        'data': data,
        'message': message
    }

def error_response(message, details=None):
    return {
        'success': False,
        'error': message,
        'details': details
    }
```

---

## 🔐 Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:5176,http://localhost:5173
```

---

## 📊 API Endpoints (Redesigned)

### Health Check

```
GET /api/v1/health
Response: {
    "success": true,
    "data": {
        "status": "healthy",
        "model_loaded": true,
        "database_connected": true,
        "storage_available": true
    }
}
```

### Analysis

```
POST /api/v1/analysis
Body: FormData { file, user_id }
Response: {
    "success": true,
    "data": {
        "id": "uuid",
        "analysis": {...}
    }
}

GET /api/v1/analysis/history?user_id=xxx
Response: {
    "success": true,
    "data": {
        "analyses": [...],
        "total": 10
    }
}

GET /api/v1/analysis/:id
Response: {
    "success": true,
    "data": {
        "analysis": {...}
    }
}
```

### Chat

```
POST /api/v1/chat
Body: { message, user_id }
Response: {
    "success": true,
    "data": {
        "response": "...",
        "timestamp": "..."
    }
}
```

---

## ✅ Benefits of New Architecture

1. **Scalability**
   - PostgreSQL handles millions of records
   - Supabase auto-scales
   - Cloud storage for images

2. **Reliability**
   - Built-in backups
   - High availability
   - Real-time monitoring

3. **Security**
   - Row-level security
   - API key management
   - Secure file storage

4. **Developer Experience**
   - Clear separation of concerns
   - Easy to test
   - Well-documented APIs

5. **Performance**
   - Faster queries
   - CDN for images
   - Connection pooling

---

## 🚀 Quick Start (After Migration)

```bash
# 1. Install dependencies
pip install supabase-py

# 2. Set environment variables
cp .env.example .env
# Edit .env with Supabase credentials

# 3. Run migrations
python migrate_to_supabase.py

# 4. Start server
python app.py
```

---

## 📝 Next Steps

1. **Create Supabase Project** (5 min)
2. **Implement New Backend** (2-3 hours)
3. **Migrate Data** (30 min)
4. **Update Frontend** (1 hour)
5. **Test Everything** (1 hour)
6. **Deploy** (30 min)

**Total Estimated Time: 5-6 hours**

---

*This migration will make DermAI production-ready and scalable!*
