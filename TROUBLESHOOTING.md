# 🔧 DermAI Troubleshooting Guide

## ✅ Understanding Browser Console Messages

### 1. Chrome Extension Errors (IGNORE ✅)

```
chrome-extension://cmndjbecilbocjfkibfbifhngkdmjgog/...
chrome-extension://invalid/
```

**What**: Browser extensions (MetaMask, etc.) trying to inject code  
**Impact**: ❌ NONE - Not your application  
**Action**: ✅ **IGNORE COMPLETELY**

---

### 2. React DevTools Message (OPTIONAL ℹ️)

```
Download the React DevTools for a better development experience
```

**What**: React suggesting browser extension  
**Impact**: ❌ NONE - Just a suggestion  
**Action**: ✅ **IGNORE** or install React DevTools if you want

---

### 3. React Router Warnings (NOT URGENT ⚠️)

```
⚠️ React Router Future Flag Warning: v7_startTransition
⚠️ React Router Future Flag Warning: v7_relativeSplatPath
```

**What**: Warnings about React Router v7 changes  
**Impact**: ❌ NONE - App works fine  
**Action**: ✅ **CAN FIX LATER** (see below)

---

## ⚠️ ACTUAL ISSUE: Model Not Loading

### Problem

```json
{
  "model_loaded": false  ← THIS IS THE REAL ISSUE
}
```

### Why "Service Unavailable" Appears

The frontend checks if `model_loaded === true`. When it's `false`, it shows "Service unavailable".

---

## 🔍 Diagnosis Steps

### Step 1: Check Backend Health

```bash
curl http://localhost:5002/api/health
```

**Expected**:

```json
{
  "status": "healthy",
  "model_loaded": true,  ← Should be true
  "database_connected": true,
  "upload_folder": true
}
```

### Step 2: Check Model File

```bash
# Windows PowerShell
Get-Item "advanced_skin_disease_model.pth" | Select-Object Name, Length

# Expected output:
# Name: advanced_skin_disease_model.pth
# Length: 16362490 (about 16 MB)
```

### Step 3: Check Backend Logs

Look for these messages in the backend terminal:

```
✅ GOOD:
"Initializing DermatologyAnalyzer..."
"Model loaded successfully with 8 classes"
"Analyzer initialized. Model loaded: True"

❌ BAD:
"Model file not found"
"Error loading model"
"Failed to initialize analyzer"
```

---

## 🛠️ Solutions

### Solution 1: Verify Model File Location

```bash
# The model file MUST be in the project root
project/
├── advanced_skin_disease_model.pth  ← HERE!
├── backend/
├── src/
└── ...
```

**Fix if missing**:

```powershell
Copy-Item "c:\Users\GAURAV PATIL\Downloads\derm-ai-main\GAURAV_EfficientNet_Model.pth" -Destination "c:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project\advanced_skin_disease_model.pth"
```

### Solution 2: Restart Backend Properly

```bash
# Stop current backend (Ctrl+C in backend terminal)
# Then restart:
cd backend
python app.py
```

**Wait for**:

```
Initializing DermatologyAnalyzer...
Model loaded successfully with 8 classes
Analyzer initialized. Model loaded: True
```

### Solution 3: Check Python Dependencies

```bash
cd backend
pip install torch==2.2.1 torchvision==0.17.1
pip install timm==0.9.16
pip install albumentations==1.4.1
```

### Solution 4: Test Model Loading

```bash
cd backend
python test_model.py
```

**Expected output**:

```
============================================================
Testing Model File Loading
============================================================
✅ Model file exists (15.60 MB)
✅ Checkpoint loaded successfully
✅ Model file is valid and can be loaded!
```

---

## 🔧 Fix React Router Warnings (Optional)

### Update `src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router 
      basename="/derm-ai"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {/* ... rest of your code */}
    </Router>
  );
}
```

This will silence the warnings.

---

## 📊 Health Check Checklist

Run these commands to verify everything:

```powershell
# 1. Check model file
Get-Item "advanced_skin_disease_model.pth"

# 2. Check backend health
curl http://localhost:5002/api/health

# 3. Check model status
curl http://localhost:5002/api/model-status

# 4. Check frontend
curl http://localhost:5176/derm-ai/
```

**All should return 200 OK**

---

## 🎯 Quick Fix Script

Save this as `fix-service.ps1`:

```powershell
Write-Host "=== DermAI Service Fix ===" -ForegroundColor Cyan

# Check model file
Write-Host "`n1. Checking model file..." -ForegroundColor Yellow
if (Test-Path "advanced_skin_disease_model.pth") {
    $size = (Get-Item "advanced_skin_disease_model.pth").Length / 1MB
    Write-Host "   ✅ Model file found ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Model file NOT found!" -ForegroundColor Red
    Write-Host "   Copying from source..." -ForegroundColor Yellow
    Copy-Item "c:\Users\GAURAV PATIL\Downloads\derm-ai-main\GAURAV_EfficientNet_Model.pth" -Destination "advanced_skin_disease_model.pth"
    Write-Host "   ✅ Model file copied" -ForegroundColor Green
}

# Check backend
Write-Host "`n2. Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5002/api/health"
    if ($health.model_loaded) {
        Write-Host "   ✅ Backend healthy, model loaded" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend running but model NOT loaded" -ForegroundColor Yellow
        Write-Host "   Please restart backend: cd backend && python app.py" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Backend not responding" -ForegroundColor Red
    Write-Host "   Please start backend: cd backend && python app.py" -ForegroundColor White
}

# Check frontend
Write-Host "`n3. Checking frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5176/derm-ai/" -UseBasicParsing
    Write-Host "   ✅ Frontend running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend not responding" -ForegroundColor Red
    Write-Host "   Please start frontend: npm run dev" -ForegroundColor White
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Cyan
```

Run with:

```powershell
.\fix-service.ps1
```

---

## 🚨 Common Issues & Solutions

### Issue: "Service is currently unavailable"

**Cause**: `model_loaded: false`  
**Fix**: Restart backend, verify model file exists

### Issue: Backend won't start

**Cause**: Port 5002 already in use  
**Fix**:

```powershell
netstat -ano | findstr :5002
taskkill /PID <process_id> /F
```

### Issue: Model file not found

**Cause**: File in wrong location  
**Fix**: Copy to project root (not backend folder)

### Issue: Out of memory

**Cause**: Model too large for available RAM  
**Fix**: Close other applications, restart computer

---

## ✅ Success Indicators

When everything is working:

1. **Backend logs show**:

   ```
   Model loaded successfully with 8 classes
   Analyzer initialized. Model loaded: True
   ```

2. **Health check shows**:

   ```json
   {
     "model_loaded": true,
     "status": "healthy"
   }
   ```

3. **Frontend shows**:
   - No "Service unavailable" message
   - Upload interface is active
   - Can upload and analyze images

---

## 📞 Still Having Issues?

1. Check `backend/logs/app.log` for detailed errors
2. Run `python backend/test_model.py` to test model loading
3. Verify all dependencies: `pip list | grep -E "torch|timm|albumentations"`
4. Try the Supabase migration for better reliability

---

**Remember**: The browser console warnings about extensions and React Router are **NOT** the problem. The real issue is the model loading!
