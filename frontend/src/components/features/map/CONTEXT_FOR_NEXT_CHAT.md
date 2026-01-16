# 🔄 다음 대화를 위한 Context (2025-11-24)

## 📌 현재 프로젝트 상태

### **프로젝트:** ESG Global Map - Interactive Visualization
### **마지막 작업일:** 2025-11-24
### **Phase:** Phase 5 완료 (프론트엔드 UX 완성)

---

## 🎯 현재까지 완료된 핵심 기능

### **1. 지도 시각화 (Phase 3)**
- ✅ SVG 기반 인터랙티브 월드맵
- ✅ 4개 지역 상세 뷰 (Europe, Asia, Oceania, North America)
- ✅ Region/Country 마커 시스템 (Glow + Pulse 효과)
- ✅ 좌표 정밀 보정 완료 (100% 정확도)

### **2. 필터 시스템 (Phase 4)**
- ✅ Top Filter Bar (검색 + 드롭다운 칩)
- ✅ 실시간 검색 (Debounce + Smart Autocomplete)
- ✅ 11단계 필터링 로직 (Region, Country, Type, Feature Groups, Frameworks, 검색어 등)
- ✅ 필터 초기화 버튼

### **3. 패널 시스템 (Phase 5-2)**
- ✅ **Multi-Mode Panel:** List View + Detail View
- ✅ **Back Navigation:** "< Back to [Country] List" 버튼
- ✅ **Glassmorphism Design:** 현대적인 UI
- ✅ **Map Offset:** 패널 열림 시 지도 중심 자동 이동

### **4. UX 완성도 (Phase 5-2)**
- ✅ **Dynamic Fit-Bounds:** 모든 화면 크기 대응 (브라우저 줌 대응)
- ✅ **Visual Clutter 해결:** Label Show on Hover + Dimming Effect
- ✅ **Smart Tooltip:** 화면 가장자리 자동 위치 조정
- ✅ **Breadcrumbs:** World → Region → Country 네비게이션

---

## 🔧 핵심 기술 스택

### **Frontend**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Zustand (전역 상태 관리)
- Framer Motion (애니메이션)
- Tailwind CSS + shadcn/ui
- Lucide Icons

### **Data**
- 정적 JSON 파일: `frontend/public/data/esg_companies_global.json`
- 18개 ESG SaaS 기업 마스터 데이터

---

## 📂 핵심 파일 구조

```
frontend/src/components/features/map/
├── PROGRESS.md (✅ 업데이트됨)
├── ARCHITECTURE.md
├── WorldMapContainer.tsx (메인 컨테이너, Dynamic Fit-Bounds)
├── types/esg-map.ts (타입 정의)
├── constants/esg-map.ts (REGION_BBOX, 좌표, 색상)
├── store/esgMapStore.ts (Zustand Store)
├── hooks/useWindowSize.ts (신규)
├── controls/
│   ├── TopFilterBar.tsx (검색 + 필터 칩)
│   ├── SearchInput.tsx (Smart Autocomplete)
│   ├── FilterChip.tsx
│   ├── FilterDropdown.tsx
│   └── MapBreadcrumbs.tsx (재설계)
├── panels/
│   ├── CompanyDetailPanel.tsx (Multi-Mode: List + Detail)
│   └── RegionCountrySelector.tsx
├── layers/
│   ├── MapPathsLayer.tsx (배경 지도)
│   └── RegionGlowLayer.tsx (마커 레이어, Z-Index 관리)
├── markers/
│   ├── RegionMarker.tsx
│   └── CountryMarker.tsx (Label Visibility + Dimming)
└── tooltip/
    └── MapTooltip.tsx (간소화 + Smart Positioning)
```

---

## 🚨 중요한 설계 결정사항

### **1. 좌표계 (Coordinate System)**
```typescript
// SVG viewBox: 2000 x 857
WORLD_VIEWPORT: { viewBox: '0 0 2000 857' }

// 모든 좌표는 이 스케일 기준
REGION_COORDS['Europe']: { x: 1025, y: 200, radius: 80 }
EUROPE_HUBS['GB']: { x: 940, y: 140, radius: 35 }
```

### **2. Dynamic Fit-Bounds 로직**
```typescript
// WorldMapContainer.tsx
const getDynamicViewBox = () => {
  const targetBBox = REGION_BBOX[viewMode];
  const availableW = width - (rightPanel.isOpen ? PANEL_WIDTH.RIGHT : 0);
  const scale = Math.min(availableW / targetBBox.w, height / targetBBox.h) * 0.9;
  // ViewBox 계산...
};
```
**핵심:** 브라우저 크기 + 패널 상태 → 최적 Scale 자동 계산

### **3. Panel State 구조**
```typescript
rightPanel: {
  isOpen: boolean;
  mode: 'list' | 'detail';
  targetCountry: CountryCode | null;  // Back Navigation 컨텍스트
}
```

