# Cleanup Script for DermAI Repository
# This script removes unnecessary files and organizes the repository

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DermAI Repository Cleanup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\GAURAV PATIL\Downloads\derm-ai-main\derm-ai-main\project"
Set-Location $projectRoot

# Create backup
Write-Host "📦 Creating backup..." -ForegroundColor Yellow
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Cleanup old uploaded images (keep structure)
Write-Host "🧹 Cleaning up old uploaded images..." -ForegroundColor Yellow
$uploadsDir = "backend\static\uploads"
if (Test-Path $uploadsDir) {
    $files = Get-ChildItem -Path $uploadsDir -File
    Write-Host "   Found $($files.Count) uploaded files" -ForegroundColor White
    
    # Move to backup
    if ($files.Count -gt 0) {
        New-Item -ItemType Directory -Path "$backupDir\uploads" -Force | Out-Null
        Move-Item -Path "$uploadsDir\*" -Destination "$backupDir\uploads\" -Force
        Write-Host "   ✅ Moved to backup" -ForegroundColor Green
    }
    
    # Create .gitkeep to preserve directory structure
    New-Item -ItemType File -Path "$uploadsDir\.gitkeep" -Force | Out-Null
}

# Cleanup log files
Write-Host "🧹 Cleaning up log files..." -ForegroundColor Yellow
$logDirs = @("backend\logs", "logs")
foreach ($logDir in $logDirs) {
    if (Test-Path $logDir) {
        $logFiles = Get-ChildItem -Path $logDir -Filter "*.log" -File
        if ($logFiles.Count -gt 0) {
            Write-Host "   Found $($logFiles.Count) log files in $logDir" -ForegroundColor White
            New-Item -ItemType Directory -Path "$backupDir\logs" -Force | Out-Null
            Move-Item -Path "$logDir\*.log" -Destination "$backupDir\logs\" -Force
            Write-Host "   ✅ Moved to backup" -ForegroundColor Green
        }
    }
}

# Cleanup database files (keep structure)
Write-Host "🧹 Cleaning up database files..." -ForegroundColor Yellow
$dbFiles = Get-ChildItem -Path "backend\instance" -Filter "*.db" -File -ErrorAction SilentlyContinue
if ($dbFiles.Count -gt 0) {
    Write-Host "   Found $($dbFiles.Count) database files" -ForegroundColor White
    New-Item -ItemType Directory -Path "$backupDir\database" -Force | Out-Null
    Move-Item -Path "backend\instance\*.db" -Destination "$backupDir\database\" -Force
    Write-Host "   ✅ Moved to backup" -ForegroundColor Green
}

# Cleanup __pycache__ directories
Write-Host "🧹 Removing Python cache files..." -ForegroundColor Yellow
$pycacheDirs = Get-ChildItem -Path "backend" -Filter "__pycache__" -Directory -Recurse
if ($pycacheDirs.Count -gt 0) {
    Write-Host "   Found $($pycacheDirs.Count) __pycache__ directories" -ForegroundColor White
    $pycacheDirs | Remove-Item -Recurse -Force
    Write-Host "   ✅ Removed" -ForegroundColor Green
}

# Cleanup .pyc files
$pycFiles = Get-ChildItem -Path "backend" -Filter "*.pyc" -File -Recurse
if ($pycFiles.Count -gt 0) {
    Write-Host "   Found $($pycFiles.Count) .pyc files" -ForegroundColor White
    $pycFiles | Remove-Item -Force
    Write-Host "   ✅ Removed" -ForegroundColor Green
}

# Move old documentation to docs folder
Write-Host "📚 Organizing documentation..." -ForegroundColor Yellow
$docFiles = @(
    "GITHUB_SETUP.md",
    "GRADCAM_FEATURE.md",
    "PROJECT_COMPLETION_REPORT.md",
    "SERVICE_STATUS_FINAL.md"
)

foreach ($docFile in $docFiles) {
    if (Test-Path $docFile) {
        Move-Item -Path $docFile -Destination "docs\" -Force
        Write-Host "   ✅ Moved $docFile to docs/" -ForegroundColor Green
    }
}

# Cleanup test files
Write-Host "🧹 Organizing test files..." -ForegroundColor Yellow
$testFiles = @(
    "test_frontend_fix.js",
    "test_integration.js",
    "connectivity-test.html"
)

New-Item -ItemType Directory -Path "tests" -Force | Out-Null
foreach ($testFile in $testFiles) {
    if (Test-Path $testFile) {
        Move-Item -Path $testFile -Destination "tests\" -Force
        Write-Host "   ✅ Moved $testFile to tests/" -ForegroundColor Green
    }
}

# Create necessary .gitkeep files
Write-Host "📝 Creating .gitkeep files..." -ForegroundColor Yellow
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

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Cleanup Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backup created in: $backupDir" -ForegroundColor Green
Write-Host "✅ Uploaded images cleaned" -ForegroundColor Green
Write-Host "✅ Log files cleaned" -ForegroundColor Green
Write-Host "✅ Database files cleaned" -ForegroundColor Green
Write-Host "✅ Python cache removed" -ForegroundColor Green
Write-Host "✅ Documentation organized" -ForegroundColor Green
Write-Host "✅ Test files organized" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Repository is now clean and organized!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: You'll need to reinitialize the database:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   python init_db.py" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
