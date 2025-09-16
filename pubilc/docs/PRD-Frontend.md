# PRD: ESG SaaS Monitoring Platform - Frontend Sprint 2

## 📋 프로젝트 개요

### Sprint 목표
ESG SaaS 기업들의 뉴스를 실시간으로 확인할 수 있는 **공개 뉴스 피드 웹 애플리케이션** 구현

### 핵심 가치 제안
- 📱 **PWA 기반** 모바일/데스크톱 반응형 디자인
- 🔄 **실시간 뉴스 피드** 무한 스크롤 제공
- 🎯 **ESG SaaS 전문** 큐레이션된 뉴스 서비스
- ⚡ **빠른 로딩** 및 오프라인 지원

---

## 🎯 Sprint 2 범위 정의

### ✅ 포함 기능 (Must Have)
1. **공개 뉴스 피드** - 인증 없이 모든 사용자 접근 가능
2. **무한 스크롤** - 페이징 기반 추가 로딩
3. **반응형 디자인** - 모바일 우선 PWA 방식
4. **기본 필터링** - 회사별, 정렬 옵션
5. **검색 기능** - 키워드 기반 기사 검색
6. **기사 상세 보기** - 모달 또는 별도 페이지

### ❌ 제외 기능 (Sprint 3 이후)
- 사용자 인증 (OAuth)
- 개인화된 피드
- 북마크/즐겨찾기
- 알림 기능
- 관리자 대시보드

---

## 🛠 기술 스택

### Frontend Framework
- **Next.js 15** (App Router)
- **TypeScript** (타입 안정성)
- **React 19** (최신 기능 활용)

### Styling & UI
- **TailwindCSS** (유틸리티 퍼스트)
- **Headless UI** 또는 **Radix UI** (접근성)
- **Lucide React** (아이콘)
- **Framer Motion** (애니메이션, 선택사항)

### 상태 관리 & API
- **TanStack Query (React Query)** (서버 상태)
- **Zustand** (클라이언트 상태, 필요시)
- **Axios** (HTTP 클라이언트)

### 개발 도구
- **ESLint + Prettier** (코드 품질)
- **TypeScript** (타입 체크)

### 배포 & CI/CD
- **Vercel** (자동 배포)
- **GitHub Actions** (CI/CD, 선택사항)

---

## 📱 PWA 요구사항

### 모바일 우선 설계
- **최소 지원 해상도**: 360px (Galaxy S8 기준)
- **터치 친화적 UI**: 최소 44px 터치 타겟
- **빠른 로딩**: First Contentful Paint < 2초

### PWA 기능
- **Service Worker** (오프라인 캐싱)
- **Web App Manifest** (홈 스크린 추가)
- **Push Notifications** (향후 확장 고려)