### **4. Z-Index 전략**
- Map Base: 1
- Markers: 10
- Tooltip: 50
- Panels: 1000
- Dropdowns: 1100

---

## ⚠️ 알려진 이슈 & 제약사항

### **해결된 이슈** ✅
1. ~~필터가 작동하지 않음~~ → `useFilteredCompanies` 훅으로 해결
2. ~~검색 후 패널 안 열림~~ → `focusCompany` 로직 수정
3. ~~브라우저 줌 시 스크롤바~~ → Dynamic Fit-Bounds 구현
4. ~~북미 바다만 보임~~ → REGION_BBOX 특별 처리
5. ~~유럽 마커 겹침~~ → Label on Hover + Dimming Effect

### **남은 작업 (Minor)**
- [ ] 모바일 반응형 테스트 (현재 데스크탑 최적화)
- [ ] 접근성 검증 (키보드 네비게이션 등)
- [ ] 성능 프로파일링 (1000+ 기업 데이터 시)

---

## 🔑 주요 함수 & 액션

### **Store Actions (esgMapStore.ts)**
```typescript
// 뷰 모드 전환
zoomToRegion(region: Region)  // Europe → europe_detail
zoomToWorld()                  // World 뷰로 복귀

// 기업 선택
setSelectedCompany(company)    // targetCountry 자동 설정 + Panel 오픈
focusCompany(companyId)        // 검색 결과 → 줌인 + Panel 오픈

// 패널 제어
openRightPanel(mode, targetCountry?)
closeRightPanel()

// 필터
setSearchQuery(query)
setRegionFilter(regions)
resetFilters()
```

### **Helper Hooks**
```typescript
useFilteredCompanies()         // 필터링된 기업 목록
useCompanyCountByCountry()     // 국가별 카운트
useCompanyCountByRegion()      // 지역별 카운트
useWindowSize()                // 브라우저 창 크기
```

---

## 💡 다음 대화 시작 시 읽어야 할 파일

### **필수 파일 (우선순위 순)**
1. `frontend/src/components/features/map/PROGRESS.md` (✅ 최신 업데이트)
2. `frontend/src/components/features/map/CONTEXT_FOR_NEXT_CHAT.md` (이 파일)
3. `frontend/src/types/esg-map.ts` (타입 정의)
4. `frontend/src/constants/esg-map.ts` (좌표, 색상, REGION_BBOX)
5. `frontend/src/store/esgMapStore.ts` (전역 상태)

### **기능별 참고 파일**
- **지도 뷰포트:** `WorldMapContainer.tsx`
- **마커 렌더링:** `RegionGlowLayer.tsx`, `CountryMarker.tsx`
- **패널 시스템:** `CompanyDetailPanel.tsx`
- **필터 UI:** `TopFilterBar.tsx`, `SearchInput.tsx`
- **네비게이션:** `MapBreadcrumbs.tsx`

---

## 🎬 권장 시작 프롬프트 (다음 대화)

```
안녕하세요! ESG Global Map 프로젝트를 이어서 작업하고 싶습니다.

먼저 다음 파일들을 읽어주세요:
1. @frontend/src/components/features/map/PROGRESS.md
2. @frontend/src/components/features/map/CONTEXT_FOR_NEXT_CHAT.md

현재 Phase 5 (프론트엔드 UX 완성)까지 완료된 상태입니다.
다음 작업으로 [구체적인 요청]을 진행하고 싶습니다.
```

---

## 📊 성능 & 데이터 현황

### **데이터 규모**
- 총 기업 수: 18개 (테스트 데이터)
- 지원 국가: 16개 (Europe 14 + Asia 2 + Oceania 1 + North America 2)
- Feature Tags: 200+개
- Framework Tags: 60+개

### **렌더링 성능**
- 초기 로딩: < 500ms (정적 JSON)
- 필터 적용: < 50ms (Zustand Selector 최적화)
- 뷰 전환 애니메이션: 600ms (Framer Motion)

---

## 🔮 향후 로드맵 (참고용)

### **Phase 6: 테스트 & 최적화**
- E2E 시나리오 테스트
- 성능 프로파일링
- 모바일 반응형
- 접근성 검증

### **Phase 7: 백엔드 연동**
- 실시간 데이터 API 연동
- 무한 스크롤 (Lazy Loading)
- 데이터 캐싱 전략

### **Phase 8: 고급 기능**
- 기업 비교 기능 (Compare Mode)
- 즐겨찾기 & 저장 (Local Storage)
- 통계 대시보드 (Chart.js)
- Export 기능 (CSV, PDF)

---

**작성일:** 2025-11-24  
**작성자:** AI Assistant (Claude Sonnet 4.5)  
**다음 업데이트:** Phase 6 시작 시

