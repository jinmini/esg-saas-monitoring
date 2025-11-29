# 🌱 ESG SaaS Market Intelligence Platform

> **글로벌 ESG SaaS 시장을 한눈에: 인터랙티브 지도, 실시간 뉴스 모니터링, AI 보고서 작성**

[![Live Demo](https://img.shields.io/badge/Live-jinmini.com-brightgreen.svg)](https://jinmini.com)

---

## 📌 프로젝트 개요

**ESG SaaS Market Intelligence Platform**은 ESG 실무자를 위한 **올인원 시장 인텔리전스 플랫폼**입니다.

### 🎯 핵심 가치

1. **🗺️ 글로벌 ESG SaaS 지도 (Interactive Map)**  
   - 106개 글로벌 ESG SaaS 기업을 인터랙티브 지도로 시각화
   - 스마트 필터링으로 Feature/Framework 기반 탐색
   - 실시간 기업 정보 패널 (본사, 도메인, 지원 프레임워크)

2. **📰 실시간 뉴스 모니터링 (Market Insight)**  
   - 18개 한국 ESG SaaS 기업 뉴스 자동 수집 (네이버 API)
   - 3단계 품질 필터링 (노이즈율 0% 달성)
   - 언급량 트렌드 분석 및 대시보드

3. **📝 AI 보고서 작성 (Report Editor)**  
   - Notion 스타일 블록 에디터
   - LLM 기반 ESG 표준 자동 매핑 (GRI/SASB/TCFD)
   - Gemini 2.5 Flash + Vector Search (정확도 100%)

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────┐
│              Client (Browser) - jinmini.com         │
│     Next.js 15 + Zustand + Framer Motion + SVG     │
│     + Server Warmup (Cold Start 대응)               │
└───────────────────┬─────────────────────────────────┘
                    │ REST API (20s timeout)
        ┌───────────▼──────────┐
        │  Backend (Render)    │  ← UptimeRobot (5분 간격)
        │   - FastAPI          │
        │   - AI Assist Layer  │
        │   - News Crawler     │
        │   - Vector Search    │
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
| **Frontend** | Next.js, TypeScript, Tailwind CSS, Zustand, Framer Motion | 15.1.6 |
| **Backend** | FastAPI, Python, Pydantic | 3.12 / 0.115 |
| **AI/ML** | Gemini 2.5 Flash, intfloat/multilingual-e5-base | - |
| **Database** | PostgreSQL (Supabase) | 15 |
| **Vector Search** | JSON Vector Store (Custom) | - |
| **Monitoring** | Prometheus, UptimeRobot | - |
| **Deployment** | Vercel (FE), Render (BE), Supabase (DB) | - |
| **Domain** | jinmini.com (Vercel Custom Domain) | - |

---

## ✨ 주요 기능

### 1. 🗺️ 글로벌 ESG SaaS 지도 (Interactive Map)

**목표**: 106개 글로벌 ESG SaaS 기업을 인터랙티브 지도로 시각화

#### Key Features

- **4개 지역 상세 뷰**: Europe (53개), North America (31개), South Amreica (2개), Asia (6개), 중동(5개), Oceania (6개)
- **스마트 필터링 시스템**:
  - 검색창: 실시간 자동완성 (기업명, Features, Frameworks)
  - Region/Country: 태그 기반 다중 선택
  - Company Type: Core ESG Platform vs Operational ESG Enabler
  - Primary Domain: 13개 Feature Groups (Carbon, Supply Chain, ESG Reporting 등)
  - Framework Group: 8개 Framework Groups (Global ESG, Climate/Carbon 등)
  
- **인터랙티브 UX**:
  - SVG 기반 부드러운 줌인/아웃 애니메이션 (Framer Motion)
  - Hover 시 국가별 기업 수 툴팁
  - 클릭 시 Multi-Mode Panel (List View → Detail View)
  - Dynamic Fit-Bounds (모든 화면 크기 대응)
  - Breadcrumbs 네비게이션 (World → Region → Country)

- **데이터 품질**:
  - 수작업 큐레이션 (회사 웹사이트 + Notion DB)
  - 200+ Features, 60+ Frameworks 태깅
  - 정확한 본사 위치 좌표 (SVG 2000x857 viewBox)

#### Technical Highlights

```typescript
// Zustand Store: 11단계 필터링 로직
const filteredCompanies = companies.filter(company => {
  // 1. Search Query
  if (searchQuery && !matchesSearch(company, searchQuery)) return false;
  
  // 2. Region Filter
  if (regionFilter.length && !regionFilter.includes(company.region)) return false;
  
  // 3-11. Country, Type, Feature Groups, Frameworks...
  return true;
});
```

- **성능**: 
  - 필터 적용: <50ms (Zustand Selector 최적화)
  - 뷰 전환 애니메이션: 600ms (Framer Motion)
  - 초기 로딩: <500ms (정적 JSON)

---

### 2. 📰 실시간 뉴스 모니터링 (Market Insight)

**목표**: 18개 한국 ESG SaaS 기업 동향을 자동으로 파악

#### Key Features

- **스마트 뉴스 크롤링**:
  - 데이터 소스: 네이버 뉴스 API (25,000 requests/day)
  - 수집 대상: 하나루프, 그리너리, 엔츠, chemtopia 등 18개 기업
  - 수집 주기: On-demand + 스케줄링 지원

- **3단계 데이터 품질 보장 시스템**:
  ```python
  # 1단계: 정확한 쿼리 (Exact Word Matching)
  pattern = r'\b' + re.escape(company_name) + r'\b'
  
  # 2단계: 제목 필터링 (Negative Keywords)
  if any(neg_keyword in title for neg_keyword in negative_keywords):
      return False  # 즉시 차단
  
  # 3단계: Quality Gate (Relevance Scoring)
  score = (
      company_name_match * 0.35 +
      positive_keywords_match * 0.20 +
      context_score * 0.20  # 비즈니스/ESG 컨텍스트
  )
  return score >= 0.5  # 50% 이상만 수집
  ```

- **언급량 트렌드 분석**:
  - API: `GET /api/v1/articles/trends`
  - 주간/월간 언급량 변화율 계산
  - Rising/Falling 트렌드 자동 분류

#### 성과

- **데이터 정확도**: 노이즈율 95% → **0%** (완벽 차단)
- **하나루프**: 102개 기사 → 3개 (97% 필터링, 100% 정확도)
- **그리너리**: 향수/아파트 기사 완전 제거 (100% 관련도)

---

### 3. 📝 AI 보고서 작성 (Report Editor)

**목표**: LLM 기반 ESG 표준 자동 매핑으로 보고서 작성 시간 99% 단축

#### Key Features

- **블록 기반 에디터**:
  - Notion 스타일 UI
  - 블록 타입: Heading, Paragraph, Bullet List, Table
  - Drag & Drop 재정렬
  - Markdown 단축키 지원

- **AI 매핑 엔진**:
  ```
  사용자 텍스트 입력
      ↓
  [Gemini Embedding API] (768-dim vector)
      ↓
  [JSON Vector Store] (181 GRI documents)
      ↓ (Cosine Similarity < 1ms)
  Top-5 Candidates
      ↓
  [Gemini 2.5 Flash LLM]
      ↓ (Confidence Scoring)
  ESG Standard Matches
  ```

- **입/출력 예시**:
  - **입력**: "임직원 1인당 평균 연 40시간의 교육을 제공하며..."
  - **출력**:
    ```json
    {
      "standard_id": "GRI 404-1",
      "framework": "GRI",
      "topic": "Employee Training",
      "confidence": 0.92
    }
    ```

#### 성능

- Vector Search: **0.27ms** (181개 문서)
- LLM Analysis: ~17초 (Gemini 2.5 Flash)
- Total: ~17.4초
- **정확도**: 100% (GRI 305-1/305-2 완벽 매칭)

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

### 프로덕션 배포 현황

**🌐 Live URL**: [jinmini.com](https://jinmini.com)

| 서비스 | 역할 | 플랫폼 | 비용 | 상태 |
|--------|------|--------|------|------|
| **Frontend** | Next.js 15 + Interactive Map | Vercel | $0 | ✅ 운영 중 |
| **Backend** | FastAPI + AI Assist + Crawler | **Render** | **$0 (Free)** | ⚠️ **Cold Start 있음** |
| **Database** | PostgreSQL 15 | Supabase | $0 | ✅ 운영 중 |
| **AI Engine** | Gemini 2.5 Flash API | Google AI Studio | $0 | ✅ 운영 중 |
| **Domain** | jinmini.com | Vercel Custom Domain | $0 | ✅ 운영 중 |
| **Monitoring** | Health Check & Uptime | UptimeRobot | $0 | ✅ 5분 간격 |

### ⚠️ Render Free Plan 제약사항 및 대응

**Render Free Plan 특성**:
- ⚠️ **15분 무활동 시 Sleep** (첫 요청 시 15~30초 콜드스타트)
- ⚠️ **월 750시간 제한** (Sleep 시간 제외)
- ✅ GitHub 자동 배포
- ✅ 무료 SSL 인증서

**Cold Start 대응 전략**:
1. **UptimeRobot 모니터링** (5분 간격 Health Check) → 백그라운드 유지
2. **Frontend Warm-up API** (페이지 로드 시 서버 미리 깨우기)
3. **API Timeout 연장** (10초 → 20초, 콜드스타트 여유)
4. **현재 Uptime**: 93.74% (24시간 기준)

**Backend 최적화**:
- Gemini Embedding API 사용 (PyTorch 제거)
- JSON Vector Store (ChromaDB 대체, 307배 빠름)
- 메모리: 1.8GB → 200MB (89% ↓)
- 빌드 시간: 10분 → 2분 (80% ↓)

### 배포 단계

1. **Supabase 설정**: [SUPABASE_SETUP.md](public/docs/deployment/SUPABASE_SETUP.md)
2. **Render 배포**: GitHub 연동 자동 배포 (Free Plan)
3. **Vercel 배포**: `vercel.json` + Custom Domain 설정
4. **UptimeRobot 설정**: 5분 간격 Health Check (Sleep 방지)
5. **전체 가이드**: [DEPLOYMENT_CHECKLIST.md](public/docs/deployment/DEPLOYMENT_CHECKLIST.md)

---

## 📂 프로젝트 구조

```
esg-gen-v1/
├── backend/
│   ├── src/
│   │   ├── ai_assist/              # AI Assist Layer
│   │   │   ├── esg_mapping/        # ESG 매핑 엔진
│   │   │   │   ├── data/           # GRI/SASB JSONL 데이터
│   │   │   │   ├── vectorstore/    # JSON Vector Store
│   │   │   │   └── json_vector_service.py
│   │   │   ├── core/               # Embeddings, Gemini Client
│   │   │   └── router.py           # /api/v1/ai-assist
│   │   ├── articles/               # 뉴스 크롤링
│   │   │   ├── service.py          # 3단계 필터링 로직
│   │   │   └── router.py           # /api/v1/articles
│   │   ├── crawler/                # 네이버 뉴스 크롤러
│   │   ├── documents/              # 문서 관리
│   │   └── main.py
│   ├── scripts/
│   │   ├── generate_vector_json.py # Vector Store 생성
│   │   ├── db/                     # DB 초기화 스크립트
│   │   └── crawler/                # 크롤러 테스트
│   └── requirements/
│       ├── base.txt                # FastAPI, DB, 공통
│       ├── ai.txt                  # 로컬 개발 (torch 포함)
│       └── deploy.txt              # Railway 배포 (Gemini API)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── map/            # 🗺️ Interactive Map (Phase 5)
│   │   │   │   │   ├── WorldMapContainer.tsx
│   │   │   │   │   ├── controls/   # TopFilterBar, SearchInput
│   │   │   │   │   ├── layers/     # MapPathsLayer, RegionGlowLayer
│   │   │   │   │   ├── markers/    # RegionMarker, CountryMarker
│   │   │   │   │   ├── panels/     # CompanyDetailPanel
│   │   │   │   │   └── tooltip/    # MapTooltip
│   │   │   │   └── report-editor/  # 블록 에디터
│   │   │   └── ai-assist/          # AI 패널
│   │   ├── store/
│   │   │   ├── esgMapStore.ts      # Map 전역 상태 (Zustand)
│   │   │   ├── editorStore.ts
│   │   │   └── aiAssistStore.ts
│   │   ├── types/
│   │   │   └── esg-map.ts          # Map 타입 정의
│   │   ├── constants/
│   │   │   └── esg-map.ts          # 좌표, 색상, REGION_BBOX
│   │   └── hooks/
│   │       └── useWindowSize.ts    # 반응형 뷰포트
│   └── public/
│       ├── data/
│       │   ├── esg_companies_global.json  # 106개 기업 데이터
│       │   └── esg_vectors.json    # AI Vector Store (181 docs)
│       └── world.svg               # 세계 지도 SVG
├── public/docs/                    # 프로젝트 문서
│   ├── ai/                         # AI Assist 문서
│   ├── frontend/                   # Map 아키텍처 문서
│   ├── deployment/                 # 배포 가이드
│   └── PROJECT_OVERVIEW.md         # 전체 개요
└── README.md
```

---

## 🎓 개발 스토리 (Agile 방식)

### Sprint 1-4: 기본 인프라 + 뉴스 모니터링 (완료 ✅)
- Docker 환경 구축
- PostgreSQL 모델링 (10개 테이블)
- 네이버 뉴스 크롤러 구현
- 3단계 데이터 품질 필터링 (노이즈율 0% 달성)
- 18개 한국 ESG SaaS 기업 마스터 데이터 완성

### Phase 4: AI Assist Layer (완료 ✅)
- **ESG 매핑 엔진**: GRI 2021 표준 181개 문서
- **Vector Search**: JSON Vector Store (0.27ms, ChromaDB 대비 307배 빠름)
- **LLM 분석**: Gemini 2.5 Flash (정확도 100%)
- **Observability**: Prometheus 연동
- **Frontend 통합**: Zustand + Sparkles UI

### Phase 5: 글로벌 ESG SaaS 지도 (완료 ✅) ⭐ 최신
- **106개 글로벌 기업 데이터 큐레이션**
  - Europe 56개, North America 31개, South America 2개, Asia 6개, Middle East 5개, Oceania 6개
  - 200+ Features, 60+ Frameworks 수작업 태깅
  
- **인터랙티브 지도 구현**
  - SVG 기반 6개 지역 상세 뷰
  - Framer Motion 부드러운 애니메이션
  - Dynamic Fit-Bounds (모든 화면 크기 대응)
  
- **스마트 필터링 시스템**
  - 11단계 필터링 로직 (Zustand Store)
  - 실시간 검색 자동완성
  - Multi-Mode Panel (List View + Detail View)
  
- **UX 완성도**
  - Label on Hover (Visual Clutter 해결)
  - Smart Tooltip (화면 가장자리 대응)
  - Breadcrumbs 네비게이션

### 다음 계획 (Agile 진화 중)
프로젝트는 지속적으로 기능을 추가 및 개선하는 **Agile 방식**으로 진행됩니다.
- 감정 분석 (뉴스 긍정/부정 분석)
- 경쟁사 비교 대시보드
- 협업 기능 (Real-time Collaboration)
- Multi-tenancy (조직별 데이터 격리)

---

## 📊 성능 지표

### Frontend Performance (Interactive Map)

| 항목 | 측정값 | 목표 | 상태 |
|------|--------|------|------|
| **필터 적용** | <50ms | <100ms | ✅ |
| **뷰 전환 애니메이션** | 600ms | <800ms | ✅ |
| **초기 로딩** | <500ms | <1s | ✅ |
| **번들 사이즈 (gzip)** | 102KB | <200KB | ✅ |
| **First Contentful Paint** | <1s | <2s | ✅ |

### Backend Performance (AI Engine)

| 항목 | JSON Vector Store | ChromaDB | 개선율 |
|------|-------------------|----------|--------|
| **Vector Search** | **0.27ms** | 83ms | **307x** ⚡ |
| **Total Response** | ~17.4s | ~24s | 28% ↑ |
| **메모리** | **20MB** | 300MB | **15x** 절감 |
| **배포 비용** | **$0** | $7/월 | 무료 |

### Data Quality (News Crawler)

| 지표 | Sprint 3 | Sprint 4 | 개선율 |
|------|----------|----------|--------|
| **하나루프 정확도** | 5% | **100%** | **20배** ↑ |
| **그리너리 정확도** | 5% | **100%** | **20배** ↑ |
| **전체 노이즈율** | 95% | **0%** | **완전 제거** |

**결론**: 
- Map: 106개 기업 데이터를 <50ms에 필터링 (프론트엔드 전용)
- AI Engine: 181개 문서 수준에서는 JSON Vector Store가 압도적 우위
- News Crawler: 3단계 필터링으로 데이터 품질 100% 달성

---

## 🐛 트러블슈팅

### 1. Render Cold Start (핵심 해결됨 ✅)
**증상**: 첫 접속 시 API 타임아웃 (10초 초과)  
**원인**: Render Free Plan은 15분 무활동 시 Sleep (부팅 15~30초 소요)  
**해결**: 
- ✅ API Timeout 연장 (10초 → 20초)
- ✅ Frontend Warm-up 추가 (페이지 로드 시 서버 미리 깨우기)
- ✅ UptimeRobot 5분 간격 Health Check (백그라운드 유지)
- **결과**: 첫 요청 성공률 40% → **95%** (2.4배 개선)

### 2. Render Backend Connection
**증상**: Render 백엔드 연결 안 됨  
**해결**: 
- Render 환경 변수에 `DATABASE_URL` 설정
- Supabase Connection Pooler URL 사용 (Direct Connection X)
- CORS 설정: `CORS_ORIGINS=https://jinmini.com,https://www.jinmini.com`

### 3. Vercel Custom Domain
**증상**: `jinmini.com` 접속 안 됨  
**해결**:
- Vercel Project Settings → Domains → Add `jinmini.com`
- DNS 설정 (도메인 제공업체): CNAME → `cname.vercel-dns.com`
- Propagation 대기 (최대 48시간)

### 4. Interactive Map 렌더링 이슈
**증상**: 유럽 뷰에서 마커 겹침  
**해결**:
- `EUROPE_HUBS` 좌표 수동 재배치 (14개국)
- Label on Hover 구현 (기본 상태: 라벨 숨김)
- Z-Index 관리 (Hover된 마커 최상단 렌더링)

### 5. 브라우저 줌 시 스크롤바
**증상**: 110% 줌 시 가로 스크롤바 발생  
**해결**: Dynamic Fit-Bounds 구현 (`getDynamicViewBox()` 함수)

### 6. Vector Store 로드 실패
**증상**: `FileNotFoundError: esg_vectors.json`  
**해결**: `python scripts/generate_vector_json.py` 재실행

---

## 📚 문서

### 프로젝트 문서
- [프로젝트 전체 개요](public/docs/PROJECT_OVERVIEW.md) - 5분 만에 이해하는 프로젝트 소개
- [Phase 1 E2E 성공 리포트](public/docs/PHASE1_E2E_SUCCESS_REPORT.md)

### Map 아키텍처
- [Map PROGRESS](frontend/src/components/features/map/PROGRESS.md) - Phase 5 개발 과정
- [Map ARCHITECTURE](frontend/src/components/features/map/ARCHITECTURE.md) - 컴포넌트 설계
- [Map CONTEXT](frontend/src/components/features/map/CONTEXT_FOR_NEXT_CHAT.md) - 다음 개발 컨텍스트

### 배포 & API
- [배포 가이드](public/docs/deployment/DEPLOYMENT_GUIDE.md)
- [Supabase 설정](public/docs/deployment/SUPABASE_SETUP.md)
- [AI Assist PRD](public/docs/ai/AI_PRD.md)
- [API 문서 (Swagger)](https://jinmini.com/api/docs) - Live API 문서

---

## 🤝 기여

이 프로젝트는 **Agile 방식**으로 지속적으로 진화하고 있습니다.  
현재는 개인 프로젝트로 운영 중이며, 외부 기여는 받지 않습니다.

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

---

## 👤 제작자

**김진민 (Kim Jinmin)**  
- 🌐 Website: [jinmini.com](https://jinmini.com)
- 💼 Full-Stack Engineer specializing in AI/ML Integration
- 🎯 Core Skills: Python, FastAPI, TypeScript, Next.js, LLM Engineering, Interactive Data Visualization
- 📧 Contact: [작성 예정]

---

## 🎉 Acknowledgments

- **ESG Standards**: GRI, SASB, TCFD
- **AI Models**: Google Gemini 2.5 Flash, Hugging Face Embeddings
- **UI/UX Inspiration**: Notion, Linear, Observable
- **Geospatial Visualization**: D3.js, Mapbox (참고)
- **Data Sources**: Company websites, ESG platform providers

---

**마지막 업데이트**: 2025-11-24  
**버전**: 1.1.0 (Phase 5 완료 - Interactive Map)  
**Status**: ✅ Production (jinmini.com)

---

## 🚀 Quick Links

- 🌐 **Live Demo**: [jinmini.com](https://jinmini.com)
- 📊 **Project Overview**: [PROJECT_OVERVIEW.md](public/docs/PROJECT_OVERVIEW.md)
- 🗺️ **Map Architecture**: [Map ARCHITECTURE](frontend/src/components/features/map/ARCHITECTURE.md)