### 반응형 브레이크포인트
```css
- Mobile: 0-640px (기본)
- Tablet: 641-1024px
- Desktop: 1025px+
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
```css
Primary: ESG Green (#10B981, #059669)
Secondary: Blue (#3B82F6, #2563EB)
Neutral: Gray (#6B7280, #374151, #111827)
Success: Green (#10B981)
Warning: Amber (#F59E0B)
Error: Red (#EF4444)
```

### 타이포그래피
- **Headline**: Inter Bold 24px-32px
- **Body**: Inter Regular 16px
- **Caption**: Inter Medium 14px
- **Small**: Inter Regular 12px

### 컴포넌트 스타일
- **카드 디자인**: 둥근 모서리 (8px), 그림자 활용
- **버튼**: Primary/Secondary/Ghost 스타일
- **입력 필드**: 아웃라인 스타일, 포커스 상태

---

## 📊 API 연동 명세

### Backend API Endpoints
```
Base URL: http://localhost:8000/api/v1

GET /articles/feed
- 통합 뉴스 피드 (최신순)
- Query: page, size

GET /articles/
- 기사 목록 (필터링, 검색 지원)
- Query: page, size, sort_by, sort_order, company_id, q

GET /articles/{id}
- 기사 상세 조회

GET /articles/companies/list
- 회사 목록 조회
```

### API 응답 스키마
```typescript
interface Article {
  id: number;
  company_id: number;
  company_name: string;
  company_name_en?: string;
  title: string;
  source_name?: string;
  article_url: string;
  published_at?: string;
  crawled_at: string;
  summary?: string;
  language: string;
  is_verified: boolean;
}

interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  companies_count: number;
  latest_crawl?: string;
}
```

---

## 🏗 컴포넌트 구조

### 페이지 구조
```
app/
├── layout.tsx (루트 레이아웃)
├── page.tsx (메인 피드 페이지)
├── search/
│   └── page.tsx (검색 결과 페이지)
└── article/
    └── [id]/
        └── page.tsx (기사 상세 페이지)
```

### 주요 컴포넌트
```
components/
├── layout/
│   ├── Header.tsx (네비게이션)
│   ├── Footer.tsx
│   └── MobileNav.tsx
├── feed/
│   ├── ArticleCard.tsx (기사 카드)
│   ├── ArticleList.tsx (기사 목록)
│   ├── InfiniteScroll.tsx (무한 스크롤)
│   └── FilterBar.tsx (필터/정렬)
├── search/
│   ├── SearchBar.tsx (검색 입력)
│   └── SearchResults.tsx (검색 결과)
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   └── LoadingSpinner.tsx
└── common/
    ├── ErrorBoundary.tsx
    └── SEOHead.tsx
```

---

## 📋 Phase별 개발 계획

### Phase 1: 프로젝트 설정 및 기본 구조 (1일)
- [ ] Next.js 15 프로젝트 초기화
- [ ] TailwindCSS, TypeScript 설정
- [ ] 기본 레이아웃 컴포넌트 구현
- [ ] API 클라이언트 설정 (Axios + React Query)

### Phase 2: 뉴스 피드 핵심 기능 (2일)
- [ ] ArticleCard 컴포넌트 구현
- [ ] ArticleList 무한 스크롤 구현
- [ ] 메인 피드 페이지 구현
- [ ] 로딩 상태 및 에러 처리

### Phase 3: 검색 및 필터링 (1일)
- [ ] SearchBar 컴포넌트 구현
- [ ] FilterBar (회사별, 정렬) 구현
- [ ] 검색 결과 페이지 구현

### Phase 4: 기사 상세 및 PWA (1일)
- [ ] 기사 상세 페이지 구현
- [ ] PWA 설정 (manifest, service worker)
- [ ] 모바일 최적화 및 반응형 테스트

### Phase 5: 성능 최적화 및 배포 (1일)
- [ ] 이미지 최적화, 코드 스플리팅
- [ ] Vercel 배포 설정
- [ ] 성능 테스트 및 최적화
- [ ] 접근성 검증

---

## 🎯 핵심 사용자 플로우

### 1. 메인 피드 사용자 플로우
```
1. 사용자가 웹사이트 접속
2. 최신 ESG 뉴스 피드 자동 로딩 (10개)
3. 스크롤하여 추가 기사 무한 로딩
4. 기사 카드 클릭 → 상세 페이지 이동
5. 외부 링크 클릭 → 원본 기사로 이동
```

### 2. 검색 사용자 플로우
```
1. 헤더 검색바에 키워드 입력
2. 실시간 검색 또는 엔터로 검색 실행
3. 검색 결과 페이지로 이동
4. 필터링/정렬 옵션 적용 가능
5. 검색 결과에서 기사 선택
```

### 3. 필터링 사용자 플로우
```
1. 메인 피드에서 필터 버튼 클릭
2. 회사별 필터 선택 (드롭다운)
3. 정렬 옵션 변경 (최신순/오래된순)
4. 필터 적용된 결과 즉시 반영
5. 필터 초기화 옵션 제공
```

---

## 📊 성능 요구사항

### 로딩 성능
- **First Contentful Paint**: < 2초
- **Largest Contentful Paint**: < 3초
- **Cumulative Layout Shift**: < 0.1

### 사용자 경험
- **무한 스크롤**: 부드러운 로딩 (스켈레톤 UI)
- **검색 응답**: < 500ms
- **페이지 전환**: < 300ms

### 접근성
- **WCAG 2.1 AA** 준수
- **키보드 네비게이션** 지원
- **스크린 리더** 호환

---

## 🚀 배포 전략

### Vercel 배포 설정
```javascript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### 환경 변수
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=ESG News Monitor
```

### CI/CD 파이프라인
1. **개발**: feature 브랜치 → Vercel Preview 배포
2. **스테이징**: main 브랜치 → Vercel Production 배포
3. **모니터링**: Vercel Analytics 활용

---

## 📈 성공 지표 (KPI)

### 기술적 지표
- [ ] **Lighthouse Score**: 90+ (Performance, Accessibility, SEO)
- [ ] **Core Web Vitals**: 모든 지표 Good 달성
- [ ] **번들 크기**: < 500KB (First Load JS)

### 사용자 경험 지표
- [ ] **페이지 로드 시간**: < 3초
- [ ] **무한 스크롤**: 끊김 없는 경험
- [ ] **모바일 반응성**: 모든 디바이스에서 정상 작동

### 비즈니스 지표
- [ ] **일일 활성 사용자**: 측정 기반 마련
- [ ] **기사 클릭률**: 측정 기반 마련
- [ ] **검색 사용률**: 측정 기반 마련

---

## 🔧 개발 환경 설정

### 필수 도구
- **Node.js**: 22+ (LTS)
- **npm**: 9.0+
- **Git**: 최신 버전

### 권장 IDE 확장
- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint

### 개발 스크립트
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 📚 참고 자료

### 디자인 참고
- **Tailwind UI**: https://tailwindui.com/
- **Headless UI**: https://headlessui.com/
- **PWA Best Practices**: https://web.dev/progressive-web-apps/

### 기술 문서
- **Next.js 14 Docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **Vercel Deployment**: https://vercel.com/docs

---

## ✅ Sprint 2 완료 기준

### 기능적 완성도
- [ ] 공개 뉴스 피드 정상 작동
- [ ] 무한 스크롤 구현 완료
- [ ] 검색 및 필터링 기능 정상 작동
- [ ] 모바일/데스크톱 반응형 완성

### 기술적 완성도
- [ ] PWA 기본 설정 완료
- [ ] Vercel 배포 성공
- [ ] 성능 요구사항 달성
- [ ] 코드 품질 기준 통과

### 문서화
- [ ] README 업데이트
- [ ] API 연동 가이드 작성
- [ ] 배포 가이드 작성

---

**🎯 Next Steps**: 이 PRD를 기반으로 Sprint 2 프론트엔드 개발을 시작하겠습니다!
