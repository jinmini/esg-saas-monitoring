# **PRD: ESG 액션 캘린더 기능 구현 (Sprint 6)**

## 프로젝트 개요
본 "ESG SaaS Monitoring Platform" 프로젝트는, 파편화된 ESG 관련 정보를 하나의 플랫폼에서 체계적으로 수집, 분석, 제공함으로써, 기업의 ESG 담당자들이 더 빠르고 정확한 의사결정을 내릴 수 있도록 돕는 것을 최종 목표로 한다.

## 1. Sprint 1-5 요약: 지능형 뉴스 수집 파이프라인 구축 (완료)
- 초기 목표: ESG SaaS 기업 관련 뉴스를 자동 수집하여 제공하는 MVP(Minimum Viable Product) 구축.
- 주요 성과:
동적 크롤링 시스템 구축: 하드코딩된 검색 전략에서 탈피, DB에 저장된 positive_keywords, negative_keywords 등을 활용하는 유연하고 확장 가능한 크롤링 아키텍처를 완성했다.

- '투-트랙(Two-Track)' 수집 전략 도입: '회사명+대표명'을 활용한 **정밀 타격(High Precision)**과 '회사명' 기반의 **광역 수색(High Recall)**을 결합하여, 핵심 기사를 놓치지 않으면서도 수집 범위를 극대화했다.

- 지능형 품질 관리(Quality Gate) 구현: 단순 키워드 매칭을 넘어, 기사의 '문맥(비즈니스/ESG)', '키워드 위치(제목/본문)', '출처 신뢰도(정밀/광역)'를 종합적으로 평가하는 정교한 관련도 점수 시스템을 도입했다. 이를 통해 "그리너리"와 "페어랩스" 케이스에서 발견된 노이즈 및 재현율 문제를 성공적으로 해결했다.

- Full-Stack 아키텍처 완성: FastAPI(백엔드), PostgreSQL(DB), Next.js(프론트엔드)로 이어지는 전체 데이터 파이프라인을 구축하고, react-query를 활용한 효율적인 데이터 페칭 및 상태 관리 체계를 확립했다.

### **1. 배경 및 문제 정의 (Background & Problem)**

-   **문제점:** ESG 관련 중요 일정(규제 변경, 지원사업 마감 등)은 뉴스, SNS, 공식 웹사이트 등 여러 곳에 흩어져 있다. 사용자는 이를 우연히 발견하여 개인 스케줄러에 수동으로 기록하고 파편적으로 공유하고 있어, 중요한 마감일을 놓칠 사업적 리스크가 매우 크다.
-   **해결 방안:** 날짜 기반의 중요 이벤트를 중앙화된 캘린더에 시스템적으로 등록하고 시각화하여, 모든 담당자가 동일한 정보를 바탕으로 사전에 행동 계획을 수립할 수 있도록 돕는다.

### **2. 사용자 스토리 (User Story)**

-   **As a** ESG SaaS 전략 기획 담당자,
-   **I want to** 마감일이 정해진 중대한 규제 변경 공지나 지원사업 일정을 업무용 캘린더에서 시각적으로 확인하고,
-   **So that** 팀원들과 함께 대응 전략을 미리 논의하고 제품 로드맵에 반영할 시간을 충분히 확보하여, 마감일을 놓쳐 발생하는 사업적 리스크를 원천적으로 차단할 수 있다.

---

### **3. 기능 요구사항 (Features)**

#### **3.1. 핵심 기능**
1.  **캘린더 뷰:** 월/주/일 단위로 ESG 관련 이벤트를 표시하는 캘린더 UI를 제공한다.
2.  **이벤트 목록 뷰:** 캘린더에서 특정 날짜를 선택하면, 해당 날짜에 속한 이벤트들의 상세 목록이 하단에 표시된다.
3.  **이벤트 카테고리:** 모든 이벤트는 '지원사업', '정책발표', '컨퍼런스', '공시마감' 등 사전 정의된 카테고리로 분류된다.
4.  **카테고리 필터링:** 사용자는 특정 카테고리의 이벤트만 캘린더에 표시되도록 필터링할 수 있다.

#### **3.2. 데이터 관리 (MVP 범위)**
-   이벤트 데이터의 생성(Create), 수정(Update), 삭제(Delete)는 **관리자(개발자)만 수행**한다.
-   관리자는 API 클라이언트나 별도의 스크립트를 통해 데이터를 관리한다. (사용자용 이벤트 등록 UI는 이번 스프린트 범위에서 제외)

---

### **4. 기술 명세: 백엔드 (Backend Specifications)**

