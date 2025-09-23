# Backend API 연동 가이드

## 🚀 개요

ESG SaaS 모니터링 플랫폼의 백엔드 API 연동을 위한 가이드입니다.

**Base URL**: `http://localhost:8000/api/v1`

---

## 📊 주요 API 엔드포인트

### 1. 기사 관련 API (`/articles`)

#### 1.1 기사 목록 조회
```http
GET /api/v1/articles/
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 20, 최대: 100)
- `company_id`: 회사 ID 필터 (선택)
- `sort`: 정렬 기준 (`published_at`, `crawled_at`, `title`)
- `order`: 정렬 순서 (`asc`, `desc`)
- `search`: 제목 검색어 (선택)
- `date_from`: 시작 날짜 ISO 8601 (선택)
- `date_to`: 종료 날짜 ISO 8601 (선택)

**응답 예시:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "엔츠, AI 기반 탄소관리 솔루션 출시",
      "content": "...",
      "article_url": "https://...",
      "company_id": 6,
      "company_name": "엔츠",
      "published_at": "2025-09-17T08:00:00Z",
      "crawled_at": "2025-09-17T09:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "size": 20,
  "total_pages": 8
}
```

#### 1.2 통합 뉴스 피드 (⭐ Sprint 5 업데이트)
```http
GET /api/v1/articles/feed
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 20)
- `date_from`: 시작 날짜 ISO 8601 (선택) **[NEW]**
- `date_to`: 종료 날짜 ISO 8601 (선택) **[NEW]**

**사용 예시:**
```http
# 최근 30일 뉴스 피드
GET /api/v1/articles/feed?date_from=2025-08-23T00:00:00Z&date_to=2025-09-22T23:59:59Z

# 기본 피드 (날짜 필터 없음)
GET /api/v1/articles/feed?page=1&size=20
```

#### 1.3 회사별 기사 조회 (⭐ 개선됨 - 스마트 필터링 + Sprint 5 업데이트)
```http
GET /api/v1/articles/company/{company_id}
```

**🎯 스마트 필터링 기능**:
- 기사 제목과 본문에 **회사명이 실제로 포함된 기사만** 반환
- DB에 저장된 `positive_keywords`도 함께 활용하여 관련성 판단
- 동음이의어나 무관한 기사는 자동으로 제외

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 20)
- `date_from`: 시작 날짜 ISO 8601 (선택) **[NEW]**
- `date_to`: 종료 날짜 ISO 8601 (선택) **[NEW]**

**사용 예시:**
```http
# 하나루프의 최근 6개월 기사
GET /api/v1/articles/company/19?date_from=2025-03-22T00:00:00Z&date_to=2025-09-22T23:59:59Z

# 하나루프의 모든 기사 (스마트 필터링 적용)
GET /api/v1/articles/company/19?page=1&size=10
```

**필터링 효과 예시:**
- **하나루프**: 102개 → 3개 (97% 노이즈 제거)
- **chemtopia**: 13개 → 13개 (완벽한 관련성)

**응답 예시:**
```json
{
  "articles": [
    {
      "id": 1378,
      "title": "하나루프, 디지털 탄소경영 플랫폼 '하나에코' 공개",
      "source_name": "kidd.co.kr",
      "article_url": "https://kidd.co.kr/news/243058",
      "published_at": "2025-09-02T02:06:00Z",
      "crawled_at": "2025-09-18T05:41:36.903082Z",
      "summary": "하나루프(HANALOOP)가 기업용 클라우드 기반 탄소경영 플랫폼 '하나에코(Hana.eco)'를 공개했다...",
      "language": "ko",
      "is_verified": false,
      "company_id": 19,
      "company_name": "하나루프",
      "company_name_en": "Hanaloop"
    }
  ],
  "total": 3,
  "page": 1,
  "size": 20,
  "has_next": false,
  "has_prev": false
}
```

#### 1.4 기사 검색
```http
GET /api/v1/articles/search
```

**쿼리 파라미터:**
- `query`: 검색어 (필수)
- `page`, `size`: 페이지네이션

#### 1.5 특정 기사 상세 조회
```http
GET /api/v1/articles/{article_id}
```

### 2. 트렌드 분석 API

#### 2.1 회사별 언급량 트렌드 (⭐ 핵심 기능 + Sprint 5 업데이트)
```http
GET /api/v1/articles/trends
```

**쿼리 파라미터:**
- `period_days`: 분석 기간 (기본값: 30일, **최대: 365일**) **[UPDATED]**

**사용 예시:**
```http
# 최근 30일 트렌드 (기본)
GET /api/v1/articles/trends?period_days=30

