# 🗺️ ESG Global Map Architecture

> Phase 3: 지도 컴포넌트 구현을 위한 아키텍처 설계 문서

---

## 📊 **1. 컴포넌트 계층 구조**

```
WorldMapContainer (컨테이너)
├─ SVG Viewport 제어 (viewMode에 따라 viewBox 변경)
├─ WorldMap.svg (배경 지도)
│
├─ RegionGlowLayer (마커 레이어)
│   ├─ [viewMode === 'world'] → RegionMarker (대륙 마커)
│   │   └─ Europe, North America, APAC... (6개)
│   │
│   └─ [viewMode === 'europe_detail'] → CountryMarker (국가 마커)
│       └─ GB, DE, FR, NL... (14개)
│
└─ MapTooltip (호버 시 툴팁)
    └─ 지역/국가명, 기업 수, 클러스터 특성
```

---

## 🎯 **2. 핵심 기능 설계**

### **2.1 뷰포트 제어 (Viewport Control)**

**요구사항:**
- `viewMode`에 따라 SVG `viewBox` 동적 변경
- 부드러운 전환 애니메이션 (Framer Motion)

**구현 전략:**
```typescript
// WorldMapContainer.tsx
const viewportMap = {
  world: WORLD_VIEWPORT,        // "0 0 1000 600"
  europe_detail: EUROPE_VIEWPORT, // "420 160 160 150"
  region: WORLD_VIEWPORT,       // 향후 확장
};

const currentViewport = viewportMap[viewMode];

<motion.svg
  viewBox={currentViewport.viewBox}
  animate={{ viewBox: currentViewport.viewBox }}
  transition={{ duration: 0.6, ease: 'easeInOut' }}
>
```

---

### **2.2 조건부 마커 렌더링**

**요구사항:**
- `viewMode === 'world'` → `REGION_COORDS` (6개 대륙)
- `viewMode === 'europe_detail'` → `EUROPE_HUBS` (14개 국가)
- 필터링 결과 반영 (카운트, 색상)

**구현 전략:**
```typescript
// RegionGlowLayer.tsx
{viewMode === 'world' ? (
  // 대륙 마커
  Object.entries(REGION_COORDS).map(([region, coords]) => (
    <RegionMarker
      key={region}
      region={region}
      coords={coords}
      count={regionCounts[region]}
      onClick={() => zoomToRegion(region)}
    />
  ))
) : viewMode === 'europe_detail' ? (
  // 국가 마커
  Object.entries(EUROPE_HUBS).map(([country, coords]) => (
    <CountryMarker
      key={country}
      country={country}
      coords={coords}
      count={countryCounts[country]}
      onClick={() => setSelectedCountry(country)}
    />
  ))
) : null}
```

---

### **2.3 이벤트 처리 흐름**

**시나리오 1: 유럽 클릭**
```
1. 사용자가 Europe 마커 클릭
   ↓
2. RegionMarker의 onClick 트리거
   ↓
3. Store.zoomToRegion('Europe') 호출
   ↓
4. viewMode → 'europe_detail' 자동 전환
   ↓
5. WorldMapContainer 리렌더링
   - viewBox 변경 (애니메이션)
   - RegionGlowLayer 조건부 렌더링
   ↓
6. EUROPE_HUBS 마커 14개 표시
   ↓
7. 우측 패널 열림 (국가 리스트)
```

**시나리오 2: 필터 적용**
```
1. 사용자가 "Supply Chain" 필터 선택
   ↓
2. Store.setCategoryFilter(['supply-chain'])
   ↓
3. getFilteredCompanies() 재계산
   ↓
4. getCompanyCountByCountry() 업데이트
   ↓
5. CountryMarker 리렌더링
   - radius: 카운트에 비례
   - color: companyType 비율 반영
   ↓
6. 독일(DE) 마커가 커짐 (Supply Chain 강세)
```

---

## 🎨 **3. 마커 디자인 사양**

### **3.1 Region Marker (대륙)**

