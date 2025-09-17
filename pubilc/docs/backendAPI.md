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

#### 1.2 통합 뉴스 피드
```http
GET /api/v1/articles/feed
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `size`: 페이지 크기 (기본값: 20)

#### 1.3 회사별 기사 조회
```http
GET /api/v1/articles/company/{company_id}
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

#### 2.1 회사별 언급량 트렌드 (⭐ 핵심 기능)
```http
GET /api/v1/articles/trends
```

**쿼리 파라미터:**
- `period_days`: 분석 기간 (기본값: 30일)

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

#### 2.2 회사별 상세 통계
```http
GET /api/v1/articles/company/{company_id}/stats
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

### 3. 회사 상세 페이지
```typescript
// 특정 회사의 통계 및 기사
const fetchCompanyDetails = async (companyId: number) => {
  const [stats, articles] = await Promise.all([
    fetch(`/api/v1/articles/company/${companyId}/stats`).then(r => r.json()),
    fetch(`/api/v1/articles/company/${companyId}?page=1&size=10`).then(r => r.json())
  ]);
  
  return { stats, articles };
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

---

## 🚀 시작하기

1. 백엔드 서버가 실행 중인지 확인: `http://localhost:8000/health`
2. 회사 목록 확인: `GET /api/v1/articles/companies/list`
3. 트렌드 데이터 확인: `GET /api/v1/articles/trends`

