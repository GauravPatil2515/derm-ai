# Advanced Repository Reorganization Script
# This creates a clean, professional structure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DermAI Repository Reorganization" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project"
Set-Location $projectRoot

# Step 1: Create clean directory structure
Write-Host "📁 Creating clean directory structure..." -ForegroundColor Yellow

$directories = @(
    "docs",
    "scripts",
    "tests",
    ".github\workflows"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Created $dir" -ForegroundColor Green
    }
}

# Step 2: Move documentation files
Write-Host ""
Write-Host "📚 Organizing documentation..." -ForegroundColor Yellow

$docFiles = @{
    "GITHUB_SETUP.md" = "docs\GITHUB_SETUP.md"
    "GRADCAM_FEATURE.md" = "docs\GRADCAM_FEATURE.md"
    "PROJECT_COMPLETION_REPORT.md" = "docs\PROJECT_COMPLETION_REPORT.md"
    "SERVICE_STATUS_FINAL.md" = "docs\SERVICE_STATUS_FINAL.md"
}

foreach ($file in $docFiles.Keys) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $docFiles[$file] -Force
        Write-Host "   ✅ Moved $file → $($docFiles[$file])" -ForegroundColor Green
    }
}

# Step 3: Move scripts
Write-Host ""
Write-Host "🔧 Organizing scripts..." -ForegroundColor Yellow

$scriptFiles = @{
    "start-derm-ai.ps1" = "scripts\start-derm-ai.ps1"
    "start-derm-ai.bat" = "scripts\start-derm-ai.bat"
    "cleanup-repo.ps1" = "scripts\cleanup-repo.ps1"
}

foreach ($file in $scriptFiles.Keys) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $scriptFiles[$file] -Force
        Write-Host "   ✅ Moved $file → $($scriptFiles[$file])" -ForegroundColor Green
    }
}

# Step 4: Move test files
Write-Host ""
Write-Host "🧪 Organizing test files..." -ForegroundColor Yellow

$testFiles = @{
    "test_frontend_fix.js" = "tests\test_frontend_fix.js"
    "test_integration.js" = "tests\test_integration.js"
    "connectivity-test.html" = "tests\connectivity-test.html"
}

foreach ($file in $testFiles.Keys) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination $testFiles[$file] -Force
        Write-Host "   ✅ Moved $file → $($testFiles[$file])" -ForegroundColor Green
    }
}

# Step 5: Clean up backend uploads
Write-Host ""
Write-Host "🧹 Cleaning backend uploads..." -ForegroundColor Yellow

$uploadsDir = "backend\static\uploads"
if (Test-Path $uploadsDir) {
    $uploadFiles = Get-ChildItem -Path $uploadsDir -File
    if ($uploadFiles.Count -gt 0) {
        # Create archive folder
        $archiveDir = "backend\static\uploads_archive_$(Get-Date -Format 'yyyyMMdd')"
        New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
        
        # Move all files to archive
        Move-Item -Path "$uploadsDir\*" -Destination $archiveDir -Force
        Write-Host "   ✅ Archived $($uploadFiles.Count) files to $archiveDir" -ForegroundColor Green
        
        # Create .gitkeep
        New-Item -ItemType File -Path "$uploadsDir\.gitkeep" -Force | Out-Null
    }
}

# Step 6: Clean up logs
Write-Host ""
Write-Host "📝 Cleaning log files..." -ForegroundColor Yellow

$logDirs = @("backend\logs", "logs")
foreach ($logDir in $logDirs) {
    if (Test-Path $logDir) {
        $logFiles = Get-ChildItem -Path $logDir -Filter "*.log" -File
        if ($logFiles.Count -gt 0) {
            Remove-Item -Path "$logDir\*.log" -Force
            Write-Host "   ✅ Removed $($logFiles.Count) log files from $logDir" -ForegroundColor Green
        }
        # Create .gitkeep
        New-Item -ItemType File -Path "$logDir\.gitkeep" -Force | Out-Null
    }
}

# Step 7: Clean up Python cache
Write-Host ""
Write-Host "🐍 Removing Python cache..." -ForegroundColor Yellow

$pycacheDirs = Get-ChildItem -Path "backend" -Filter "__pycache__" -Directory -Recurse -ErrorAction SilentlyContinue
if ($pycacheDirs) {
    $pycacheDirs | Remove-Item -Recurse -Force
    Write-Host "   ✅ Removed $($pycacheDirs.Count) __pycache__ directories" -ForegroundColor Green
}

$pycFiles = Get-ChildItem -Path "backend" -Filter "*.pyc" -File -Recurse -ErrorAction SilentlyContinue
if ($pycFiles) {
    $pycFiles | Remove-Item -Force
    Write-Host "   ✅ Removed $($pycFiles.Count) .pyc files" -ForegroundColor Green
}

