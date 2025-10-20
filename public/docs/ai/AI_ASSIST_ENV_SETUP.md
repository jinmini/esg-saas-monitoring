# AI Assist 환경변수 설정 가이드

## 📋 개요

AI Assist 모듈은 `.env` 파일을 통해 설정을 관리합니다. 모든 환경변수는 `AI_ASSIST_` 접두사를 사용합니다.

---

## 🔑 필수 환경변수

`.env` 파일에 다음 3가지 필수 항목을 설정해야 합니다:

```bash
# 1. Gemini API 키 (필수)
AI_ASSIST_GEMINI_API_KEY="your-api-key-here"

# 2. Gemini 모델 (기본값: gemini-2.5-flash)
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"

# 3. 임베딩 모델 (기본값: intfloat/multilingual-e5-base)
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"
```

---

## 📝 전체 환경변수 목록

### 1. Gemini API 설정

```bash
# API 키 (필수)
AI_ASSIST_GEMINI_API_KEY="your-gemini-api-key-here"

# 모델 이름 (선택, 기본값: gemini-2.5-flash)
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"

# Temperature 설정 (선택, 기본값: 0.3)
# 0.0 = 매우 결정적, 1.0 = 매우 창의적
AI_ASSIST_GEMINI_TEMPERATURE=0.3

# 최대 출력 토큰 수 (선택, 기본값: 2048)
AI_ASSIST_GEMINI_MAX_TOKENS=2048
```

**사용 가능한 모델:**
- `gemini-2.5-flash` (권장) - 최신 안정 버전, 높은 TPM
- `gemini-2.5-flash-preview` - 실험적 기능 포함
- `gemini-2.5-pro` - 더 높은 품질, 낮은 RPM

---

### 2. 임베딩 모델 설정

```bash
# 임베딩 모델 (선택, 기본값: intfloat/multilingual-e5-base)
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"

# 디바이스 설정 (선택, 기본값: None = 자동 감지)
# 'cuda' = GPU 사용, 'cpu' = CPU 사용
AI_ASSIST_EMBEDDING_DEVICE=

# 배치 크기 (선택, 기본값: 32)
# GPU 메모리에 따라 자동 조정됨
AI_ASSIST_EMBEDDING_BATCH_SIZE=32
```

**지원되는 임베딩 모델:**
- `intfloat/multilingual-e5-base` (권장) - 한국어 최적화
- `sentence-transformers/all-MiniLM-L6-v2` - 영어 경량
- `BAAI/bge-m3` - 다국어 고성능

---

### 3. ChromaDB 설정

```bash
# 벡터스토어 저장 경로 (선택, 기본값: ./data/chroma)
AI_ASSIST_CHROMA_PERSIST_DIR="./data/chroma"

# 컬렉션 이름 (선택, 기본값: esg_standards)
AI_ASSIST_CHROMA_COLLECTION_NAME="esg_standards"
```

---

### 4. ESG 데이터 경로

```bash
# ESG 표준 데이터 디렉토리 (선택)
AI_ASSIST_ESG_DATA_DIR="./backend/src/ai_assist/esg_mapping/data"
```

**디렉토리 구조:**
```
esg_mapping/data/
├── gri_2021.jsonl      # GRI 표준
├── tcfd_2017.jsonl     # TCFD 표준
└── sasb_2023.jsonl     # SASB 표준
```

---

### 5. 자동 갱신 설정

```bash
# 자동 갱신 활성화 여부 (선택, 기본값: false)
AI_ASSIST_AUTO_REFRESH_ENABLED=false

# 갱신 확인 주기 (선택, 기본값: 3600초 = 1시간)
AI_ASSIST_REFRESH_CHECK_INTERVAL=3600
```

**사용 시나리오:**
- `true`: JSONL 파일 변경 시 자동으로 벡터스토어 재생성
- `false`: 수동으로 `/api/ai/refresh/force-all` 엔드포인트 호출

---

### 6. Rate Limiting 설정

```bash
# Free Tier (기본값)
AI_ASSIST_RATE_LIMIT_RPM=10       # Requests per minute
AI_ASSIST_RATE_LIMIT_TPM=250000   # Tokens per minute
AI_ASSIST_RATE_LIMIT_RPD=250      # Requests per day
```

**Tier별 권장 설정:**

#### Free Tier
```bash
AI_ASSIST_RATE_LIMIT_RPM=10
AI_ASSIST_RATE_LIMIT_TPM=250000
AI_ASSIST_RATE_LIMIT_RPD=250
```

#### Tier 1 (Cloud Billing 활성화)
```bash
AI_ASSIST_RATE_LIMIT_RPM=1000
AI_ASSIST_RATE_LIMIT_TPM=1000000
AI_ASSIST_RATE_LIMIT_RPD=10000
```

#### Tier 2 ($250+ 누적 지출)
```bash
AI_ASSIST_RATE_LIMIT_RPM=2000
AI_ASSIST_RATE_LIMIT_TPM=4000000
AI_ASSIST_RATE_LIMIT_RPD=  # 제한 없음
```

---

## 🚀 빠른 시작 설정

**최소 설정 (Free Tier):**

```bash
AI_ASSIST_GEMINI_API_KEY="your-api-key-here"
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"
```

**권장 설정 (개발 환경):**