**시각적 요소:**
- ✅ 원형(Circle) 기본 형태
- ✅ Glow 효과 (filter: blur)
- ✅ Pulse 애니메이션 (2초 주기)
- ✅ 카운트 텍스트 (중앙)

**상태별 스타일:**
```typescript
// 기본 상태
radius: REGION_COORDS[region].radius
opacity: 0.6
color: COLORS.GLOW_CORE (혼합 평균)

// Hover 상태
scale: 1.1
opacity: 0.8
cursor: pointer

// Selected 상태
stroke: COLORS.ACCENT
strokeWidth: 3
```

---

### **3.2 Country Marker (국가)**

**시각적 요소:**
- ✅ 원형(Circle) + 국가 이모지(선택)
- ✅ 색상: companyType 비율 반영
  - CORE 비율 높음 → 초록
  - OPERATIONAL 비율 높음 → 파랑
  - 혼합 → 그라디언트
- ✅ radius: 기업 수에 비례 (18~45px)

**동적 반경 계산:**
```typescript
const calculateRadius = (count: number): number => {
  const baseRadius = 18;
  const maxRadius = 45;
  const countFactor = Math.sqrt(count); // 제곱근으로 완화
  return Math.min(baseRadius + countFactor * 3, maxRadius);
};
```

---

## 🔄 **4. 데이터 흐름**

```
Store (Zustand)
  ↓
  ├─ companies: Company[]
  ├─ filters: FilterState
  ├─ mapState: MapState (viewMode, selected, hovered)
  └─ Computed Getters:
      ├─ getFilteredCompanies()
      ├─ getCompanyCountByCountry()
      └─ getCompanyCountByRegion()
        ↓
Selector Hooks
  ↓
  ├─ useMapState()          → WorldMapContainer
  ├─ useCompanyCountByCountry() → CountryMarker
  └─ useCompanyCountByRegion()  → RegionMarker
        ↓
Components
  ↓
  ├─ WorldMapContainer: viewBox 제어
  ├─ RegionGlowLayer: 조건부 렌더링
  ├─ RegionMarker / CountryMarker: 이벤트 처리
  └─ MapTooltip: 정보 표시
```

---

## 🛠️ **5. 파일 구조**

```
frontend/src/components/features/map/
├── ARCHITECTURE.md         (이 파일)
├── index.ts                (export 정리)
│
├── WorldMapContainer.tsx   (메인 컨테이너)
│   - SVG viewport 제어
│   - 배경 지도 렌더링
│   - 전역 이벤트 리스너
│
├── layers/
│   ├── RegionGlowLayer.tsx (마커 레이어)
│   │   - viewMode 기반 조건부 렌더링
│   │   - RegionMarker / CountryMarker 관리
│   │
│   └── GridOverlay.tsx     (개발 모드 전용)
│       - 좌표 디버깅용 그리드
│
├── markers/
│   ├── RegionMarker.tsx    (대륙 마커)
│   │   - Circle + Glow
│   │   - Click → zoomToRegion()
│   │   - Hover → 툴팁 표시
│   │
│   ├── CountryMarker.tsx   (국가 마커)
│   │   - Circle + 색상 혼합
│   │   - Click → setSelectedCountry()
│   │   - 동적 radius 계산
│   │
│   └── MarkerLabel.tsx     (마커 라벨)
│       - 카운트 텍스트
│       - 국가 이모지 (선택)
│
├── tooltip/
│   └── MapTooltip.tsx      (호버 툴팁)
│       - 지역/국가명
│       - 기업 수
│       - ESG 클러스터 특성
│
└── utils/
    ├── markerUtils.ts      (마커 관련 유틸)
    │   - calculateRadius()
    │   - getMarkerColor()
    │   - checkCollision()
    │
    └── svgUtils.ts         (SVG 관련 유틸)
        - getViewBoxString()
        - convertCoords()
```

---

## ⚡ **6. 성능 최적화 전략**

