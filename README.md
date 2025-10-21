# 🌱 ESG Compliance AI

> **LLM 기반 ESG 매핑 엔진을 활용한 지속가능성 보고서 작성 플랫폼**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)

---

## 📌 프로젝트 개요

**ESG Compliance AI**는 기업의 ESG(환경·사회·지배구조) 보고서 작성을 **AI로 지원**하는 SaaS 플랫폼입니다.

### 🎯 핵심 가치

1. **LLM 기반 ESG 표준 매핑 엔진**  
   - 사용자가 작성한 문장을 GRI/SASB/TCFD 표준에 자동 매핑
   - Gemini 2.5 Flash + Vector Search로 맥락 기반 분석

2. **실시간 편집 환경**  
   - Notion 스타일 블록 에디터
   - AI 제안 통합 (Sparkles 아이콘)

3. **100% 무료 배포 아키텍처**  
   - 포트폴리오용 최적화 (Vercel + Render + Supabase)
   - JSON Vector Store로 ChromaDB 대체 (비용 $0, 속도 70% ↑)

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                  │
│               Next.js 15 + Tailwind CSS             │
└───────────────────┬─────────────────────────────────┘
                    │ REST API
        ┌───────────▼──────────┐
        │   Backend (FastAPI)  │
        │   - AI Assist Layer  │
        │   - Vector Search    │
        │   - Prometheus       │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┬───────────────────┐
        │                      │                   │
        │   Supabase (DB)      │  Gemini API       │
        │   PostgreSQL 2GB     │  (Free Tier)      │
        └──────────────────────┴───────────────────┘
```

### 기술 스택

| Layer | Stack | 버전 |
|-------|-------|------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS, Zustand | 15.1.6 |
| **Backend** | FastAPI, Python, Pydantic | 3.12 / 0.115 |
| **AI/ML** | Gemini 2.5 Flash, intfloat/multilingual-e5-base | - |
| **Database** | PostgreSQL (Supabase) | 15 |
| **Vector Search** | JSON Vector Store (Custom) | - |
| **Monitoring** | Prometheus, Grafana (예정) | - |
| **Deployment** | Vercel (FE), Render (BE), Supabase (DB) | - |

---

## ✨ 주요 기능

### 1. 🤖 AI 기반 ESG 매핑 (Phase 4.3 완료)

- **입력**: 사용자 작성 텍스트  
  > "임직원 1인당 평균 연 40시간의 교육을 제공하며..."

- **출력**: ESG 표준 매핑  
  ```json
  {
    "standard_id": "GRI 404-1",
    "framework": "GRI",
    "category": "Social",
    "topic": "Employee Training",
    "confidence": 0.92
  }
  ```

- **성능**:  
  - Vector Search: <1ms (181개 문서)
  - LLM Analysis: ~24초 (Gemini 2.5 Flash)
  - Total: ~24.4초

### 2. 📝 블록 기반 에디터

- Heading, Paragraph, Bullet List, Table
- Drag & Drop 재정렬
- AI 제안 통합 (Sparkles 버튼)

### 3. 📊 실시간 관찰성 (Observability)

- Prometheus Metrics 수집
- Slack 알림 (에러율, 레이턴시)
- Request ID 추적

---

## 🚀 빠른 시작

### 사전 준비

- Node.js 18+ / pnpm 8+
- Python 3.12+
- PostgreSQL 15+ (또는 Supabase)
- Google AI Studio API Key ([발급](https://aistudio.google.com/app/apikey))

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/esg-compliance-ai.git
cd esg-compliance-ai
```

### 2. Backend 설정

```bash
cd backend

# 가상환경 생성
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 의존성 설치 (로컬 개발용)
pip install -r requirements/base.txt
pip install -r requirements/ai.txt

# 환경 변수 설정
cp env.example.txt .env
# .env 파일 수정:
# - AI_ASSIST_USE_GEMINI_EMBEDDING=false  # 로컬 개발
# - AI_ASSIST_GEMINI_API_KEY=your_api_key
# - DATABASE_URL=postgresql://...
```

### 3. Vector Store 생성

```bash
cd backend
python scripts/generate_vector_json.py
```

**출력**: `frontend/public/data/esg_vectors.json` (4.18MB, 181개 문서)

### 4. Backend 실행

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

### 5. Frontend 설정 & 실행

```bash
cd frontend

# 의존성 설치
pnpm install

# 환경 변수 설정
cp env.local.example.txt .env.local
# .env.local 파일 수정:
# - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# 개발 서버 실행
pnpm dev
```

