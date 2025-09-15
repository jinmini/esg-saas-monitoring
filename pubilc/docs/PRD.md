# PRD: ESG SaaS Monitoring Platform - Sprint 1

**문서 버전:** 1.0
**작성일:** 2025-09-15
**작성자:** Gemini (PO/PM)
**Sprint 목표:** 사용자가 소셜 로그인을 통해 서비스에 접속하여, 시스템이 미리 수집한 경쟁사들의 최신 뉴스 기사를 통합 피드에서 확인할 수 있는 핵심 경험을 제공한다.

---

## 1. 배경 및 문제 정의 (Background & Problem)

- **제품 비전:** 국내외 ESG SaaS 기업들의 동향을 체계적으로 추적/분석하여, ESG SaaS 기업의 기획/전략 담당자가 경쟁사를 벤치마킹하고 시장의 흐름을 파악하여 더 나은 의사결정을 내릴 수 있도록 돕는 경쟁사 인텔리전스 플랫폼.
- **타겟 페르소나:** ESG SaaS 스타트업의 신입 기획/전략 담당자.
- **해결할 문제:** 경쟁사 동향(신기능, 뉴스, 정부과제 등)을 파악하기 위해 여러 사이트를 방문하며 수작업으로 정보를 수집해야 하는 비효율을 해결한다.

## 2. Sprint 1 목표 및 범위 (Goal & Scope)

### 2.1. Sprint 1 목표
사용자가 서비스를 처음 접했을 때 즉각적인 가치를 느낄 수 있도록, **'로그인 후 통합 뉴스 피드 조회'** 라는 단일 핵심 경로를 완벽하게 구현한다.

### 2.2. 범위 (Scope)

#### In Scope (이번 스프린트에 포함되는 기능)
1.  **사용자 인증:** 구글/카카오 소셜 로그인을 통한 회원가입 및 로그인.
2.  **데이터 수집 (Backend):** 지정된 ESG SaaS 기업 목록에 대한 뉴스 기사를 주기적으로 크롤링하여 DB에 저장하는 백엔드 시스템.
3.  **통합 피드 조회 (Backend API):** DB에 저장된 뉴스 기사 목록을 최신순으로 제공하는 API 엔드포인트.
4.  **통합 피드 UI (Frontend):** API를 통해 받아온 뉴스 기사 목록을 화면에 렌더링하는 기본 UI.

#### Out of Scope (이번 스프린트에 포함되지 않는 기능)
-   사용자가 직접 모니터링할 경쟁사를 추가/삭제하는 기능
-   '핫 트렌드' 순위 대시보드
-   기사 스크랩, 메모, 공유 기능
-   카테고리별 필터링 및 키워드 검색 기능
-   ESG 산업 뉴스 뷰
-   이메일 알림 기능

---

## 3. 기능 요구사항 및 인수 조건 (Features & Acceptance Criteria)

### Epic 1: 사용자 계정 관리
- **User Story:** "나는 서비스를 이용하기 위해, 구글이나 카카오 계정을 이용해 간편하게 회원가입하고 로그인하고 싶다. 이를 통해 번거로운 절차 없이 빠르게 서비스를 시작할 수 있기 때문이다."
- **인수 조건 (Acceptance Criteria):**
    1.  **Given** 사용자가 로그인 페이지에 접속했을 때,
    2.  **When** '구글로 로그인' 또는 '카카오로 로그인' 버튼을 클릭하면,
    3.  **Then** 각 서비스의 OAuth 인증 화면으로 이동해야 한다.
    4.  **And** 인증에 성공하면, 사용자는 메인 대시보드(통합 피드)로 리디렉션되어야 한다.
    5.  **And** 백엔드에서는 `users` 테이블에 신규 사용자 정보가 저장되거나 기존 사용자 정보가 업데이트되어야 한다.
    6.  **And** 인증에 실패하면, 사용자에게 에러 메시지를 보여주어야 한다.

### Epic 2: 경쟁사 동향 모니터링
- **User Story:** "나는 ESG SaaS 기획 담당자로서, 대시보드에서 여러 경쟁사의 최신 뉴스를 시간 순으로 모아보는 통합 피드를 원한다. 이를 통해 여러 웹사이트를 방문하지 않고도 시장의 흐름을 빠르게 파악할 수 있기 때문이다."
- **인수 조건 (Acceptance Criteria):**
    1.  **Given** 사용자가 로그인을 하고 메인 대시보드에 접속했을 때,
    2.  **When** 통합 피드 영역을 보면,
    3.  **Then** 데이터베이스에 저장된 뉴스 기사 목록이 표시되어야 한다.
    4.  **And** 각 기사 카드는 최소한 `기사 제목`, `언론사`, `발행일`, `어떤 경쟁사`에 대한 기사인지 표시되어야 한다.
    5.  **And** 기사 목록은 `발행일`을 기준으로 최신순으로 정렬되어야 한다.
    6.  **And** 사용자가 페이지 하단으로 스크롤하면 다음 페이지의 기사들이 이어서 로드되어야 한다 (무한 스크롤).

---

## 4. 기술 명세 (Technical Specifications)

- **프론트엔드 (Frontend):** React + Next.js
- **백엔드 (Backend):** Python FastAPI
- **데이터베이스 (Database):** PostgreSQL
- **데이터 수집 (Crawling):** Python (BeautifulSoup / Selenium)
- **배포 (Deployment):** Vercel (Frontend), Railway/AWS (Backend, DB)

---

## 5. 데이터 모델 (Data Schema)

PostgreSQL 데이터베이스의 초기 테이블 구조는 다음과 같이 제안한다.

```sql
-- 사용자 정보 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(100),
    auth_provider VARCHAR(50) NOT NULL, -- 'google', 'kakao'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 모니터링할 회사 정보 테이블
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) UNIQUE NOT NULL,
    -- 기타 회사 정보 (홈페이지 URL 등)
    domain_url VARCHAR(255)
);

-- 수집된 기사 정보 테이블
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id), -- 어떤 회사에 대한 기사인지 FK
    title TEXT NOT NULL,
    source_name VARCHAR(100), -- 언론사
    article_url TEXT UNIQUE NOT NULL, -- 기사 원문 링크 (중복 수집 방지)
    published_at TIMESTAMP WITH TIME ZONE, -- 기사 발행일
    crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 수집된 시간
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX idx_articles_company_id ON articles (company_id);