# ESG Report AI Assist Layer 구축

## 🧩 1️⃣ 전체 구조 개요

```
┌────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                 │
│                                                        │
│  [Report Editor Canvas]                                │
│    │  ├─ 블록 선택 / 우클릭 → AI ActionMenu           │
│    │  ├─ 사이드 패널(AIAssistPanel) → 요청 표시       │
│    │  └─ useAIAssist Hook → /api 호출                 │
│                                                        │
│  [AIAssistPanel]                                       │
│    ├─ Summarize / Rewrite / ESG Map 버튼               │
│    ├─ AISuggestionCard(적용 버튼)                      │
│    └─ TopBar(저장 상태 표시 연동)                     │
└───────────────▲────────────────────────────────────────┘
                │
     HTTP POST  │
                ▼
┌────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                   │
│                                                        │
│  [ai_assist/router.py]                                 │
│    ├─ /summarize                                       │
│    ├─ /rewrite                                         │
│    └─ /map-esg                                         │
│         │                                               │
│         ▼                                               │
│  [ai_assist/service.py]                                │
│    ├─ Input validation (schemas)                       │
│    ├─ ESG context lookup (RAG optional)                │
│    ├─ Prompt template 조합 (prompts.py)                │
│    └─ GeminiClient 호출 (gemini_client.py)             │
│         │                                               │
│         ▼                                               │
│  [Gemini API Server (googleapis.com)]                  │
│         │                                               │
│         ▼                                               │
│  [응답 후 DB 저장 (models.py)]                        │
│    └─ ai_suggestions(id, document_id, block_id, type, 
│                      suggestion, confidence, created_at)
└────────────────────────────────────────────────────────┘
                │
     JSON 응답  ▼
┌────────────────────────────────────────────────────────┐
│          Frontend (React Query response)                │
│    ├─ AISuggestionCard 렌더링                           │
│    └─ “적용” → CommandSystem(UpdateBlockContent)        │
│                    ↓                                   │
│                Autosave → 버전 생성                    │
└────────────────────────────────────────────────────────┘
```

## backend 아키텍처
backend/src/ai_assist/
├── __init__.py
├── router.py
├── config.py
├── exceptions.py
├── models.py
│
├── core/
│   ├── gemini_client.py
│   ├── rate_limiter.py
│   ├── prompt_base.py
│   ├── monitoring.py
│   └── embeddings.py              # ✅ HuggingFaceEmbeddings 초기화 (e5-base)
│
├── summarize/
│   ├── service.py
│   ├── prompts.py
│   └── schemas.py
│
├── rewrite/
│   ├── service.py
│   ├── prompts.py
│   └── schemas.py
│
└── esg_mapping/
    ├── service.py                 # ESG 매핑 핵심 로직 (map_esg)
    ├── prompts.py                 # ESG 매핑용 Prompt 템플릿
    ├── schemas.py                 # 요청/응답 스키마
    │
    ├── data/
    │   ├── gri_2021.jsonl         # ✅ JSONL 형식 (line-separated)
    │   ├── sasb_2023.jsonl
    │   ├── tcfd_2024.jsonl
    │   └── esrs_2024.jsonl
    │
    ├── loaders/
    │   └── jsonl_loader.py        # ✅ JSONL 파일 Stream 로더
    │
    ├── vectorstore/
    │   ├── embed_pipeline.py      # ✅ 임베딩 및 인덱싱 (multilingual-e5-base)
    │   ├── chroma_manager.py      # ✅ Chroma vectorstore 핸들러
    │   └── refresh_task.py        # ✅ 데이터 변경 감지 후 재임베딩
    │
    └── utils/
        ├── file_watcher.py        # 파일 변경 감지 (옵션)
        └── validator.py           # JSONL Schema 검증


## frontend 아키텍처
frontend/
└── components/
    └── features/
        └── ai-assist/
            ├── AIAssistPanel.tsx        # 오른쪽 사이드바
            ├── AISuggestionCard.tsx     # 제안 카드
            ├── AIActionMenu.tsx         # 블록 우클릭 메뉴
            └── hooks/
                ├── useAIAssist.ts       # React Query
                └── useAISuggestion.ts
---

## 🧩 2️⃣ 데이터 플로우 (Summarize 예시)

1. **사용자 행동**
   블록 선택 → “AI 요약” 버튼 클릭
2. **Frontend 요청**
   `POST /api/v1/ai-assist/summarize`

   ```json
   { "text": "...", "goal": "short_summary", "context": "E section" }
   ```
3. **Backend Service 로직**

   * Prompt 생성 (`prompts.summarize_prompt`)
   * Gemini API 호출
   * 결과 파싱 → DB 로그 저장
4. **응답 전달**

   ```json
   { "type": "summary", "suggestion": "..." }
   ```
