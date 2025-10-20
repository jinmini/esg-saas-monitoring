# AI Assist 설치 가이드

## 🚨 중요: 설치 순서를 반드시 지켜주세요!

PyTorch CUDA 버전과 다른 라이브러리 간의 충돌을 방지하기 위해 **순서대로** 설치해야 합니다.

---

## 📋 전제 조건

- **Python**: 3.8 ~ 3.12 (⚠️ 3.13은 지원 안됨!)
- **CUDA**: 12.x (12.1~12.9)
- **GPU**: NVIDIA (RTX 3050 이상)
- **OS**: Windows 10/11, Linux, macOS (M1/M2는 MPS 지원)

## ⚠️ 중요: Python 버전 확인

**PyTorch는 Python 3.13을 아직 지원하지 않습니다!**

```bash
# 현재 Python 버전 확인
python --version

# Python 3.13.x가 나오면 3.12로 다운그레이드 필요
# Python 3.12 다운로드: https://www.python.org/downloads/release/python-3120/
```

**Python 3.13 사용자:**
1. Python 3.12 설치
2. 새 가상환경 생성: `py -3.12 -m venv venv312`
3. 활성화: `.\venv312\Scripts\activate`

---

## 🔧 1단계: PyTorch CUDA 버전 설치

### 옵션 A: 자동 설치 스크립트 (권장)

```powershell
# backend 디렉토리에서
cd backend

# Python 버전 확인 및 자동 설치
.\install_ai_deps.ps1
```

이 스크립트는:
- ✅ Python 버전 자동 확인 (3.13이면 경고)
- ✅ PyTorch CUDA 12.1 자동 설치
- ✅ CUDA 가용성 검증
- ✅ 나머지 의존성 자동 설치

### 옵션 B: 수동 설치

**반드시 먼저 실행하세요!**

```bash
# 가상환경 활성화 (backend 디렉토리에서)
cd backend

# Python 3.12 가상환경 사용 (3.13인 경우)
py -3.12 -m venv venv312
.\venv312\Scripts\activate  # Windows
# source venv312/bin/activate  # Linux/macOS

# 또는 기존 가상환경 (Python 3.8~3.12)
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS

# PyTorch CUDA 12.1 설치 (CUDA 12.9 호환)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 설치 확인

```bash
python -c "import torch; print('CUDA Available:', torch.cuda.is_available()); print('CUDA Version:', torch.version.cuda); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

**예상 출력:**
```
CUDA Available: True
CUDA Version: 12.1
Device: NVIDIA GeForce RTX 3050
```

**❌ CUDA Available: False가 나오면:**
```bash
# NVIDIA 드라이버 확인
nvidia-smi

# 드라이버 버전이 535.xx 이상인지 확인
# 낮으면 https://www.nvidia.com/Download/index.aspx 에서 업데이트

# PyTorch 재설치
pip uninstall torch torchvision torchaudio
pip cache purge
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

## 🔧 2단계: AI 의존성 설치

PyTorch 설치 완료 후 나머지 라이브러리를 설치합니다.

```bash
pip install -r requirements/ai.txt
```

### 설치되는 주요 패키지

- `google-genai>=1.0.0` - Gemini API 클라이언트
- `sentence-transformers>=3.0.0` - 임베딩 모델
- `chromadb==0.4.22` - 벡터 데이터베이스
- `transformers>=4.36.0` - HuggingFace 모델
- `numpy`, `pandas`, `tqdm` - 유틸리티

---

## 🔧 3단계: 환경변수 설정

`.env` 파일을 `backend/` 디렉토리에 생성합니다.

```bash
# backend/.env
AI_ASSIST_GEMINI_API_KEY="your-gemini-api-key-here"
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"
```

### API 키 발급

1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 프로젝트 선택 또는 생성
4. 생성된 키를 복사하여 `.env`에 추가

---

## 🔧 4단계: ESG 데이터 준비

GRI 표준 데이터를 준비합니다.

```bash
# 디렉토리 생성
mkdir -p backend/src/ai_assist/esg_mapping/data

