# DermAI Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Python 3.10 or higher** - [Download](https://www.python.org/downloads/)
- **Node.js 18 or higher** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)

### Required API Keys

- **Groq API Key** - Get from [console.groq.com/keys](https://console.groq.com/keys)

### Required Model File

- **AI Model**: `advanced_skin_disease_model.pth` (~300MB)
- **Location**: Must be placed in the project root directory

---

## 🔧 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/derm-ai.git
cd derm-ai
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend
```

#### 2.2 Create Virtual Environment

**Windows:**

```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected installation time**: 5-10 minutes

#### 2.4 Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` file and add your Groq API key:

```env
GROQ_API_KEY=your_actual_groq_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

#### 2.5 Initialize Database

```bash
python init_db.py
```

You should see:

```
Database initialized successfully!
Tables created: chat_message, skin_analysis_result
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Project Root

```bash
cd ..  # Go back to project root
```

#### 3.2 Install Node Dependencies

```bash
npm install
```

**Expected installation time**: 2-5 minutes

### Step 4: Download AI Model

⚠️ **CRITICAL**: The application will not work without the AI model file.

1. Download `advanced_skin_disease_model.pth` from the provided source
2. Place it in the project root directory:

```
derm-ai/
├── advanced_skin_disease_model.pth  ← Place here
├── backend/
├── src/
└── ...
```

3. Verify the file is in the correct location:

```bash
# Windows
dir advanced_skin_disease_model.pth

# macOS/Linux
ls -lh advanced_skin_disease_model.pth
```

---

## 🚀 Running the Application

### Option 1: Automated Startup (Windows Only)

```powershell
.\start-derm-ai.ps1
```

This script will:

- Check if ports are available
- Start both backend and frontend servers
- Open the application in your browser
- Run health checks

### Option 2: Manual Startup (All Platforms)

You'll need **two terminal windows**:

#### Terminal 1 - Backend Server

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Start Flask server
python app.py
```

**Expected output:**

```
==================================================
Starting DermAI Backend Server
==================================================
Initializing DermatologyAnalyzer...
Using device: cpu
Attempting to load model from: C:\...\advanced_skin_disease_model.pth
Loaded class names: ('BA- cellulitis', 'BA-impetigo', ...)
Model loaded successfully with 8 classes
Analyzer initialized. Model loaded: True
Starting Flask app on port 5002
Server will be available at: http://localhost:5002
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5002
```

#### Terminal 2 - Frontend Server

```bash
# From project root
npm run dev
```

**Expected output:**

```
VITE v7.1.12  ready in 660 ms

➜  Local:   http://localhost:5176/derm-ai/
➜  Network: http://192.168.x.x:5176/derm-ai/
➜  press h + enter to show help
```

### Step 5: Access the Application

Open your browser and navigate to:

```
http://localhost:5176/derm-ai/
```

---

## ✅ Verification

### Health Checks

1. **Backend Health**:

```bash
curl http://localhost:5002/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_connected": true,
  "upload_folder": true
}
```

2. **Model Status**:

```bash
curl http://localhost:5002/api/model-status
```

3. **Chat Service**:

```bash
curl http://localhost:5002/api/chat/health
```

### Frontend Verification

1. Open <http://localhost:5176/derm-ai/>
2. You should see the landing page with:
   - "Welcome to DermAI" heading
   - Interactive chat demo
   - "Start Analysis" and "Chat" buttons
   - Skin conditions information grid

---

## 🐛 Troubleshooting

### Issue: "Service is currently unavailable"

**Cause**: AI model file is missing or not loaded

**Solution**:

1. Check if `advanced_skin_disease_model.pth` exists in project root
2. Check backend terminal for error messages
3. Verify model status: `curl http://localhost:5002/api/model-status`

### Issue: "Port already in use"

**Cause**: Another application is using port 5002 or 5176

**Solution**:

```bash
# Windows - Find and kill process
netstat -ano | findstr :5002
taskkill /PID <process_id> /F

# macOS/Linux
lsof -ti:5002 | xargs kill -9
```

### Issue: "Module not found" errors

**Cause**: Dependencies not installed correctly

**Solution**:

```bash
# Backend
cd backend
pip install -r requirements.txt --force-reinstall

# Frontend
npm install --force
```

### Issue: "Database error"

**Cause**: Database not initialized

**Solution**:

```bash
cd backend
python init_db.py
```

### Issue: "GROQ_API_KEY not set"

**Cause**: Environment variables not configured

**Solution**:

1. Check `.env` file exists in `backend/` directory
2. Verify `GROQ_API_KEY` is set correctly
3. Restart the backend server

### Issue: CORS errors in browser console

**Cause**: Frontend and backend not communicating

**Solution**:

1. Verify both servers are running
2. Check backend CORS configuration in `config.py`
3. Clear browser cache and reload

---

## 🔄 Updating the Application

### Update Dependencies

**Backend:**

```bash
cd backend
pip install -r requirements.txt --upgrade
```

**Frontend:**

```bash
npm update
```

### Pull Latest Changes

```bash
git pull origin main
```

Then repeat the setup steps for any new dependencies.

---

## 🛑 Stopping the Application

### Manual Stop

Press `Ctrl+C` in each terminal window running the servers

### Kill Processes (if needed)

**Windows:**

```powershell
# Find processes
netstat -ano | findstr :5002
netstat -ano | findstr :5176

# Kill processes
taskkill /PID <process_id> /F
```

**macOS/Linux:**

```bash
# Kill by port
lsof -ti:5002 | xargs kill -9
lsof -ti:5176 | xargs kill -9
```

---

## 📊 Performance Tips

### For Faster Model Loading

- Use SSD storage for the model file
- Ensure sufficient RAM (8GB+ recommended)
- Use GPU if available (CUDA-compatible)

### For Better Development Experience

- Use VS Code with Python and ESLint extensions
- Enable hot reload (already configured in Vite)
- Use browser DevTools for debugging

---

## 🎯 Next Steps

After successful setup:

1. **Test the Chat Feature**
   - Navigate to the Chat page
   - Ask questions about skin conditions
   - Verify AI responses are working

2. **Test Image Analysis**
   - Go to "Scan" page
   - Upload a test skin image
   - Verify analysis results appear

3. **Explore Grad-CAM**
   - After analysis, toggle between "Original" and "AI Focus"
   - View visual explanations

4. **Review Documentation**
   - Read API documentation in `docs/API.md`
   - Check deployment guide in `docs/DEPLOYMENT.md`

---

## 📧 Need Help?

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/yourusername/derm-ai/issues)
2. Review backend logs in `backend/logs/app.log`
3. Check browser console for frontend errors
4. Contact: <gauravpatil2516@gmail.com>

---

**Happy coding! 🚀**