### **6.1 렌더링 최적화**
```typescript
// 1. React.memo로 불필요한 리렌더링 방지
export const RegionMarker = React.memo(({ region, ... }) => { ... });

// 2. Selector 기반 구독 (최소 단위)
const mapState = useMapState();        // viewMode만 구독
const counts = useCompanyCountByCountry(); // 카운트만 구독

// 3. 이벤트 핸들러 메모이제이션
const handleClick = useCallback(() => {
  zoomToRegion(region);
}, [region, zoomToRegion]);
```

### **6.2 애니메이션 최적화**
```typescript
// Framer Motion의 layoutId 활용
<motion.circle
  layoutId={`marker-${region}`}
  transition={{ duration: 0.6, ease: 'easeInOut' }}
/>
```

### **6.3 SVG 최적화**
- `world.svg`: SVGO로 경량화
- `path` 복잡도 축소
- `filter` (glow) 개수 최소화

---

## 🧪 **7. 개발 모드 지원**

### **7.1 좌표 디버깅**
```typescript
// constants/esg-map.ts
export const DEV_MODE = {
  SHOW_COORDINATES: true,  // 마커 위 좌표 표시
  SHOW_COUNTRY_CODES: true, // 국가 코드 표시
  SHOW_GRID: true,          // 그리드 오버레이
};

// GridOverlay.tsx (DEV_MODE.SHOW_GRID === true일 때만 렌더링)
{DEV_MODE.SHOW_GRID && <GridOverlay />}
```

### **7.2 Zustand DevTools**
```typescript
// Store에서 이미 설정됨
devtools(..., {
  name: 'ESGMapStore',
  enabled: process.env.NODE_ENV === 'development',
})
```

---

## 🚦 **8. 구현 순서**

### **Phase 3-1: 기본 구조 (현재)**
1. ✅ `WorldMapContainer.tsx`: SVG 컨테이너 + 뷰포트 제어
2. ✅ `RegionGlowLayer.tsx`: 조건부 렌더링 로직
3. ✅ `RegionMarker.tsx`: 대륙 마커 (기본 동작)

### **Phase 3-2: 국가 마커**
4. `CountryMarker.tsx`: 국가 마커 (색상, radius 동적)
5. `markerUtils.ts`: 유틸 함수

### **Phase 3-3: 인터랙션**
6. 이벤트 연결 (click, hover)
7. `MapTooltip.tsx`: 툴팁

### **Phase 3-4: 폴리싱**
8. 애니메이션 고도화
9. 성능 최적화
10. 개발 모드 도구

---

## 🎯 **9. 핵심 검증 포인트**

작업 완료 후 다음 항목을 검증:

### **기능 검증**
- [ ] 세계 지도 → 유럽 확대 전환 (부드러운 애니메이션)
- [ ] 유럽 확대 시 14개 국가 마커 표시
- [ ] 필터 변경 시 마커 카운트 실시간 반영
- [ ] Supply Chain 필터 → 독일 마커 강조
- [ ] 국가 클릭 → 우측 패널 기업 리스트 표시

### **UX 검증**
- [ ] Hover 시 툴팁 표시 (지연 없음)
- [ ] 마커 크기가 적절한가? (겹치지 않는가?)
- [ ] 색상 구분이 명확한가? (CORE vs OPERATIONAL)
- [ ] ESC 키로 세계 지도 복귀

### **성능 검증**
- [ ] 필터 변경 시 응답 속도 < 50ms
- [ ] 애니메이션 끊김 없음 (60fps)
- [ ] 메모리 누수 없음

---

## 📝 **10. 작업 체크리스트**

- [x] next.config.ts SVGR 설정
- [x] 아키텍처 설계 문서 작성
- [ ] 폴더 구조 생성
- [ ] WorldMapContainer.tsx 작성
- [ ] RegionGlowLayer.tsx 작성
- [ ] RegionMarker.tsx 작성
- [ ] 테스트 및 좌표 조정

---

**다음 작업:** `WorldMapContainer.tsx` 구현 시작! 🚀

