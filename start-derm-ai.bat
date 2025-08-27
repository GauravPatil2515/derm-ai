@echo off
echo ====================================
echo    DermAI Application Startup
echo ====================================
echo.

echo 🔧 Checking Python virtual environment...
cd /d "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project\backend"
if not exist "venv\Scripts\python.exe" (
    echo ❌ Virtual environment not found!
    echo Please create virtual environment first.
    pause
    exit /b 1
)

echo ✅ Virtual environment found.
echo.

echo 🚀 Starting Flask Backend Server...
echo Server will be available at: http://localhost:5002
echo.
start "DermAI Backend" cmd /k ".\venv\Scripts\Activate.ps1 && python app.py"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting React Frontend Server...
echo Server will be available at: http://localhost:5176/derm-ai/
echo.
cd /d "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project"
start "DermAI Frontend" cmd /k "npm run dev"

echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🧪 Testing server connectivity...
echo.
curl -s http://localhost:5002/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is responding
) else (
    echo ❌ Backend server is not responding
)

echo.
echo 📊 Server Status:
echo ================
echo Backend:  http://localhost:5002/api/health
echo Frontend: http://localhost:5176/derm-ai/
echo Test Page: file:///C:/Users/GAURAV%%20PATIL/Downloads/derm-ai-main/derm-ai-main/project/connectivity-test.html
echo.
echo 🎯 DermAI Application should now be running!
echo.
echo Press any key to open the application...
pause >nul

start "" "http://localhost:5176/derm-ai/"

echo.
echo Keep this window open to monitor server status.
echo Press Ctrl+C in the server windows to stop the servers.
pause