# gri_2021.jsonl 파일을 해당 디렉토리에 배치
# 파일 위치: backend/src/ai_assist/esg_mapping/data/gri_2021.jsonl
```

---

## 🔧 5단계: 벡터스토어 초기화

```bash
# 스크립트 실행 (아직 없으면 다음 단계에서 생성)
python scripts/ai/init_vectorstore.py
```

**예상 출력:**
```
✅ Embeddings model loaded: intfloat/multilingual-e5-base
✅ Device: cuda
📂 Loading JSONL files...
✅ Loaded 500 documents from gri_2021.jsonl
🔄 Embedding documents (batch_size=32)...
✅ Successfully added 500 documents to ChromaDB
✅ Vector store initialized successfully
```

---

## 🔧 6단계: 서버 실행

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**예상 출력:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
✅ AI Assist auto-refresh enabled (interval: 3600s)
```

---

## 🧪 7단계: API 테스트

### 방법 1: cURL

```bash
curl -X POST http://localhost:8000/api/ai/map-esg \
  -H "Content-Type: application/json" \
  -d '{
    "text": "우리 회사는 2024년까지 탄소 배출량을 30% 감축하는 것을 목표로 합니다.",
    "frameworks": ["GRI"],
    "top_k": 5
  }'
```

### 방법 2: Python 스크립트

```bash
python scripts/ai/test_esg_mapping.py
```

### 예상 응답

```json
{
  "status": "success",
  "suggestions": [
    {
      "standard_id": "GRI-305-1",
      "title": "직접 온실가스 배출량 (Scope 1)",
      "confidence": 0.89,
      "reasoning": "탄소 배출량 감축 목표는 GRI 305 기후변화 지표와 직접 관련됩니다."
    }
  ],
  "processing_time": 2.34
}
```

---

## 🐛 트러블슈팅

### 1. CUDA Out of Memory

**증상:**
```
RuntimeError: CUDA out of memory
```

**해결:**
```python
# config.py 또는 .env 수정
AI_ASSIST_EMBEDDING_BATCH_SIZE=16  # 기본값 32 → 16
```

또는

```bash
# embeddings.py가 자동으로 GPU 메모리 감지하여 배치 크기 조정
# RTX 3050 (4GB VRAM)의 경우 자동으로 16으로 설정됨
```

### 2. sentence-transformers 버전 충돌

**증상:**
```
ERROR: sentence-transformers 2.3.1 requires torch<2.3.0
```

**해결:**
```bash
# sentence-transformers 3.x로 업그레이드
pip install --upgrade sentence-transformers>=3.0.0
```

### 3. ChromaDB 컴파일 오류 (C++ Build Tools)

**증상:**
```
error: Microsoft Visual C++ 14.0 or greater is required
ERROR: Failed building wheel for chroma-hnswlib
```

**해결 (빠른 방법):**
```bash
# 자동 해결 스크립트 실행
.\fix_chromadb.ps1

# 또는 수동으로
pip install --upgrade pip
pip install chromadb>=0.4.22 --only-binary :all:
```

**해결 (확실한 방법):**
1. Microsoft C++ Build Tools 설치
   - https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - "Desktop development with C++" 워크로드 선택
2. 재부팅
3. 다시 시도: `pip install -r requirements/ai.txt`

### 4. ChromaDB 초기화 실패

**증상:**
```
Error: Could not connect to ChromaDB
```

**해결:**
```bash
# 데이터 디렉토리 생성
mkdir -p backend/data/chroma

# 권한 확인 (Linux/macOS)
chmod 755 backend/data/chroma

# ChromaDB 재설치
pip uninstall chromadb
pip install chromadb>=0.4.22
```

### 5. Gemini API 인증 실패

**증상:**
```
ValueError: GEMINI_API_KEY not found in environment
```

**해결:**
```bash
# .env 파일 위치 확인
# 반드시 backend/ 디렉토리에 있어야 함
ls -la backend/.env

# 환경변수 이름 확인
# AI_ASSIST_GEMINI_API_KEY (접두사 필수)

# 따옴표 확인
AI_ASSIST_GEMINI_API_KEY="your-key"  # 올바름
AI_ASSIST_GEMINI_API_KEY=your-key    # 올바름
AI_ASSIST_GEMINI_API_KEY='your-key'  # 올바름
```

### 6. 임베딩 모델 다운로드 실패

**증상:**
```
OSError: Can't load model 'intfloat/multilingual-e5-base'
```