# 최근 6개월 트렌드
GET /api/v1/articles/trends?period_days=180

# 최근 12개월 트렌드 (NEW!)
GET /api/v1/articles/trends?period_days=365
```

**응답 예시:**
```json
{
  "trends": [
    {
      "rank": 1,
      "company_id": 10,
      "company_name": "리빗",
      "company_name_en": "Rebit",
      "current_mentions": 15,
      "previous_mentions": 8,
      "change_rate": 87.5,
      "change_type": "up",
      "primary_categories": ["Carbon Accounting", "AI Analytics"],
      "service_categories": ["A1", "A2", "B1", "C1"],
      "company_type": "All-in-One",
      "latest_article_title": "리빗, 탄소회계 솔루션 업데이트",
      "latest_article_url": "https://...",
      "latest_published_at": "2025-09-17T10:00:00Z"
    }
  ],
  "period_days": 30,
  "analysis_date": "2025-09-17T12:00:00Z",
  "total_companies": 18
}
```

#### 2.2 회사별 상세 통계 (⭐ Sprint 5 업데이트)
```http
GET /api/v1/articles/company/{company_id}/stats
```

**쿼리 파라미터:**
- `period_days`: 분석 기간 (기본값: 30일, **최대: 365일**) **[UPDATED]**

**사용 예시:**
```http
# 하나루프의 최근 30일 통계
GET /api/v1/articles/company/19/stats?period_days=30

# 하나루프의 최근 12개월 통계
GET /api/v1/articles/company/19/stats?period_days=365
```

**응답 예시:**
```json
{
  "company_id": 10,
  "company_name": "리빗",
  "current_mentions": 15,
  "previous_mentions": 8,
  "change_rate": 87.5,
  "change_type": "up",
  "daily_mentions": [
    {"date": "2025-09-17", "count": 3},
    {"date": "2025-09-16", "count": 2}
  ],
  "period_days": 30,
  "analysis_date": "2025-09-17T12:00:00Z"
}
```

#### 2.3 카테고리별 트렌드 (⭐ 핵심 기능)
```http
GET /api/v1/articles/trends/categories
```

**응답 예시:**
```json
{
  "trends": [
    {
      "rank": 1,
      "category_code": "A1",
      "category_name": "데이터 수집 및 통합",
      "category_name_en": "Data Collection and Integration",
      "main_topic": "Data Management",
      "current_mentions": 45,
      "previous_mentions": 32,
      "change_rate": 40.6,
      "change_type": "up",
      "companies_count": 8,
      "top_companies": ["엔츠", "리빗", "하나루프"]
    }
  ],
  "period_days": 30,
  "analysis_date": "2025-09-17T12:00:00Z",
  "total_categories": 25
}
```

### 3. 회사 관리 API

#### 3.1 활성화된 회사 목록
```http
GET /api/v1/articles/companies/list
```

**응답 예시:**
```json
{
  "companies": [
    {
      "id": 6,
      "company_name": "엔츠",
      "company_name_en": "AENTS",
      "website_url": "https://aents.co",
      "description": "AI 기반 제로에너지 빌딩 관리",
      "is_active": true
    }
  ],
  "count": 18
}
```

### 4. 크롤링 관리 API

#### 4.1 스케줄러 상태 확인
```http
GET /api/v1/crawler/scheduler/status
```

#### 4.2 수동 크롤링 실행
```http
POST /api/v1/crawler/scheduler/crawl/manual/all
```

```http
POST /api/v1/crawler/scheduler/crawl/manual/company/{company_id}
```

---

## 🎨 프론트엔드 구현 권장사항

### 1. 메인 대시보드 페이지
```typescript
// 회사별 트렌드 데이터 가져오기
const fetchCompanyTrends = async () => {
  const response = await fetch('/api/v1/articles/trends?period_days=30');
  const data = await response.json();
  return data.trends;
};

