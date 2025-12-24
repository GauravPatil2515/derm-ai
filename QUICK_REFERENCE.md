# DermAI Quick Reference

## 🚀 Quick Commands

### Start Application

```bash
# Windows (Automated)
.\start-derm-ai.ps1

# Manual (All platforms)
# Terminal 1:
cd backend && python app.py

# Terminal 2:
npm run dev
```

### Access URLs

- **Frontend**: <http://localhost:5176/derm-ai/>
- **Backend API**: <http://localhost:5002>
- **Health Check**: <http://localhost:5002/api/health>

---

## 📡 API Endpoints

### Health & Status

```bash
# Application health
curl http://localhost:5002/api/health

# Model status
curl http://localhost:5002/api/model-status

# Chat service health
curl http://localhost:5002/api/chat/health
```

### Analysis

```bash
# Analyze image
curl -X POST http://localhost:5002/api/analyze \
  -F "file=@image.jpg" \
  -F "user_id=test_user"

# Get analysis history
curl http://localhost:5002/api/analysis/history?user_id=test_user

# Get specific analysis
curl http://localhost:5002/api/analysis/<analysis_id>
```

### Chat

```bash
# Send message
curl -X POST http://localhost:5002/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is ringworm?", "user_id": "test_user"}'

# Get chat history
curl http://localhost:5002/api/chat/history?user_id=test_user

# Clear chat
curl -X POST http://localhost:5002/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'
```

---

## 🛠️ Development Commands

### Backend

```bash
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py

# Initialize database
python init_db.py

# Run tests
pytest tests/

# Format code
black .
flake8 .
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test
```

---

## 🐛 Troubleshooting

### Service Unavailable

```bash
# Check if model file exists
ls advanced_skin_disease_model.pth

# Check backend logs
cat backend/logs/app.log

# Verify model status
curl http://localhost:5002/api/model-status
```

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5002
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:5002 | xargs kill -9
```

### Database Issues

```bash
cd backend
rm instance/app.db  # Delete old database
python init_db.py   # Reinitialize
```

### CORS Errors

```bash
# Check CORS configuration in backend/config.py
# Verify both servers are running
# Clear browser cache
```

---

## 📁 Important Files

### Configuration

- `backend/.env` - Environment variables
- `backend/config.py` - Flask configuration
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS config

### Entry Points

- `backend/app.py` - Flask application
- `src/main.tsx` - React application
- `src/App.tsx` - Main React component

### Models

- `backend/models/chat.py` - Chat message model
- `backend/models/skin_analysis.py` - Analysis result model

### API

- `backend/api/skin_analysis.py` - Analysis engine
- `backend/api/derm_ai_chat.py` - Chat service

---

## 🔑 Environment Variables

Required in `backend/.env`:

```env
GROQ_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///instance/app.db
```

---

## 📊 Project Structure

```
derm-ai/
├── backend/          # Flask backend
│   ├── api/         # API endpoints
│   ├── models/      # Database models
│   ├── utils/       # Utilities
│   └── app.py       # Main application
├── src/             # React frontend
│   ├── components/  # React components
│   └── lib/         # Utilities
├── docs/            # Documentation
└── tests/           # Test files
```

---

## 🎯 Common Tasks

### Add New Skin Condition

1. Update model training data
2. Retrain model
3. Update `class_names` in `skin_analysis.py`
4. Update `DISEASE_INFO` in `src/lib/utils.ts`
5. Update documentation

### Add New API Endpoint

1. Create route in `backend/api/`
2. Register blueprint in `app.py`
3. Add tests
4. Update API documentation

### Add New Frontend Component

1. Create component in `src/components/`
2. Add TypeScript interfaces
3. Style with Tailwind
4. Add to routing if needed
5. Write tests

---

## 📞 Support

- **Docs**: [docs/SETUP.md](docs/SETUP.md)
- **Issues**: GitHub Issues
- **Email**: <gauravpatil2516@gmail.com>

---

**Last Updated**: December 2025