**해결:**
```bash
# 수동 다운로드
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-base')"

# 또는 캐시 디렉토리 지정
export TRANSFORMERS_CACHE=/path/to/cache
```

### 7. Rate Limit 초과

**증상:**
```
429 Too Many Requests
```

**해결:**
```bash
# 1. 현재 Tier 확인
# https://aistudio.google.com/app/apikey

# 2. .env에서 Rate Limit 조정
AI_ASSIST_RATE_LIMIT_RPM=10      # Free tier
AI_ASSIST_RATE_LIMIT_TPM=250000
AI_ASSIST_RATE_LIMIT_RPD=250

# 3. Tier 업그레이드 고려
# Cloud Billing 활성화 → Tier 1 (RPM 1000)
```

---

## 📊 설치 확인 체크리스트

### 환경 확인
- [ ] Python 3.9 이상 설치됨
- [ ] CUDA 12.x 드라이버 설치됨
- [ ] GPU 인식됨 (`nvidia-smi` 정상 출력)
- [ ] 가상환경 활성화됨

### 라이브러리 설치
- [ ] PyTorch CUDA 버전 설치 완료
- [ ] `torch.cuda.is_available()` = True
- [ ] `sentence-transformers>=3.0.0` 설치 완료
- [ ] `google-genai>=1.0.0` 설치 완료
- [ ] `chromadb==0.4.22` 설치 완료

### 설정 파일
- [ ] `.env` 파일 생성됨 (`backend/.env`)
- [ ] `AI_ASSIST_GEMINI_API_KEY` 설정됨
- [ ] `AI_ASSIST_GEMINI_MODEL` = "gemini-2.5-flash"
- [ ] `AI_ASSIST_EMBEDDING_MODEL` = "intfloat/multilingual-e5-base"

### 데이터 준비
- [ ] `backend/src/ai_assist/esg_mapping/data/` 디렉토리 존재
- [ ] `gri_2021.jsonl` 파일 배치됨
- [ ] JSONL 파일 형식 확인 (각 줄이 유효한 JSON)

### 벡터스토어
- [ ] `backend/data/chroma/` 디렉토리 생성됨
- [ ] 벡터스토어 초기화 성공
- [ ] ChromaDB에 문서 추가 확인

### API 테스트
- [ ] 서버 시작 성공
- [ ] `/api/ai/map-esg` 엔드포인트 응답 정상
- [ ] GPU 메모리 사용량 정상 (< 3GB)
- [ ] 응답 시간 < 5초

---

## 💡 성능 최적화 팁

### 1. GPU 메모리 최적화

```python
# embeddings.py에서 자동 조정됨
# RTX 3050 (4GB): batch_size=16
# RTX 3060 (12GB): batch_size=64
# RTX 3090 (24GB): batch_size=128
```

### 2. ChromaDB 인덱스 최적화

```python
# chroma_manager.py
# 컬렉션 생성 시 HNSW 인덱스 사용 (이미 적용됨)
# 검색 속도: ~50ms (1000 documents)
```

### 3. Gemini API 응답 속도

```python
# Temperature 낮추기 (더 결정적)
AI_ASSIST_GEMINI_TEMPERATURE=0.2

# Max tokens 줄이기 (더 빠른 응답)
AI_ASSIST_GEMINI_MAX_TOKENS=1024
```

### 4. 캐싱 활용

```python
# 동일한 텍스트에 대한 중복 요청 방지
# Redis 또는 메모리 캐시 구현 고려
```

---

## 📚 추가 리소스

- `AI_ASSIST_ENV_SETUP.md`: 환경변수 상세 가이드
- `AI_ASSIST_MODEL_UPDATE.md`: Gemini 2.5 Flash 업데이트 내역
- `AI_ASSIST_SETUP.md`: 전체 아키텍처 및 설계 문서
- `README.md`: AI Assist 모듈 개요

---

## 🆘 도움이 필요하시면

1. **GitHub Issues**: 버그 리포트 및 기능 요청
2. **문서 확인**: 위 추가 리소스 참조
3. **로그 확인**: `backend/data/logs/` 디렉토리

---

**작성일**: 2025-10-16  
**최종 수정**: 2025-10-16  
**버전**: 1.0.0