// 카테고리별 트렌드 데이터 가져오기
const fetchCategoryTrends = async () => {
  const response = await fetch('/api/v1/articles/trends/categories?period_days=30');
  const data = await response.json();
  return data.trends;
};
```

### 2. 뉴스 피드 페이지
```typescript
// 페이지네이션이 있는 기사 목록
const fetchArticles = async (page: number = 1, companyId?: number) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: '20',
    sort: 'published_at',
    order: 'desc'
  });
  
  if (companyId) {
    params.append('company_id', companyId.toString());
  }
  
  const response = await fetch(`/api/v1/articles/?${params}`);
  return await response.json();
};
```

### 3. 회사 상세 페이지 (⭐ 개선됨)
```typescript
// 특정 회사의 통계 및 기사 (스마트 필터링 적용)
const fetchCompanyDetails = async (companyId: number) => {
  const [stats, articles] = await Promise.all([
    fetch(`/api/v1/articles/company/${companyId}/stats`).then(r => r.json()),
    fetch(`/api/v1/articles/company/${companyId}?page=1&size=10`).then(r => r.json())
  ]);
  
  return { stats, articles };
};

// 📊 필터링 효과 안내 UI 예시
const CompanyArticles = ({ companyId, companyName }) => {
  const [articles, setArticles] = useState([]);
  const [isFiltered, setIsFiltered] = useState(true);
  
  return (
    <div>
      {isFiltered && (
        <div className="bg-blue-50 p-3 rounded mb-4">
          <p className="text-sm text-blue-700">
            🎯 <strong>스마트 필터링 적용됨</strong>: {companyName}과 실제 관련된 기사만 표시됩니다.
          </p>
        </div>
      )}
      {/* 기사 목록 렌더링 */}
    </div>
  );
};
```

---

## 🔧 개발 환경 설정

### CORS 설정
백엔드에서 CORS가 설정되어 있어 프론트엔드에서 직접 호출 가능합니다.

### 환경 변수
```env
# .env.local (Next.js)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### API 클라이언트 설정 (권장)
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
  
  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
};
```

---

## 📈 핵심 화면 구성 제안

### 1. 대시보드 (/)
- **회사별 트렌드 차트**: `GET /articles/trends` 데이터 활용
- **카테고리별 트렌드**: `GET /articles/trends/categories` 데이터 활용
- **최신 뉴스 피드**: `GET /articles/feed` 데이터 활용

### 2. 뉴스 피드 (/news)
- **전체 기사 목록**: `GET /articles/` 
- **회사별 필터링**: `company_id` 파라미터 활용
- **검색 기능**: `GET /articles/search`

### 3. 회사 상세 (/company/[id])
- **회사 통계**: `GET /articles/company/{id}/stats`
- **회사 기사**: `GET /articles/company/{id}`
- **서비스 카테고리 표시**: 트렌드 API의 `service_categories` 활용

### 4. 분석 대시보드 (/analytics)
- **심화 트렌드 분석**: 모든 트렌드 API 통합 활용
- **기간별 비교**: `period_days` 파라미터 조정

---

## ⚠️ 주의사항

1. **페이지네이션**: 모든 목록 API는 페이지네이션을 지원합니다.
2. **에러 처리**: HTTP 상태 코드와 `detail` 필드를 확인하세요.
3. **날짜 형식**: ISO 8601 형식을 사용합니다.
4. **실시간 업데이트**: 트렌드 데이터는 일 1회 업데이트됩니다.

## 🎯 데이터 품질 개선 (NEW)

### 스마트 필터링 시스템
- **회사별 기사 조회 API**는 이제 **관련성 기반 필터링**을 자동 적용합니다
- 기사 제목과 본문에 회사명 또는 관련 키워드가 포함된 기사만 반환
- 동음이의어나 무관한 기사는 자동으로 제외되어 **고품질 데이터** 제공

### 필터링 성능
| 회사명 | 필터링 전 | 필터링 후 | 노이즈 제거율 |
|--------|-----------|-----------|---------------|
| 하나루프 | 102개 | 3개 | 97% |
| chemtopia | 13개 | 13개 | 0% (완벽) |
| 그리너리 | 100개 | ~20개 | 80% |

### 개발자 참고사항
- 이전 대비 **더 적은 수의 기사**가 반환될 수 있습니다 (품질 향상)
- `total` 카운트도 필터링 후 기준으로 제공됩니다
- 필터링 로직은 DB의 `positive_keywords`와 `negative_keywords`를 활용합니다

---

## 🛰️ Two-Track 크롤링 (NEW)

정확도와 재현율을 동시에 확보하기 위해 크롤러가 두 트랙으로 수집합니다.

- **정밀 트랙(Precision)**: `"회사명" "대표명"` 또는 `"회사명" "탑키워드"` 조합으로 고정밀 수집
- **광역 트랙(Broad)**: `"회사명"` 단독으로 보강 수집

### 동작 원리
- 정밀 트랙에서 최소 `30건` 확보 시 광역 트랙 생략
- 미달 시 광역 트랙 최대 `2페이지`(페이지당 10건) 보강
- 결과 병합 후 **URL 정규화(utm 제거 등)** 로 중복 제거
- 저장 전 3단계 필터(제목 즉시 필터 → 네거티브 필터 → 품질게이트) 적용
- 정밀 트랙 기사는 관련도 점수에 **+0.15 가산**

### 운영 파라미터(기본값)
- `PRECISION_MIN_RESULTS = 30`
- `BROAD_MAX_PAGES = 2`
- `PRECISION_SCORE_BOOST = 0.15`
- `DEFAULT_SEARCH_STRATEGY = "two_track"` (회사별로 `search_strategy`로 오버라이드 가능)

### 수동 실행 예시
```http
POST /api/v1/crawler/crawl/company/{company_id}?max_articles=100
```

응답에는 저장 개수와 실행 시간 등이 포함되며, 내부적으로는 정밀/광역 트랙 결과가 병합되어 저장됩니다.

### 주의사항
- 네이버 API 제약으로 OR 연산은 사용하지 않고 공백 결합(AND 의미)만 사용합니다.
- 대표명/키워드가 없는 회사는 자동으로 회사명 단독 전략으로 동작합니다.

## 🆕 Sprint 5 업데이트 내용 (2025.09.22)

### **기간 필터링 기능 추가**
- **Feed API**: `date_from`, `date_to` 파라미터로 날짜 범위 필터링 지원
- **회사별 API**: `date_from`, `date_to` 파라미터로 날짜 범위 필터링 지원
- **Trends API**: `period_days` 최대값을 90일 → **365일**로 확장

### **프론트엔드 연동 개선**
- 기간 선택 (1개월/3개월/6개월/12개월)이 자동으로 API 파라미터로 변환
- 모든 위젯이 기간 변경 시 동시 업데이트
- React Query 캐싱으로 성능 최적화

### **실제 테스트 결과**
- ✅ 30일/180일/365일 모든 기간에서 정상 작동 확인
- ✅ API 응답 시간 < 1초 달성
- ✅ 하나루프 데이터: 365일(102건) vs 30일(101건) 정확한 차이 반환

---

## 🚀 시작하기

1. 백엔드 서버가 실행 중인지 확인: `http://localhost:8000/health`
2. 회사 목록 확인: `GET /api/v1/articles/companies/list`
3. 트렌드 데이터 확인: `GET /api/v1/articles/trends`
4. **NEW**: 기간 필터링 테스트: `GET /api/v1/articles/feed?date_from=2025-08-01T00:00:00Z&date_to=2025-09-22T23:59:59Z`