### 6. 접속

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)
- Metrics: [http://localhost:8000/metrics](http://localhost:8000/metrics)

---

## 📦 배포 가이드

### 100% 무료 배포 전략

| 서비스 | 역할 | 비용 | 제한사항 |
|--------|------|------|----------|
| **Vercel** | Frontend (Next.js) | $0 | 100GB/월 대역폭 |
| **Render** | Backend (FastAPI) | $0 | 15분 후 Sleep |
| **Supabase** | PostgreSQL | $0 | 2GB 용량 |
| **Google AI Studio** | Gemini API | $0 | 10 RPM, 250 RPD |

### 배포 최적화

**Render Free Tier 호환**:
- ✅ Gemini Embedding API 사용 (PyTorch 제거)
- ✅ 메모리: 1.2GB → 150MB (88% ↓)
- ✅ 빌드 시간: 10분 → 1분 (90% ↓)
- 📄 상세: [DEPLOYMENT_OPTIMIZATION.md](backend/DEPLOYMENT_OPTIMIZATION.md)

### 배포 단계

1. **Supabase 설정**: [SUPABASE_SETUP.md](public/docs/deployment/SUPABASE_SETUP.md)
2. **Render 배포**: `render.yaml` 사용 (`requirements/deploy.txt`)
3. **Vercel 배포**: `vercel.json` 사용
4. **전체 가이드**: [DEPLOYMENT_CHECKLIST.md](public/docs/deployment/DEPLOYMENT_CHECKLIST.md)

---

## 📂 프로젝트 구조

```
esg-gen-v1/
├── backend/
│   ├── src/
│   │   ├── ai_assist/              # AI Assist Layer (Phase 4.3)
│   │   │   ├── esg_mapping/        # ESG 매핑 엔진
│   │   │   │   ├── data/           # GRI/SASB JSONL 데이터
│   │   │   │   ├── vectorstore/    # JSON Vector Store
│   │   │   │   └── json_vector_service.py
│   │   │   ├── core/               # Embeddings, Gemini Client
│   │   │   ├── monitoring/         # Prometheus, Slack
│   │   │   └── router.py           # /api/v1/ai-assist
│   │   ├── articles/               # 기사 크롤링 (Sprint 1-4)
│   │   ├── documents/              # 문서 관리
│   │   └── main.py
│   ├── scripts/
│   │   ├── generate_vector_json.py # Vector Store 생성
│   │   └── test_vector_performance.py
│   ├── requirements/
│   │   ├── base.txt       # FastAPI, DB, 공통
│   │   ├── ai.txt         # 로컬 개발 (torch 포함)
│   │   └── deploy.txt     # Render 배포 (Gemini API)
│   └── DEPLOYMENT_OPTIMIZATION.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   └── report-editor/  # 블록 에디터
│   │   │   └── ai-assist/          # AI 패널
│   │   ├── store/
│   │   │   ├── editorStore.ts
│   │   │   └── aiAssistStore.ts
│   │   └── lib/
│   │       └── aiAssistClient.ts
│   └── public/
│       └── data/
│           └── esg_vectors.json    # 4.18MB Vector Store
├── public/docs/                    # 프로젝트 문서
│   ├── ai/                         # AI Assist 문서
│   ├── DEPLOYMENT_GUIDE.md
│   └── SUPABASE_SETUP.md
├── render.yaml                     # Render 배포 설정
└── README.md
```

---

## 🎓 개발 스토리

### Sprint 1-4: 기본 인프라 (완료)
- Docker 환경 구축
- PostgreSQL 모델링 (10개 테이블)
- 네이버 뉴스 크롤러
- API 레벨 필터링 (97% 노이즈 제거)

### Phase 4.3: AI Assist Layer (완료 ✅)
- **ESG 매핑 엔진**: GRI 2021 표준 181개 문서
- **Vector Search**: JSON Vector Store (279ms, ChromaDB 대비 70% ↑)
- **LLM 분석**: Gemini 2.5 Flash (토큰 최적화)
- **Observability**: Prometheus + Slack 연동
- **Frontend 통합**: Zustand + Sparkles UI

### Phase 4.4: Content Expansion (미구현)
- `/expand` API는 스킵 (포트폴리오 스토리 우선)

---

## 📊 성능 지표

### JSON Vector Store vs ChromaDB

| 항목 | JSON Vector Store | ChromaDB |
|------|-------------------|----------|
| **Vector Search** | <1ms | 83ms |
| **Total Response** | 279ms | 950ms |
| **메모리** | ~20MB | ~150MB |
| **배포 비용** | $0 | $7/월 (Volume) |

**결론**: 181개 문서 수준에서는 JSON Vector Store가 압도적 우위

---

## 🐛 트러블슈팅

### 1. Render Sleep 문제
**증상**: 첫 요청 시 50초 대기  
**해결**: BetterStack 무료 모니터링 (10분마다 ping)

### 2. CORS 에러
**증상**: `Access-Control-Allow-Origin` 에러  
**해결**: `CORS_ORIGINS` 환경 변수에 Vercel 도메인 추가

### 3. Vector Store 로드 실패
**증상**: `FileNotFoundError`  
**해결**: `generate_vector_json.py` 재실행

---

## 📚 문서

- [배포 가이드](public/docs/DEPLOYMENT_GUIDE.md)
- [Supabase 설정](public/docs/SUPABASE_SETUP.md)
- [AI Assist PRD](public/docs/ai/AI_PRD.md)
- [API 문서](http://localhost:8000/docs) (로컬 실행 시)

---

## 🤝 기여

이 프로젝트는 포트폴리오 목적으로 개발되었으며, 현재 외부 기여를 받지 않습니다.

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

---

## 👤 제작자

**김정민 (KJM)**  
- Portfolio: [작성 예정]
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

## 🎉 Acknowledgments

- **ESG Standards**: GRI, SASB, TCFD
- **AI Models**: Google Gemini, Hugging Face Embeddings
- **UI Inspiration**: Notion, Linear

---

**마지막 업데이트**: 2025-01-20  
**버전**: 1.0.0 (Phase 4.3 완료)

