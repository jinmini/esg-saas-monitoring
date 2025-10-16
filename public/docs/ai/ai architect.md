# 🧭 **AI Assist Layer — 설계 논의 1차 정리**


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
| **추후 확장**    | LangChain + Chroma (RAG for ESG Mapping)           |

---

## 💬 6️⃣ Phase 2 → 3 전환 전략

| 항목        | Phase 2 (현재)          | Phase 3 (예정)         |
| --------- | --------------------- | -------------------- |
| **AI 모델** | Gemini API            | Local + RAG Hybrid   |
| **데이터셋**  | Static ESG JSON       | Vector DB (Chroma)   |
| **UX 모드** | 클릭 → AI 호출            | 실시간 Draft Suggest    |
| **로깅**    | Basic Suggestion Logs | Feedback + Analytics |
| **보안**    | API Key               | Internal Auth Token  |


---

## 🧩 1️⃣ AI 기능 범위 정의

| 기능               | 목표                                                               | 구현 전략                                                                                                                                                            | 논의 포인트                                                          |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **A. ESG 기준 매핑** | 사용자가 작성한 문단을 GRI, SASB, ESRS, TCFD 기준에 매핑하고, 누락 항목 또는 관련 템플릿을 제안 | - ESG 기준 데이터셋(JSON or DB) 구축 <br>- Gemini 또는 Local LLM이 문단 분석 후 “기준 후보 + 신뢰도 점수” 반환 <br>- Backend에서 RAG(LangChain + FAISS/Chroma)로 ESG 기준 문항 검색 후 LLM Prompt에 삽입 | ⚙️ RAG를 직접 구축할지, Gemini 자체 reasoning에 맡길지? <br>데이터셋 형식/출처 확정 필요 |
| **B. 문단 요약**     | ESG 보고서 스타일에 맞는 concise summary 생성                               | - Prompt 기반 Summarization (style prompt 포함) <br>- 목표 단어 수/톤 옵션 제공                                                                                                | 🧠 “섹션 단위 요약”은 비용↑, “블록 단위 요약”은 context↓ — granularity 결정 필요    |
| **C. 문장 리라이팅**   | 명확성·톤·언어를 개선                                                     | - “rewrite(style=formal)” 형태 프롬프트 <br>- 다국어 모델 사용 (Gemini multilingual)                                                                                          | 🌐 한국어 ↔ 영어 혼용 상황 처리 방식 논의 필요                                   |

---

## 🧠 2️⃣ 사용자 인터랙션 방식

### 💡 제안

> **Option B (사이드 패널형)** + **Option A (블록 우클릭 트리거)** 의 **혼합형 구조**

#### 구조

1. 블록 선택 → “AI 도움받기” 클릭 (트리거)
2. 오른쪽 **AIAssistPanel** 열림
   → 자동으로 현재 블록의 내용 분석
3. 추천 결과 3가지 유형 표시:

   * ESG 매핑 제안
   * 요약 결과
   * 리라이팅 예시
4. 각 제안 카드에 [적용하기] 버튼 (Command System과 통합)

#### 논의 포인트

* **Option C (실시간 제안)**은 Phase 3 이후 고려가 적절함
  → 실시간 inference는 비용·속도·UX 모두 부담 큼
  → 대신 “Draft Assist” 형태(=사용자 클릭 시 즉시 피드백)가 효율적

---

## 💾 3️⃣ 데이터 저장 및 히스토리

| 항목              | 결정 방향                                  | 논의 포인트                       |
| --------------- | -------------------------------------- | ---------------------------- |
| **AI 제안 내역 저장** | ✅ 저장 (별도 `ai_suggestions` 테이블)         | 사용자가 “적용”/“거절”한 로그 추적 가능     |
| **학습용 피드백**     | ❌ 직접 학습 X (개인 데이터 정책 문제)               | 대신 “통계” 기반 UX 개선에 활용         |
| **사용 통계**       | ✅ 문서별 `ai_usage_count`, `last_used_at` | Dashboard에 “AI 도움 활용도” 표시 가능 |

→ 목적은 “사용자 피드백 데이터 수집”이지 “모델 재학습”은 아님.

---

## ⚙️ 4️⃣ 성능 및 비용 고려

| 구분                      | 권장 방식                                   | 이유                      |
| ----------------------- | --------------------------------------- | ----------------------- |
| **분석 트리거**              | ⏯️ “사용자 클릭 시 실행”                        | 예측 가능한 API 호출 비용 유지     |
| **분석 단위**               | 🧩 “블록 단위 분석” (Section 병합 옵션 추가)        | 세밀한 컨트롤 & 성능 유지         |
| **Rate Limit Handling** | 대기열 Queue (Redis 기반)                    | Gemini 60RPM 한도 대비 안전장치 |
| **비동기 처리**              | FastAPI BackgroundTask + Websocket push | UX 향상 (결과 도착 알림)        |

---

## 📚 5️⃣ ESG 기준 데이터 (가장 중요한 영역)