# Step 8: Create README in each major directory
Write-Host ""
Write-Host "📖 Creating directory READMEs..." -ForegroundColor Yellow

# Backend README
$backendReadme = @"
# Backend

Flask-based backend for DermAI.

## Structure

- ``api/`` - API endpoints
- ``models/`` - Database models
- ``utils/`` - Utility functions
- ``static/`` - Static files and uploads
- ``logs/`` - Application logs
- ``instance/`` - Database files

## Running

``````bash
python app.py
``````

See [../docs/SETUP.md](../docs/SETUP.md) for detailed setup instructions.
"@

Set-Content -Path "backend\README.md" -Value $backendReadme
Write-Host "   ✅ Created backend/README.md" -ForegroundColor Green

# Docs README
$docsReadme = @"
# Documentation

## Available Guides

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[GRADCAM_FEATURE.md](GRADCAM_FEATURE.md)** - Grad-CAM feature documentation
- **[PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)** - Project status
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - GitHub repository setup

## Quick Links

- [Main README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Quick Reference](../QUICK_REFERENCE.md)
"@

Set-Content -Path "docs\README.md" -Value $docsReadme
Write-Host "   ✅ Created docs/README.md" -ForegroundColor Green

# Scripts README
$scriptsReadme = @"
# Scripts

Utility scripts for DermAI.

## Available Scripts

- **start-derm-ai.ps1** - Start both frontend and backend (Windows)
- **start-derm-ai.bat** - Batch file wrapper (Windows)
- **cleanup-repo.ps1** - Clean up repository files

## Usage

``````powershell
# Start application
.\scripts\start-derm-ai.ps1

# Clean repository
.\scripts\cleanup-repo.ps1
``````
"@

Set-Content -Path "scripts\README.md" -Value $scriptsReadme
Write-Host "   ✅ Created scripts/README.md" -ForegroundColor Green

# Tests README
$testsReadme = @"
# Tests

Test files for DermAI.

## Available Tests

- **test_integration.js** - Integration tests
- **test_frontend_fix.js** - Frontend tests
- **connectivity-test.html** - Connectivity test page

## Running Tests

``````bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
npm test

# Integration tests
node tests/test_integration.js
``````
"@

Set-Content -Path "tests\README.md" -Value $testsReadme
Write-Host "   ✅ Created tests/README.md" -ForegroundColor Green

# Step 9: Create .gitkeep files
Write-Host ""
Write-Host "📌 Creating .gitkeep files..." -ForegroundColor Yellow

$keepDirs = @(
    "backend\static\uploads",
    "backend\logs",
    "backend\instance"
)

foreach ($dir in $keepDirs) {
    if (Test-Path $dir) {
        New-Item -ItemType File -Path "$dir\.gitkeep" -Force | Out-Null
    }
}
Write-Host "   ✅ Created .gitkeep files" -ForegroundColor Green

# Step 10: Display final structure
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Final Directory Structure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$structure = @"
derm-ai/
├── 📂 backend/              # Flask backend
│   ├── api/                # API endpoints
│   ├── models/             # Database models
│   ├── utils/              # Utilities
│   ├── static/uploads/     # User uploads
│   ├── logs/               # Application logs
│   └── instance/           # Database files
│
├── 📂 src/                  # React frontend
│   ├── components/         # React components
│   └── lib/                # Utilities
│
├── 📂 docs/                 # Documentation
│   ├── SETUP.md           # Setup guide
│   ├── GRADCAM_FEATURE.md # Feature docs
│   └── README.md          # Docs index
│
├── 📂 scripts/              # Utility scripts
│   ├── start-derm-ai.ps1  # Startup script
│   └── cleanup-repo.ps1   # Cleanup script
│
├── 📂 tests/                # Test files
│   ├── test_integration.js
│   └── connectivity-test.html
│
├── 📄 README.md             # Main documentation
├── 📄 CONTRIBUTING.md       # Contribution guide
├── 📄 QUICK_REFERENCE.md    # Quick reference
├── 📄 .gitignore           # Git ignore rules
├── 📄 package.json         # Frontend dependencies
└── 📄 vite.config.ts       # Vite configuration
"@

Write-Host $structure -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Repository Reorganized!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Documentation organized in docs/" -ForegroundColor Green
Write-Host "   ✅ Scripts moved to scripts/" -ForegroundColor Green
Write-Host "   ✅ Tests moved to tests/" -ForegroundColor Green
Write-Host "   ✅ Uploads archived" -ForegroundColor Green
Write-Host "   ✅ Logs cleaned" -ForegroundColor Green
Write-Host "   ✅ Python cache removed" -ForegroundColor Green
Write-Host "   ✅ Directory READMEs created" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Review the new structure" -ForegroundColor White
Write-Host "   2. Update any hardcoded paths if needed" -ForegroundColor White
Write-Host "   3. Commit changes to git" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
