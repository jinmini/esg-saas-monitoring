# AI Assist Layer 설정 가이드

ESG 보고서 작성을 위한 AI 기능 설정 및 사용 방법입니다.

## 📦 의존성 설치

```bash
cd backend

# AI 관련 의존성 설치
pip install -r requirements/ai.txt

# 또는 전체 설치
pip install -r requirements/base.txt -r requirements/ai.txt
```

## 🔑 환경변수 설정

`.env` 파일에 다음 변수들을 추가하세요:

```bash
# Gemini API 키 (필수)
AI_ASSIST_GEMINI_API_KEY=your-gemini-api-key-here

# 임베딩 설정
AI_ASSIST_EMBEDDING_MODEL=intfloat/multilingual-e5-base
AI_ASSIST_EMBEDDING_DEVICE=cpu  # GPU 사용 시 'cuda'

# 데이터 경로
AI_ASSIST_ESG_DATA_DIR=./backend/src/ai_assits/esg_mapping/data
AI_ASSIST_CHROMA_PERSIST_DIR=./data/chroma
```

### Gemini API 키 발급 방법

1. https://makersuite.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 발급된 키를 `.env`에 추가

## 🚀 초기 설정

### 1단계: 벡터스토어 초기화

ESG 표준 데이터(JSONL)를 임베딩하여 ChromaDB에 저장합니다.

**방법 1: Python 스크립트**

```python
# backend/scripts/ai/init_vectorstore.py
from pathlib import Path
from src.ai_assits.esg_mapping.vectorstore import embed_esg_standards

# 전체 ESG 표준 임베딩
embed_esg_standards(
    data_dir="./backend/src/ai_assits/esg_mapping/data",
    reset=True  # 기존 데이터 삭제 후 재구축
)
```

실행:
```bash
cd backend
python scripts/ai/init_vectorstore.py
```

**방법 2: API 엔드포인트**

서버 실행 후:

```bash
curl -X POST "http://localhost:8000/api/v1/ai-assist/vectorstore/initialize?reset=true"
```

### 2단계: 서버 실행 및 확인

```bash
cd backend
uvicorn src.main:app --reload
```

헬스체크:
```bash
curl http://localhost:8000/api/v1/ai-assist/health
```

응답 예시:
```json
{
  "status": "healthy",
  "vectorstore": {
    "document_count": 182,
    "embedding_dimension": 768
  },
  "refresh_task": {
    "is_running": false,
    "refresh_count": 0
  }
}
```

## 🧪 테스트

### ESG 매핑 테스트

```bash
curl -X POST "http://localhost:8000/api/v1/ai-assist/map-esg" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "우리 회사는 2024년 Scope 1 직접 온실가스 배출량이 1,200 tCO2e입니다.",
    "document_id": 1,
    "frameworks": ["GRI"],
    "top_k": 3,
    "min_confidence": 0.5,
    "language": "ko"
  }'
```

예상 응답:
```json
{
  "type": "esg_mapping",
  "suggestions": [
    {
      "standard_id": "GRI 305-1",
      "framework": "GRI",
      "category": "Environment",
      "topic": "Emissions",
      "title": "Direct (Scope 1) GHG emissions",
      "confidence": 0.92,
      "similarity_score": 0.85,
      "reasoning": "텍스트에서 Scope 1 직접 배출량을 명시하고 있어 GRI 305-1에 정확히 부합합니다."
    }
  ],
  "metadata": {
    "total_candidates": 10,
    "total_matches": 3,
    "processing_time": 1.234
  }
}
```

## 📊 데이터 관리

### JSONL 파일 추가/수정

1. `backend/src/ai_assits/esg_mapping/data/`에 새 JSONL 파일 추가
2. 자동 갱신 활성화:

```bash
curl -X POST "http://localhost:8000/api/v1/ai-assist/refresh/start"
```

3. 즉시 갱신:

```bash
curl -X POST "http://localhost:8000/api/v1/ai-assist/refresh/check-now"
```

### 수동 재임베딩

특정 파일만:
```python
from pathlib import Path
from src.ai_assits.esg_mapping.vectorstore import ESGEmbeddingPipeline

pipeline = ESGEmbeddingPipeline(data_dir=Path("./backend/src/ai_assits/esg_mapping/data"))
pipeline.process_single_file(Path("./backend/src/ai_assits/esg_mapping/data/gri_2021.jsonl"))
```

전체 재구축:
```bash
curl -X POST "http://localhost:8000/api/v1/ai-assist/refresh/force-all"
```

## 🔧 트러블슈팅

### 1. 임베딩 모델 로드 실패

**증상:**
```
Failed to load embedding model: intfloat/multilingual-e5-base
```

**해결:**
```bash
# HuggingFace 모델 수동 다운로드
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-base')"
```

### 2. ChromaDB 에러

**증상:**
```
chromadb.errors.InvalidCollectionException
```

**해결:**
```bash
# ChromaDB 데이터 삭제 후 재구축
rm -rf ./data/chroma
curl -X POST "http://localhost:8000/api/v1/ai-assist/vectorstore/initialize?reset=true"
```

### 3. Gemini API 쿼터 초과

**증상:**
```
429 Too Many Requests: Resource exhausted
```

**해결:**
- 무료 티어 제한 확인 (15 RPM, 1,500 RPD)
- Rate Limiter가 자동으로 재시도합니다
- 유료 플랜 고려

### 4. GPU 메모리 부족

**증상:**
```
CUDA out of memory
```

**해결:**
```bash
# CPU 모드로 전환
export AI_ASSIST_EMBEDDING_DEVICE=cpu
```

또는 배치 크기 줄이기:
```bash
export AI_ASSIST_EMBEDDING_BATCH_SIZE=16
```

## 📈 성능 최적화

### GPU 사용 (권장)

CUDA 설치 후:
```bash
# PyTorch CUDA 버전 설치
pip install torch --index-url https://download.pytorch.org/whl/cu118

# GPU 모드 활성화
export AI_ASSIST_EMBEDDING_DEVICE=cuda
```

### 임베딩 캐싱

임베딩된 데이터는 ChromaDB에 영구 저장되므로, 서버 재시작 시에도 재임베딩이 필요 없습니다.

## 🔐 프로덕션 체크리스트

- [ ] Gemini API 키를 환경변수로 안전하게 관리
- [ ] 벡터스토어 데이터를 볼륨 마운트로 영구 저장
- [ ] Rate Limiter 설정 확인
- [ ] 자동 갱신 태스크 활성화 (`AI_ASSIST_AUTO_REFRESH_ENABLED=true`)
- [ ] 로그 레벨 설정 (`INFO` 이상)
- [ ] GPU 메모리 모니터링 설정
- [ ] 백업 전략 수립 (ChromaDB 데이터 + JSONL 파일)

## 📚 API 문서

서버 실행 후 자동 생성된 문서:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🆘 지원

문제가 발생하면:
1. 로그 확인: `backend/logs/`
2. 헬스체크 실행: `curl http://localhost:8000/api/v1/ai-assist/health`
3. 벡터스토어 상태: `curl http://localhost:8000/api/v1/ai-assist/vectorstore/status`

