# AI Assist 의존성 설치 스크립트 (PowerShell)
# Python 3.12 전용

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Assist Dependencies Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Python 버전 확인
Write-Host "🔍 Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "   Current: $pythonVersion" -ForegroundColor White

if ($pythonVersion -match "3\.13") {
    Write-Host ""
    Write-Host "❌ ERROR: Python 3.13 is not supported by PyTorch!" -ForegroundColor Red
    Write-Host "   PyTorch officially supports Python 3.8 ~ 3.12" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install Python 3.12 from:" -ForegroundColor Yellow
    Write-Host "   https://www.python.org/downloads/release/python-3120/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then create a new virtual environment:" -ForegroundColor Yellow
    Write-Host "   py -3.12 -m venv venv312" -ForegroundColor White
    Write-Host "   .\venv312\Scripts\activate" -ForegroundColor White
    Write-Host ""
    exit 1
}

if ($pythonVersion -notmatch "3\.(8|9|10|11|12)") {
    Write-Host "⚠️  WARNING: Python version may not be compatible with PyTorch" -ForegroundColor Yellow
    Write-Host "   Supported: 3.8, 3.9, 3.10, 3.11, 3.12" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "✅ Python version compatible" -ForegroundColor Green
Write-Host ""

# pip 업그레이드
Write-Host "⬆️  Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
Write-Host ""

# PyTorch CUDA 12.1 설치
Write-Host "🔥 Installing PyTorch with CUDA 12.1..." -ForegroundColor Yellow
Write-Host "   This may take several minutes..." -ForegroundColor Gray
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ PyTorch installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PyTorch installed successfully" -ForegroundColor Green
Write-Host ""

# CUDA 확인
Write-Host "🔍 Verifying CUDA installation..." -ForegroundColor Yellow
$cudaCheck = python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('Version:', torch.version.cuda); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')" 2>&1

Write-Host $cudaCheck -ForegroundColor White

if ($cudaCheck -match "CUDA: False") {
    Write-Host ""
    Write-Host "⚠️  WARNING: CUDA is not available!" -ForegroundColor Yellow
    Write-Host "   PyTorch will run on CPU (slower)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Possible causes:" -ForegroundColor Gray
    Write-Host "   1. NVIDIA driver not installed or outdated" -ForegroundColor Gray
    Write-Host "   2. CUDA toolkit not properly installed" -ForegroundColor Gray
    Write-Host "   3. No compatible NVIDIA GPU found" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue with CPU-only installation? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✅ CUDA is available and working" -ForegroundColor Green
}

Write-Host ""

# 나머지 의존성 설치
Write-Host "📦 Installing remaining dependencies..." -ForegroundColor Yellow
pip install -r requirements/ai.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# 설치 요약
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$summary = python -c @"
import torch
import transformers
import sentence_transformers
import google.genai as genai

print(f'✅ PyTorch: {torch.__version__}')
print(f'✅ Transformers: {transformers.__version__}')
print(f'✅ Sentence Transformers: {sentence_transformers.__version__}')
print(f'✅ Google GenAI: installed')
print(f'✅ CUDA Available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'✅ GPU: {torch.cuda.get_device_name(0)}')
    print(f'✅ CUDA Version: {torch.version.cuda}')
"@

Write-Host $summary -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create .env file with your Gemini API key" -ForegroundColor White
Write-Host "2. Run: python scripts/ai/init_vectorstore.py" -ForegroundColor White
Write-Host "3. Run: uvicorn src.main:app --reload" -ForegroundColor White
Write-Host ""

