# ChromaDB 설치 문제 해결 스크립트
# chroma-hnswlib 컴파일 오류 해결

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ChromaDB Installation Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Python 버전 확인
Write-Host "🔍 Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "   $pythonVersion" -ForegroundColor White
Write-Host ""

# pip 업그레이드
Write-Host "⬆️  Upgrading pip to latest version..." -ForegroundColor Yellow
Write-Host "   (최신 pip은 pre-built wheel을 더 잘 인식합니다)" -ForegroundColor Gray
python -m pip install --upgrade pip
Write-Host "✅ pip upgraded" -ForegroundColor Green
Write-Host ""

# 방법 1: Pre-built wheel로 재설치
Write-Host "🔧 Method 1: Installing ChromaDB with pre-built wheels..." -ForegroundColor Yellow
Write-Host "   Trying chromadb 0.4.22..." -ForegroundColor Gray

pip uninstall chromadb chroma-hnswlib -y 2>$null
$result1 = pip install chromadb==0.4.22 --only-binary :all: 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ chromadb 0.4.22 installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # 설치 확인
    Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
    $verify = python -c "import chromadb; print('ChromaDB version:', chromadb.__version__)" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $verify -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "🎉 Installation Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Continue with: pip install -r requirements/ai.txt" -ForegroundColor White
        Write-Host "2. Or run: .\install_ai_deps.ps1" -ForegroundColor White
        exit 0
    }
}

Write-Host "⚠️  Method 1 failed. Trying method 2..." -ForegroundColor Yellow
Write-Host ""

# 방법 2: 최신 버전 시도
Write-Host "🔧 Method 2: Trying newer version (0.4.24)..." -ForegroundColor Yellow
pip uninstall chromadb chroma-hnswlib -y 2>$null
$result2 = pip install chromadb==0.4.24 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ chromadb 0.4.24 installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # 설치 확인
    Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
    $verify = python -c "import chromadb; print('ChromaDB version:', chromadb.__version__)" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $verify -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "🎉 Installation Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  Note: Using ChromaDB 0.4.24 instead of 0.4.22" -ForegroundColor Yellow
        Write-Host "   This should be compatible with the codebase." -ForegroundColor Gray
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update requirements/ai.txt to use chromadb==0.4.24" -ForegroundColor White
        Write-Host "2. Continue with: pip install -r requirements/ai.txt" -ForegroundColor White
        exit 0
    }
}

Write-Host "⚠️  Method 2 failed. Trying method 3..." -ForegroundColor Yellow
Write-Host ""

# 방법 3: 최신 안정 버전
Write-Host "🔧 Method 3: Trying latest stable version..." -ForegroundColor Yellow
pip uninstall chromadb chroma-hnswlib -y 2>$null
$result3 = pip install chromadb 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ chromadb (latest) installed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # 설치 확인
    Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
    $verify = python -c "import chromadb; print('ChromaDB version:', chromadb.__version__)" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $verify -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "🎉 Installation Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        exit 0
    }
}

# 모든 방법 실패
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "❌ All Methods Failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "ChromaDB 설치에 실패했습니다." -ForegroundColor Red
Write-Host "Microsoft C++ Build Tools 설치가 필요합니다." -ForegroundColor Yellow
Write-Host ""
Write-Host "📥 다운로드:" -ForegroundColor Cyan
Write-Host "   https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor White
Write-Host ""
Write-Host "설치 시 선택사항:" -ForegroundColor Yellow
Write-Host "   ✅ C++ Build Tools 워크로드" -ForegroundColor White
Write-Host "   ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools" -ForegroundColor White
Write-Host "   ✅ Windows 10/11 SDK" -ForegroundColor White
Write-Host ""
Write-Host "설치 후:" -ForegroundColor Yellow
Write-Host "   1. 시스템 재부팅" -ForegroundColor White
Write-Host "   2. 다시 시도: .\fix_chromadb.ps1" -ForegroundColor White
Write-Host ""

exit 1