5. **Frontend 렌더링**

   * `AISuggestionCard`에 표시
   * “적용하기” → `CommandSystem.execute(UpdateBlockContent)`
   * `uiStore.setSaveStatus('edited')`
6. **Autosave**

   * 3초 후 PUT → `/api/documents/:id`
   * 새 버전 생성

---

## 🧱 3️⃣ ESG 기준 매핑 데이터 플로우

```
사용자 → "ESG 매핑 확인"
   ↓
POST /api/v1/ai-assist/map-esg
   ↓
service.map_esg()
   ├─ ESG 기준 데이터셋 조회 (JSON or DB)
   ├─ Gemini Prompt에 삽입
   ├─ 결과: { standard_id, title, confidence }
   ↓
응답 → AIAssistPanel 표시
   ↓
“적용” → 블록 metadata.esg_tags 업데이트
```

---

## 🧠 4️⃣ 핵심 데이터 모델 개념

| Table              | 주요 필드                                                                             | 설명            |
| ------------------ | --------------------------------------------------------------------------------- | ------------- |
| **ai_suggestions** | `id`, `document_id`, `block_id`, `type`, `suggestion`, `confidence`, `created_at` | AI 제안 로그 저장   |
| **esg_standards**  | `standard_id`, `framework`, `topic`, `description`, `keywords`                    | ESG 기준 참조 데이터 |
| **documents**      | 기존 문서 테이블                                                                         | FK 연결         |

---

## ⚙️ 5️⃣ 기술 Stack 요약

| 계층           | 기술                                                 |
| ------------ | -------------------------------------------------- |
| **Frontend** | Next.js 15 · React 19 · Zustand · React Query      |
| **Backend**  | FastAPI · Gemini API · SQLAlchemy                  |
| **Storage**  | PostgreSQL (문서 및 AI 로그), Redis (optional queue)    |
| **AI**       | Google Gemini 2.0 Flash (model="gemini-2.0-flash") |
| **추후 확장**    | LangChain + Chroma (RAG for ESG Mapping)           |                          |

---

## ESG 기준 데이터 구조 구체화

```
// backend/src/ai_assist/esg_mapping/data/gri_standards.json
{
  "framework": "GRI",
  "version": "2021",
  "standards": [
    {
      "id": "GRI 305-1",
      "category": "Environment",
      "topic": "Emissions",
      "title": "Direct (Scope 1) GHG emissions",
      "description": "The organization shall report...",
      "keywords": ["carbon", "emissions", "greenhouse gas", "scope 1", "direct emissions"],
      "required_disclosures": [...],
      "examples": [
        "Our company's direct emissions from owned facilities totaled 1,200 tCO2e in 2024."
      ]
    }
  ]
}
```

## DB 스키마 (Phase 3 이후):
```
class ESGStandard(Base):
    __tablename__ = "esg_standards"
    
    id = Column(Integer, primary_key=True)
    standard_id = Column(String(50), unique=True, index=True)  # "GRI 305-1"
    framework = Column(String(20))  # GRI, SASB, TCFD, ESRS
    category = Column(String(10))   # E, S, G
    topic = Column(String(100))
    title = Column(String(500))
    description = Column(Text)
    keywords = Column(ARRAY(String))  # PostgreSQL Array
    embedding = Column(Vector(1536))  # pgvector for RAG (Phase 3)
```

---

## Rate Limiter 구현 상세화

```
# backend/src/ai_assist/core/rate_limiter.py
from datetime import datetime, timedelta
from collections import deque
import asyncio

class GeminiRateLimiter:
    """
    Gemini API 무료 티어 제한:
    - 15 RPM (requests per minute)
    - 32,000 TPM (tokens per minute)
    - 1,500 RPD (requests per day)
    """
    def __init__(self):
        self.requests_per_minute = deque(maxlen=15)
        self.requests_per_day = deque(maxlen=1500)
        self.tokens_per_minute = 0
        self.last_token_reset = datetime.now()
    
    async def acquire(self, estimated_tokens: int = 1000):
        """Rate limit 체크 및 대기"""
        now = datetime.now()
        
        # 1분 단위 리셋
        if now - self.last_token_reset > timedelta(minutes=1):
            self.tokens_per_minute = 0
            self.last_token_reset = now
        
        # RPM 체크
        if len(self.requests_per_minute) >= 15:
            oldest = self.requests_per_minute[0]
            wait_time = 60 - (now - oldest).total_seconds()
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        # TPM 체크
        if self.tokens_per_minute + estimated_tokens > 32000:
            await asyncio.sleep(60)
            self.tokens_per_minute = 0
        
        self.requests_per_minute.append(now)
        self.requests_per_day.append(now)
        self.tokens_per_minute += estimated_tokens
```

- Router에서 사용
```
rate_limiter = GeminiRateLimiter()

@router.post("/summarize")
async def summarize(request: SummarizeRequest):
    await rate_limiter.acquire(estimated_tokens=500)
    # ... Gemini API 호출
```

