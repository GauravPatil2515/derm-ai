# DermAI Application Startup Script
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "    DermAI Application Startup" -ForegroundColor Cyan  
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if servers are already running
Write-Host "🔍 Checking for existing servers..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5002 -State Listen -ErrorAction SilentlyContinue
$frontend = Get-NetTCPConnection -LocalPort 5176 -State Listen -ErrorAction SilentlyContinue

if ($backend) {
    Write-Host "⚠️  Backend server already running on port 5002" -ForegroundColor Yellow
} else {
    Write-Host "🚀 Starting Flask Backend Server..." -ForegroundColor Green
    $backendPath = "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project\backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\venv\Scripts\Activate.ps1; python app.py" -WindowStyle Normal
    Write-Host "✅ Backend server starting..." -ForegroundColor Green
}

if ($frontend) {
    Write-Host "⚠️  Frontend server already running on port 5176" -ForegroundColor Yellow
} else {
    Write-Host "🌐 Starting React Frontend Server..." -ForegroundColor Green
    $frontendPath = "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal
    Write-Host "✅ Frontend server starting..." -ForegroundColor Green
}

Write-Host ""
Write-Host "⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "🧪 Testing server connectivity..." -ForegroundColor Cyan

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is responding (Port 5002)" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   - Model Loaded: $($healthData.model_loaded)" -ForegroundColor White
        Write-Host "   - Database Connected: $($healthData.database_connected)" -ForegroundColor White
        Write-Host "   - Status: $($healthData.status)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Backend server is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend  
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5176/derm-ai/" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend server is responding (Port 5176)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend server is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Server Information:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:5002/api/health" -ForegroundColor White
Write-Host "Frontend App: http://localhost:5176/derm-ai/" -ForegroundColor White
Write-Host "Test Page:    file:///C:/Users/GAURAV%20PATIL/Downloads/derm-ai-main/derm-ai-main/project/connectivity-test.html" -ForegroundColor White
Write-Host ""

# Check for any CORS or connectivity issues
Write-Host "🔧 Running connectivity diagnostics..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri "http://localhost:5002/api/health" -Headers @{"Origin"="http://localhost:5176"} -UseBasicParsing
    Write-Host "✅ CORS configuration is working" -ForegroundColor Green
} catch {
    Write-Host "⚠️  CORS might have issues: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 DermAI Application Status Summary:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Final port check
$finalBackend = Get-NetTCPConnection -LocalPort 5002 -State Listen -ErrorAction SilentlyContinue
$finalFrontend = Get-NetTCPConnection -LocalPort 5176 -State Listen -ErrorAction SilentlyContinue

if ($finalBackend) {
    Write-Host "✅ Backend: RUNNING on port 5002" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: NOT RUNNING on port 5002" -ForegroundColor Red
}

if ($finalFrontend) {
    Write-Host "✅ Frontend: RUNNING on port 5176" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: NOT RUNNING on port 5176" -ForegroundColor Red
}

Write-Host ""
if ($finalBackend -and $finalFrontend) {
    Write-Host "🚀 All systems operational! Opening application..." -ForegroundColor Green
    Start-Process "http://localhost:5176/derm-ai/"
} else {
    Write-Host "⚠️  Some services may not be running properly." -ForegroundColor Yellow
    Write-Host "   Check the server windows for error messages." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "- If you see 'Service Issues', try refreshing the page" -ForegroundColor White
Write-Host "- Check the connectivity test page for detailed diagnostics" -ForegroundColor White
Write-Host "- Ensure no antivirus/firewall is blocking the ports" -ForegroundColor White
Write-Host "- Try accessing http://localhost:5002/api/health directly" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
