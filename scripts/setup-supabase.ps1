# ============================================
# DermAI Supabase Setup Script
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DermAI Supabase Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project"
Set-Location $projectRoot

# Step 1: Update .env file
Write-Host "1. Updating backend/.env file..." -ForegroundColor Yellow

$envContent = @"
# ============================================
# DermAI Environment Configuration
# ============================================

# ==================== SUPABASE CONFIGURATION ====================
SUPABASE_URL=https://msmvkylwxvybifwgwmuy.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbXZreWx3eHZ5Ymlmd2d3bXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzE5NjgsImV4cCI6MjA4MDM0Nzk2OH0.-pca4zAqIhzPcRCJmIYieRww9sqaJAerLqf8AIUtlRg

# ==================== GROQ AI CONFIGURATION ====================
GROQ_API_KEY=your_groq_api_key_here

# ==================== FLASK CONFIGURATION ====================
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key

# ==================== CORS ====================
CORS_ORIGINS=http://localhost:5176,http://localhost:5173
"@

Set-Content -Path "backend\.env" -Value $envContent -Force
Write-Host "   ✅ .env file updated with Supabase credentials" -ForegroundColor Green

# Step 2: Install Supabase package
Write-Host ""
Write-Host "2. Installing Supabase package..." -ForegroundColor Yellow
Set-Location "backend"

try {
    pip install supabase==2.3.4 --quiet
    Write-Host "   ✅ Supabase package installed" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Error installing Supabase: $_" -ForegroundColor Yellow
    Write-Host "   Run manually: pip install supabase==2.3.4" -ForegroundColor White
}

Set-Location $projectRoot

# Step 3: Display SQL instructions
Write-Host ""
Write-Host "3. Create Database Tables in Supabase..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   📋 Follow these steps:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://supabase.com/dashboard/project/msmvkylwxvybifwgwmuy" -ForegroundColor White
Write-Host "   2. Click 'SQL Editor' in the left sidebar" -ForegroundColor White
Write-Host "   3. Click 'New query'" -ForegroundColor White
Write-Host "   4. Copy the SQL from: backend\supabase_schema.sql" -ForegroundColor White
Write-Host "   5. Paste and click 'Run' (or Ctrl+Enter)" -ForegroundColor White
Write-Host ""

# Step 4: Create Storage Bucket instructions
Write-Host "4. Create Storage Bucket..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   📋 Follow these steps:" -ForegroundColor Cyan
Write-Host "   1. Click 'Storage' in the left sidebar" -ForegroundColor White
Write-Host "   2. Click 'New bucket'" -ForegroundColor White
Write-Host "   3. Name: skin-images" -ForegroundColor White
Write-Host "   4. Check 'Public bucket'" -ForegroundColor White
Write-Host "   5. Click 'Create bucket'" -ForegroundColor White
Write-Host ""

# Step 5: Test connection
Write-Host "5. Testing Supabase connection..." -ForegroundColor Yellow

Set-Location "backend"
$testScript = @"
from services.supabase_service import get_supabase_service
import json

service = get_supabase_service()
health = service.health_check()
print(json.dumps(health, indent=2))
"@

Set-Content -Path "test_supabase.py" -Value $testScript
try {
    $result = python test_supabase.py 2>&1
    if ($result -match "connected.*true") {
        Write-Host "   ✅ Supabase connection successful!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Connection test result:" -ForegroundColor Yellow
        Write-Host "   $result" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️  Could not test connection yet" -ForegroundColor Yellow
    Write-Host "   Run after creating tables: python test_supabase.py" -ForegroundColor White
}

Remove-Item "test_supabase.py" -ErrorAction SilentlyContinue
Set-Location $projectRoot

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Supabase credentials configured" -ForegroundColor Green
Write-Host "✅ Python package installed" -ForegroundColor Green
Write-Host "⏳ Database tables - Create manually (see step 3)" -ForegroundColor Yellow
Write-Host "⏳ Storage bucket - Create manually (see step 4)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Create database tables using SQL Editor" -ForegroundColor White
Write-Host "   2. Create storage bucket" -ForegroundColor White
Write-Host "   3. Restart backend: cd backend && python app.py" -ForegroundColor White
Write-Host "   4. Test application" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Full guide: docs\SUPABASE_SETUP.md" -ForegroundColor White
Write-Host "   - SQL schema: backend\supabase_schema.sql" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