| 방식                                          | 설명                                                                                        | 장단점                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- |
| **A. 사전 구축 Dataset (추천)**                   | GRI, SASB, TCFD 등 공개 문서를 JSON으로 구조화 <br>`standard_id`, `title`, `description`, `keywords` | ✅ 일관성 확보 <br>✅ LLM 프롬프트에 context로 제공      |
| **B. Gemini 자체 판단**                         | “이 문단은 어떤 ESG 기준에 부합합니까?”                                                                 | ⚠️ 일관성 부족, 내부 기준 불명                       |
| **C. RAG (Retrieval-Augmented Generation)** | Local DB (FAISS, Chroma)에서 기준 설명 검색 후 Gemini prompt에 삽입                                   | ✅ 정확도↑, explainability 확보 <br>⚙️ 구축비용 소폭↑ |

> 🎯 **추천 방향:**
> 1️⃣ Phase 2: A (Static JSON Dataset)
> 2️⃣ Phase 3: C (RAG 통합, Vector Embedding 기반 검색)

---

## 🛡️ 6️⃣ 에러 핸들링 및 책임 표시

| 상황                | 처리 방식                                  | UX 반영            |
| ----------------- | -------------------------------------- | ---------------- |
| API 실패            | Retry → Fallback (“요청이 일시적으로 실패했습니다.”) | Toast 알림         |
| 비정상 응답 (nonsense) | “AI 응답 품질 낮음” 태그 표시                    | 사용자 피드백 수집       |
| 응답 필터링            | profanity / hallucination 필터           | ESG 정책 위배 방지     |
| 책임 표시             | “AI가 생성한 제안입니다. 검토 후 사용하세요.”           | 항상 명시 (UX 규정 준수) |

---

## 🧱 7️⃣ 초기 설계 아키텍처 (정제 버전)

```
frontend/
└── components/features/ai-assist/
    ├── AIAssistPanel.tsx          # 사이드바 (결과 표시)
    ├── AIActionMenu.tsx           # 블록 우클릭 메뉴
    ├── AISuggestionCard.tsx       # 제안 카드 (적용 버튼 포함)
    └── hooks/
        ├── useAIAssist.ts         # 요청/상태 관리
        └── useAISuggestion.ts     # 특정 블록 제안 관리

backend/src/ai_assist/
├── __init__.py
├── router.py                 # 통합 라우터
├── config.py                 # Gemini API 설정
├── exceptions.py             # 커스텀 예외
│
├── core/                     # 공통 코어
│   ├── gemini_client.py      # Gemini API 래퍼
│   ├── rate_limiter.py       # Rate limit 관리
│   └── prompt_base.py        # 프롬프트 베이스 클래스
│
├── summarize/                # 요약 기능
│   ├── service.py
│   ├── prompts.py
│   └── schemas.py
│
├── rewrite/                  # 리라이팅 기능
│   ├── service.py
│   ├── prompts.py
│   └── schemas.py
│
├── esg_mapping/              # ESG 매핑 (가장 복잡)
│   ├── service.py
│   ├── prompts.py
│   ├── schemas.py
│   ├── standards_loader.py   # ESG 기준 데이터 로더
│   └── data/
│       ├── gri_standards.json
│       ├── sasb_standards.json
│       └── tcfd_standards.json
│
└── models.py                 # AI Suggestion 로그
```

---

## 🧩 8️⃣ API Endpoint 설계 방향 (1차 제안)

| Method | Endpoint                            | 설명                |
| ------ | ----------------------------------- | ----------------- |
| POST   | `/api/v1/ai-assist/summarize`       | 문단 요약             |
| POST   | `/api/v1/ai-assist/rewrite`         | 문장 리라이팅           |
| POST   | `/api/v1/ai-assist/map-esg`         | ESG 기준 매핑 (단일 문단) |
| POST   | `/api/v1/ai-assist/analyze-section` | 섹션 전체 요약/매핑       |

### 예시 Request

```json
{
  "text": "Our company reduced carbon emissions by 20% in 2024.",
  "goal": "clarity",
  "context": "ESG Environment section"
}
```

### 예시 Response

```json
{
  "type": "rewrite",
  "suggestion": "In 2024, our company achieved a 20% reduction in carbon emissions.",
  "metadata": {
    "esg_tags": ["GRI 305-5", "TCFD Metrics"],
    "confidence": 0.82
  }
}
```

---

## 🧭 9️⃣ 제안: AI Assist Layer 3단계 진화 로드맵

| Phase       | 목표                                               | 핵심 기술                      |
| ----------- | ------------------------------------------------ | -------------------------- |
| **Phase 2** | Gemini API로 Summarize/Rewrite/ESG Mapping MVP 구현 | Gemini + JSON ESG 기준       |
| **Phase 3** | ESG RAG 구축 (Vector 검색) + 사용자 피드백 로그 통합           | LangChain + FAISS + DB 모델링 |
| **Phase 4** | ESG Fine-tuned Local 모델 운영 + AI 통계 대시보드          | LoRA Fine-tune + Analytics |

---