```bash
# API 설정
AI_ASSIST_GEMINI_API_KEY="your-api-key-here"
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"
AI_ASSIST_GEMINI_TEMPERATURE=0.3
AI_ASSIST_GEMINI_MAX_TOKENS=2048

# 임베딩 설정
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"
AI_ASSIST_EMBEDDING_DEVICE=  # 자동 감지
AI_ASSIST_EMBEDDING_BATCH_SIZE=32

# ChromaDB
AI_ASSIST_CHROMA_PERSIST_DIR="./data/chroma"
AI_ASSIST_CHROMA_COLLECTION_NAME="esg_standards"

# 데이터 경로
AI_ASSIST_ESG_DATA_DIR="./backend/src/ai_assist/esg_mapping/data"

# 자동 갱신 (개발 시 비활성화 권장)
AI_ASSIST_AUTO_REFRESH_ENABLED=false

# Rate Limiting (Free Tier)
AI_ASSIST_RATE_LIMIT_RPM=10
AI_ASSIST_RATE_LIMIT_TPM=250000
AI_ASSIST_RATE_LIMIT_RPD=250
```

**프로덕션 설정 (Tier 1 이상):**

```bash
# API 설정
AI_ASSIST_GEMINI_API_KEY="your-production-api-key"
AI_ASSIST_GEMINI_MODEL="gemini-2.5-flash"
AI_ASSIST_GEMINI_TEMPERATURE=0.2  # 더 결정적
AI_ASSIST_GEMINI_MAX_TOKENS=2048

# 임베딩 설정 (GPU 사용)
AI_ASSIST_EMBEDDING_MODEL="intfloat/multilingual-e5-base"
AI_ASSIST_EMBEDDING_DEVICE="cuda"
AI_ASSIST_EMBEDDING_BATCH_SIZE=64  # GPU 메모리에 따라 조정

# ChromaDB (영속 경로)
AI_ASSIST_CHROMA_PERSIST_DIR="/var/lib/esg-gen/chroma"
AI_ASSIST_CHROMA_COLLECTION_NAME="esg_standards_prod"

# 자동 갱신 활성화
AI_ASSIST_AUTO_REFRESH_ENABLED=true
AI_ASSIST_REFRESH_CHECK_INTERVAL=3600

# Rate Limiting (Tier 1)
AI_ASSIST_RATE_LIMIT_RPM=1000
AI_ASSIST_RATE_LIMIT_TPM=1000000
AI_ASSIST_RATE_LIMIT_RPD=10000
```

---

## 🔍 Gemini API 키 발급

### 1. AI Studio에서 발급 (무료)

1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. 기존 Google Cloud 프로젝트 선택 또는 신규 생성
4. 생성된 API 키 복사

**제한사항:**
- Free Tier 적용
- RPM: 10, TPM: 250,000, RPD: 250

### 2. Google Cloud Console에서 발급 (유료)

1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "API Key"
5. Cloud Billing 활성화 (Tier 1 이상)

**장점:**
- 더 높은 Rate Limits
- 프로덕션 환경 적합
- 세밀한 모니터링

---

## 📊 Gemini 2.5 Flash Rate Limits 상세

출처: [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

| Tier | 자격 요건 | RPM | TPM | RPD |
|------|---------|-----|-----|-----|
| **Free** | 지원 국가 거주 | 10 | 250,000 | 250 |
| **Tier 1** | Cloud Billing 활성화 | 1,000 | 1,000,000 | 10,000 |
| **Tier 2** | $250+ 누적 지출 + 30일 이상 | 2,000 | 4,000,000 | * |
| **Tier 3** | $1,000+ 누적 지출 + 30일 이상 | 10,000 | 8,000,000 | * |

**\*** = 제한 없음

### Rate Limit 초과 시 대응

1. **429 에러 발생**: 너무 많은 요청
   ```python
   # 자동 재시도 (exponential backoff 적용됨)
   # gemini_client.py에서 이미 구현됨
   ```

2. **RPD 제한 도달**: 다음날 00:00 PST에 초기화
   - 긴급한 경우 Tier 업그레이드 요청

3. **Tier 업그레이드**:
   - AI Studio > API Keys > "Upgrade" 버튼
   - 자격 요건 충족 시 자동 승인

---

## 🛠️ 트러블슈팅

### 1. API 키 인식 안됨
```bash
# 오류: GEMINI_API_KEY not found in environment
```

**해결:**
- `.env` 파일이 `backend/` 디렉토리에 있는지 확인
- 환경변수 이름이 `AI_ASSIST_GEMINI_API_KEY`인지 확인
- 따옴표 사용: `AI_ASSIST_GEMINI_API_KEY="your-key"`

### 2. Rate Limit 에러
```bash
# 오류: 429 Too Many Requests
```

**해결:**
1. 현재 Tier 확인: https://aistudio.google.com/app/apikey
2. `.env`의 Rate Limit 설정을 현재 Tier에 맞게 조정
3. Tier 업그레이드 고려

### 3. CUDA 디바이스 인식 안됨
```bash
# 경고: CUDA not available, using CPU
```

**해결:**
```bash
# PyTorch CUDA 버전 재설치
pip uninstall torch
pip install torch --index-url https://download.pytorch.org/whl/cu121

# 확인
python -c "import torch; print(torch.cuda.is_available())"
```

### 4. 모델 다운로드 실패
```bash
# 오류: OSError: Can't load model 'intfloat/multilingual-e5-base'
```

**해결:**
```bash
# 수동 다운로드
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-base')"
```

---

## 📚 참고 자료

- **Gemini API 문서**: https://ai.google.dev/docs
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits
- **모델 정보**: https://ai.google.dev/gemini-api/docs/models
- **Pricing**: https://ai.google.dev/pricing
- **Google Cloud Billing**: https://cloud.google.com/billing/docs

---

**작성일**: 2025-10-16  
**최종 수정**: 2025-10-16  
**버전**: 1.0.0