## AI Suggestion 로그 스키마 보완
```
# backend/src/ai_assist/models.py
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
from src.shared.models import Base, TimestampMixin

class AISuggestion(Base, TimestampMixin):
    __tablename__ = "ai_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True, index=True)
    block_id = Column(String(100), nullable=True)  # Frontend block UUID
    
    # 제안 타입
    type = Column(String(50), nullable=False, index=True)  # 'summarize', 'rewrite', 'esg_mapping'
    
    # 입력/출력
    input_text = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=False)
    
    # 메타데이터
    confidence = Column(Float, nullable=True)  # 0.0 ~ 1.0
    esg_tags = Column(JSON, nullable=True)  # ["GRI 305-1", "TCFD Metrics"]
    
    # 사용자 피드백
    user_action = Column(String(20), nullable=True)  # 'accepted', 'rejected', 'modified', 'ignored'
    user_modified_text = Column(Text, nullable=True)  # 사용자가 수정한 최종 텍스트
    
    # API 정보
    model_version = Column(String(50), default="gemini-2.0-flash")
    tokens_used = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    # 추적
    user_id = Column(Integer, nullable=True)
    session_id = Column(String(100), nullable=True)
```

- 사용자 수락률 분석 (accepted vs rejected)
- API 비용 추적 (tokens_used)
- 성능 모니터링 (latency_ms)
- A/B 테스트 가능 (model_version)

## Prompt 템플릿 체계화
```
# backend/src/ai_assist/core/prompt_base.py
from typing import Dict, Any
from jinja2 import Template

class PromptTemplate:
    """프롬프트 베이스 클래스"""
    
    def __init__(self, template: str):
        self.template = Template(template)
    
    def render(self, **kwargs) -> str:
        return self.template.render(**kwargs)

# backend/src/ai_assist/summarize/prompts.py
SUMMARIZE_PROMPT = PromptTemplate("""
You are an ESG reporting expert. Summarize the following text for a sustainability report.

**Requirements:**
- Keep the summary concise ({{ max_words }} words max)
- Maintain {{ tone }} tone
- Focus on {{ context }} aspects
- Preserve key metrics and data points

**Text to summarize:**
{{ text }}

**Summary:**
""")

def get_summarize_prompt(text: str, max_words: int = 50, tone: str = "professional", context: str = "ESG") -> str:
    return SUMMARIZE_PROMPT.render(
        text=text,
        max_words=max_words,
        tone=tone,
        context=context
    )
```

Frontend - Backend 계약 명확화
```
// frontend/src/types/ai.ts
export interface AISummarizeRequest {
  text: string;
  documentId: number;
  sectionId: number;
  blockId: string;
  options?: {
    maxWords?: number;
    tone?: 'professional' | 'casual' | 'academic';
    language?: 'ko' | 'en';
  };
}

export interface AISummarizeResponse {
  type: 'summarize';
  suggestion: string;
  metadata: {
    originalLength: number;
    summaryLength: number;
    tokensUsed: number;
    processingTime: number;
  };
  confidence?: number;
}

export interface AIESGMappingResponse {
  type: 'esg_mapping';
  suggestions: Array<{
    standardId: string;      // "GRI 305-1"
    framework: 'GRI' | 'SASB' | 'TCFD' | 'ESRS';
    title: string;
    confidence: number;      // 0.0 ~ 1.0
    reasoning: string;       // "This text discusses direct emissions..."
  }>;
  metadata: {
    tokensUsed: number;
    processingTime: number;
  };
}
```

## 에러 처리 표준화
```
# backend/src/ai_assist/exceptions.py
from fastapi import HTTPException, status

class AIAssistException(HTTPException):
    """AI Assist 기본 예외"""
    pass

class RateLimitExceeded(AIAssistException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
        )

class GeminiAPIError(AIAssistException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI 서비스 오류: {detail}"
        )

class InvalidPromptError(AIAssistException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"잘못된 요청: {detail}"
        )

class ContentFilterError(AIAssistException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="생성된 콘텐츠가 정책 위배로 필터링되었습니다."
        )
```

## 모니터링 및 로깅 추가
```
# backend/src/ai_assist/core/monitoring.py
import time
from functools import wraps
import logging

logger = logging.getLogger(__name__)

def track_ai_request(func):
    """AI 요청 추적 데코레이터"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        request_type = func.__name__
        
        try:
            result = await func(*args, **kwargs)
            latency = int((time.time() - start_time) * 1000)
            
            logger.info(f"AI Request Success: {request_type} | Latency: {latency}ms")
            
            return result
        except Exception as e:
            latency = int((time.time() - start_time) * 1000)
            logger.error(f"AI Request Failed: {request_type} | Latency: {latency}ms | Error: {str(e)}")
            raise
    
    return wrapper
```

