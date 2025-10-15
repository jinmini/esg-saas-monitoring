## 📋 **PRD 작성을 위한 필수 정보**

### **1. 현재 프로젝트 구조**

```
백엔드 (FastAPI):
- 디렉토리 구조가 어떻게 되어 있나요?
- 예: app/models/, app/services/, app/api/routes/ 등
- 현재 사용 중인 주요 라이브러리는? (SQLAlchemy, Pydantic 등)

프론트엔드 (Next.js):
- App Router인가요, Pages Router인가요?
- 현재 디렉토리 구조는?
- 상태 관리 라이브러리 사용 중인가요? (Zustand, Redux 등)
```

### **2. 데이터베이스**

```
- 현재 사용 중인 DB는? (PostgreSQL, MySQL 등)
- Supabase 사용 예정이시죠?
- 기존 테이블 스키마는 어떻게 되나요?
  (Company, Article 등의 필드 정보)
```

### **3. 배포 환경**

```
- 현재 로컬에만 있나요?
- Fly.io로 배포 예정이시죠?
- 환경 변수 관리 방식은? (.env 파일?)
```

### **4. 보고서 기능 범위 (중요!)**

```
Phase 1 MVP에 꼭 포함되어야 할 기능:
[ ] 텍스트 입력 → AI 윤문
[ ] 파일 업로드 (PDF/DOCX) → 윤문
[ ] Before/After 비교 UI
[ ] 섹션별 윤문 (환경/사회/거버넌스)
[ ] 품질 점수 표시
[ ] PDF 다운로드
[ ] 간단한 템플릿 기반 보고서 생성

어느 것까지 포함할까요?
```

### **5. 지식 베이스 (RAG)**

```
- 제가 GRI Standards, 환경부 가이드 등의 링크를 제공할까요?
- 아니면 직접 수집하시겠어요?
- 우수 보고서 샘플은 몇 개 정도 수집하시겠어요? (3-10개)
```

### **6. 기술 스택 확정**

```
확인 필요:
- 임베딩 모델: jhgan/ko-sroberta-multitask ✅
- 벡터 DB: FAISS (로컬) → Cloudflare R2 저장 ✅
- LLM: Gemini 1.5 Flash ✅
- 프롬프트 관리: 별도 파일로? (prompts.py)
- 에러 로깅: 어떻게 하시나요? (Python logging?)
```

## ❓ **질문 요약**

**필수 정보 (PRD 작성 전 꼭 필요):**
1. 현재 백엔드 디렉토리 구조는?
2. MVP 기능 범위는? (위 체크리스트 중 선택)
3. 하루 작업 가능 시간 및 목표 완료일은?

**선택 정보 (있으면 더 좋음):**
4. 데이터베이스 기존 스키마는?
5. 프론트엔드는 App Router? Pages Router?
6. API 명세서 등 부가 문서도 포함할까요?

**최소 정보로 시작 가능:**
- 위 3가지 필수 정보만 주시면 PRD 작성 시작할게요!
- 나머지는 제가 best practice로 가정하고 작성하겠습니다.

어떻게 진행하시겠어요? 위 정보를 주시거나, "일단 표준 구조로 작성해줘"라고 하시면 바로 시작하겠습니다! 🚀

첨부하신 문서를 읽었습니다. 프로젝트 구조를 분석해서 질문에 답변드리겠습니다.

[10 tools called]

프로젝트를 분석했습니다. 질문에 대한 답변을 드리겠습니다.

---

## 📋 **RAG 기반 보고서 윤문 기능 - 질문 답변**

### **1. 현재 프로젝트 구조**

#### **백엔드 (FastAPI):**
```
backend/src/
├── main.py                    # FastAPI 앱 진입점
├── core/                      # 핵심 설정 (DB, 보안, 미들웨어)
├── articles/                  # 기사 관련 도메인
├── companies/                 # 회사 정보 도메인
├── crawler/                   # 크롤링 시스템
├── events/                    # 캘린더 이벤트
├── auth/                      # 인증/인가
├── external/                  # 외부 API (OAuth)
└── shared/                    # 공통 유틸리티
```

**각 도메인 구조 (Feature-based 패턴):**
```
domain/
├── models.py        # SQLAlchemy 모델
├── schemas.py       # Pydantic 스키마
├── service.py       # 비즈니스 로직
├── router.py        # API 엔드포인트
├── dependencies.py  # DI 의존성
├── exceptions.py    # 커스텀 예외
├── utils.py         # 도메인 유틸리티
└── config.py        # 도메인 설정
```

**주요 라이브러리:**
- SQLAlchemy 2.0 (비동기)
- Pydantic 2.5
- Alembic (마이그레이션)
- Asyncpg (PostgreSQL)
- Loguru (로깅)

#### **프론트엔드 (Next.js):**
```
frontend/src/
├── app/                       # App Router ✅
│   ├── layout.tsx
│   ├── page.tsx              # 메인 대시보드
│   ├── globals.css
│   └── esg-analysis/
├── components/
│   ├── calendar/             # 캘린더 컴포넌트
│   ├── feed/                 # 뉴스 피드
│   ├── filters/              # 필터링
│   ├── layout/               # 레이아웃
│   ├── ui/                   # 공통 UI
│   └── widgets/              # 위젯
├── hooks/                    # 커스텀 훅
├── lib/                      # API 클라이언트, 유틸
└── types/                    # TypeScript 타입
```

**상태 관리:**
- React Query (@tanstack/react-query) ✅
- 서버 상태 관리에 집중

---

### **2. 데이터베이스**

**현재 사용 중:** PostgreSQL 15 (Docker)

**기존 테이블 스키마:**

```sql
-- 사용자
users (
    id, email, user_name, auth_provider, 
    created_at
)

-- 회사 정보
companies (
    id, company_name, domain_url, 
    search_keywords,              -- 크롤링용 키워드 (JSONB)
    positive_keywords,            -- 필터링용 긍정 키워드
    negative_keywords,            -- 필터링용 부정 키워드
    created_at
)

-- 기사
articles (
    id, company_id, title, content, 
    source_name, article_url, 
    published_at, crawled_at,
    relevance_score               -- 품질 점수
)

-- 이벤트 (Sprint 6에서 추가)
events (
    id, title, description, 
    start_date, end_date, category, 
    source_url, created_at
)

-- 트렌드 (일별 집계)
mention_trends_daily (
    id, company_id, trend_date, 
    mention_count, created_at
)
```

**Supabase 사용 예정:** ❓ (현재는 로컬 PostgreSQL)

---

### **3. 배포 환경**

**현재 상태:**
- 로컬 개발 환경 (Docker Compose)
- PostgreSQL 컨테이너로 관리

**배포 계획:**
- 백엔드: Fly.io 예정 (PRD에서 Railway/AWS 언급)
- 프론트엔드: Vercel (vercel.json 존재)
- DB: 로컬 → Supabase 전환 가능

**환경 변수 관리:**
- `.env.dev` 파일 사용 (Pydantic Settings)
- 주요 변수: DATABASE_URL, REDIS_URL, NAVER_API_KEY 등

