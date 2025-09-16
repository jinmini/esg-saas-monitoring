# ESG News Monitor - Frontend

ESG SaaS 기업들의 최신 뉴스를 실시간으로 모니터링하는 웹 애플리케이션의 프론트엔드입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.5.x
- **React**: 19.1.x
- **TypeScript**: 5.x
- **Styling**: TailwindCSS 4.x
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **UI Components**: Radix UI

## 📋 주요 기능

- ✅ **뉴스 피드**: ESG SaaS 기업 뉴스 실시간 표시
- ✅ **무한 스크롤**: 부드러운 추가 로딩
- ✅ **반응형 디자인**: 모바일/데스크톱 최적화
- ✅ **API 연동**: 백엔드와 실시간 데이터 동기화
- 🚧 **검색 기능**: 키워드 기반 뉴스 검색 (예정)
- 🚧 **필터링**: 회사별, 날짜별 필터 (예정)

## 🛠 개발 환경 설정

### 필수 요구사항
- Node.js 18.17+ (LTS)
- npm 9.0+
- 백엔드 서버 실행 중 (http://localhost:8000)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린팅
npm run lint

# 타입 체크
npm run type-check
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지
├── components/         # 재사용 가능한 컴포넌트
│   ├── feed/          # 뉴스 피드 관련 컴포넌트
│   ├── layout/        # 레이아웃 컴포넌트
│   └── ui/            # 기본 UI 컴포넌트
├── hooks/             # 커스텀 React 훅
├── lib/               # 유틸리티 및 설정
├── types/             # TypeScript 타입 정의
└── styles/            # 전역 스타일
```

## 🌐 API 연동

백엔드 API 엔드포인트:
- `GET /api/v1/articles/feed` - 뉴스 피드 조회
- `GET /api/v1/articles/` - 뉴스 목록 조회 (필터링 지원)
- `GET /api/v1/articles/{id}` - 개별 뉴스 상세 조회
- `GET /api/v1/articles/companies/list` - 회사 목록 조회

## 🎨 디자인 시스템

- **Primary Color**: ESG Green (#10B981, #059669)
- **Secondary Color**: Blue (#3B82F6, #2563EB)
- **Typography**: Inter 폰트 패밀리
- **Responsive**: Mobile-first 접근법

## 📦 배포

### Vercel 배포 (권장)

1. GitHub에 코드 푸시
2. Vercel에 프로젝트 연결
3. 자동 배포 완료

### 환경 변수

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=ESG News Monitor
```

## 🔧 개발 가이드

### 컴포넌트 생성
- 재사용 가능한 UI 컴포넌트는 `src/components/ui/`에 생성
- 기능별 컴포넌트는 해당 도메인 폴더에 생성

### API 호출
- TanStack Query를 사용한 서버 상태 관리
- `src/hooks/useArticles.ts`에서 API 관련 훅 제공

### 스타일링
- TailwindCSS 유틸리티 클래스 사용
- 커스텀 컴포넌트는 `cn()` 유틸리티로 클래스 병합

## 📈 성능 최적화

- **번들 크기**: < 500KB (First Load JS)
- **Lighthouse Score**: 90+ 목표
- **Core Web Vitals**: Good 등급 달성

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/기능명`)
3. 변경사항 커밋
4. Pull Request 생성

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.