#### **4.1. 데이터 모델 (Database Schema)**
-   **`events` 테이블 신규 생성 (`articles/models.py` 또는 `events/models.py`)**

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE, -- 종료일이 없는 경우 NULL 가능
    category VARCHAR(50) NOT NULL, -- '지원사업', '정책발표', '컨퍼런스', '공시마감' 등
    source_url VARCHAR(2048), -- 원문 링크
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_events_start_date ON events (start_date);
CREATE INDEX idx_events_category ON events (category);
```

#### **4.2. API 명세 (API Specification)**
-   **신규 라우터 생성: `events/router.py`**
-   **베이스 URL: `/api/v1/events`**

1.  **월별 이벤트 목록 조회**
    -   **엔드포인트:** `GET /`
    -   **설명:** 특정 연도와 월에 해당하는 모든 이벤트를 조회한다. 캘린더 렌더링의 핵심 API.
    -   **쿼리 파라미터:**
        -   `year: int` (필수)
        -   `month: int` (필수)
        -   `category: str` (선택) - 특정 카테고리 필터링 시 사용
    -   **성공 응답 (200 OK):**
        ```json
        [
            {
                "id": 1,
                "title": "ESRS 간소화 공개 의견 수렴 마감",
                "start_date": "2025-09-29",
                "end_date": "2025-09-29",
                "category": "공시마감",
                "source_url": "https://efrag.org/..."
            },
            ...
        ]
        ```

2.  **이벤트 생성 (관리자용)**
    -   **엔드포인트:** `POST /`
    -   **설명:** 새로운 이벤트를 생성한다. (향후 관리자 인증 필요)
    -   **Request Body:** 위 응답 객체와 유사한 JSON (ID 제외)

3.  **이벤트 수정 (관리자용)**
    -   **엔드포인트:** `PUT /{id}`
    -   **설명:** 기존 이벤트를 수정한다.

4.  **이벤트 삭제 (관리자용)**
    -   **엔드포인트:** `DELETE /{id}`
    -   **설명:** 이벤트를 삭제한다.

---

### **5. 기술 명세: 프론트엔드 (Frontend Specifications)**

#### **5.1. 페이지 및 컴포넌트 구조**
-   **신규 페이지:** `app/calendar/page.tsx`
-   **주요 컴포넌트:**
    -   `components/calendar/EventCalendar.tsx`: FullCalendar 라이브러리를 래핑하여 캘린더 뷰를 렌더링하는 메인 컴포넌트.
    -   `components/calendar/EventList.tsx`: 선택된 날짜의 이벤트 목록을 렌더링하는 컴포넌트.
    -   `components/calendar/EventCard.tsx`: 개별 이벤트를 표시하는 카드 컴포넌트.
    -   `components/calendar/CategoryFilter.tsx`: 카테고리 필터 UI 컴포넌트.

#### **5.2. 기술 스택 추가**
-   **캘린더 라이브러리:** `@fullcalendar/react`, `@fullcalendar/daygrid` 등 FullCalendar 관련 패키지.

#### **5.3. 사용자 흐름 (User Flow)**
1.  사용자가 사이드바에서 '캘린더' 메뉴를 클릭하여 캘린더 페이지로 이동한다.
2.  페이지 진입 시, 현재 월을 기준으로 `GET /api/v1/events` API가 호출되고, 응답받은 이벤트들이 캘린더 날짜 위에 렌더링된다.
3.  사용자가 캘린더의 이전/다음 버튼을 눌러 월을 변경하면, 해당 월의 데이터를 다시 API로 요청하여 캘린더를 업데이트한다.
4.  사용자가 이벤트가 있는 특정 날짜를 클릭하면, 페이지 하단의 '이벤트 목록' 영역에 해당 날짜의 이벤트 카드들만 필터링되어 표시된다.
5.  사용자가 상단의 카테고리 필터(예: '지원사업' 버튼)를 클릭하면, API 호출 시 `category` 쿼리 파라미터를 추가하여 해당 카테고리의 이벤트만 캘린더에 표시한다.

---

### **6. 스프린트 완료 기준 (Definition of Done)**

-   **백엔드:**
    -   [ ] `events` 테이블이 DB에 마이그레이션됨.
    -   [ ] 월별 이벤트 조회를 포함한 CRUD API가 구현되고, Swagger 문서로 확인 가능함.
    -   [ ] 최소 5개 이상의 테스트 이벤트 데이터가 DB에 입력됨.
-   **프론트엔드:**
    -   [ ] 캘린더 페이지에 월별 이벤트가 정상적으로 표시됨.
    -   [ ] 날짜 선택 시 하단에 해당 날짜의 이벤트 목록이 정상적으로 필터링됨.
    -   [ ] 카테고리 필터링 기능이 정상적으로 동작함.
    -   [ ] 모바일 환경에서도 캘린더가 깨지지 않고 표시됨.

이 PRD를 기반으로 Sprint 6를 진행하시면, 백엔드와 프론트엔드 간의 긴밀한 협업(비록 1인이지만)을 통해 목표 기능을 성공적으로 구현하실 수 있을 것입니다.