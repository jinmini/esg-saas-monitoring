# 🔧 ESG Map 리팩토링 제안서

> 작성일: 2025-11-28  
> 기준: CODE_REVIEW_REPORT.md  
> 목표: 코드 품질 향상, 성능 최적화, 유지보수성 개선

---

## 📋 Executive Summary

| 항목 | 현재 상태 | 목표 상태 | 예상 효과 |
|------|----------|----------|----------|
| **코드 중복** | 265줄 (RegionGlowLayer) | 80줄 (-70%) | 유지보수성 10x ↑ |
| **필터링 성능** | O(n*m) 반복 계산 | O(1) 캐싱 | 10x 속도 향상 |
| **검색 성능** | O(n²) | O(n) 인덱싱 | 10x 속도 향상 |
| **Store 구독** | 8개 (RegionGlowLayer) | 1개 Selector | 리렌더링 최소화 |
| **테스트 가능성** | 중간 | 높음 | CI/CD 안정성 ↑ |

---

## 🎯 Phase 1: Critical Issues (우선순위 High)

### 1.1 RegionGlowLayer 중복 코드 제거

**현재 문제:**
```typescript
// 동일한 로직이 6번 반복 (150줄 중복)
if (viewMode === 'europe_detail') { /* 마커 렌더링 */ }
if (viewMode === 'asia_detail') { /* 동일 로직 */ }
// ... 4개 더
```

**리팩토링 후:**
```typescript
// constants/esg-map.ts
export const REGION_HUB_MAP: Record<MapViewMode, Record<CountryCode, RegionCoordinates> | null> = {
  'world': null,
  'europe_detail': EUROPE_HUBS,
  'asia_detail': ASIA_HUBS,
  // ...
};

// RegionGlowLayer.tsx
const currentHubs = REGION_HUB_MAP[viewMode];

if (viewMode === 'world') {
  return <g>{/* Region Markers */}</g>;
}

if (!currentHubs) return null;

const sortedHubs = Object.entries(currentHubs).sort(/* Z-Index */);

return (
  <g id={`country-markers-${viewMode}`}>
    {sortedHubs.map(([countryCode, coords]) => (
      <CountryMarker key={countryCode} {...props} />
    ))}
  </g>
);
```

**예상 효과:**
- 265줄 → 80줄 (70% 감소)
- 버그 수정 6곳 → 1곳
- 신규 지역 추가: 2분 (constants만 수정)

---

### 1.2 AI Maturity 캐싱

**현재 문제:**
```typescript
// 필터 변경 시마다 전체 기업 텍스트 분석 반복 (O(n*m))
filtered = filtered.filter(c => calculateAIMaturity(c) === filters.aiMaturity);
```

**리팩토링 후:**
```typescript
// Store 초기화 시 사전 계산
const aiMaturityCache = new Map<string, AIMaturityLevel>();

setCompanies: (data: ESGMapData) => {
  // 1. AI Maturity 미리 계산하여 캐싱
  data.companies.forEach(company => {
    aiMaturityCache.set(company.id, calculateAIMaturity(company));
  });
  
  set({ companies: data.companies, ... });
}

// 필터링 시 O(1) lookup
if (filters.aiMaturity) {
  filtered = filtered.filter(c => aiMaturityCache.get(c.id) === filters.aiMaturity);
}
```

**예상 효과:**
- 필터링 속도: ~200ms → ~20ms (10x 개선)
- CPU 사용률 감소

---

### 1.3 zoomToRegion 로직 중복 제거

**현재 문제:**
```typescript
// focusCompany, zoomToRegion에 동일 switch-case 중복
if (region === 'Europe') viewMode = 'europe_detail';
else if (region === 'Asia') viewMode = 'asia_detail';
// ... 6개 지역
```

**리팩토링 후:**
```typescript
// 헬퍼 함수 추출
const getViewModeFromRegion = (region: Region): MapState['viewMode'] => {
  const map: Record<Region, MapState['viewMode']> = {
    'Europe': 'europe_detail',
    'Asia': 'asia_detail',
    'Oceania': 'oceania_detail',
    'North America': 'north_america_detail',
    'Middle East': 'middle_east_detail',
    'South America': 'south_america_detail',
    'Africa': 'region',
  };
  return map[region] || 'region';
};

// 사용
focusCompany: (companyId) => {
  const company = get().companies.find(c => c.id === companyId);
  if (!company) return;
  
  const viewMode = getViewModeFromRegion(company.region as Region);
  // ...
}
```

**예상 효과:**
- 중복 코드 제거
- 타입 안정성 향상

---

## 🔶 Phase 2: Performance Optimization (우선순위 Medium)

### 2.1 ViewBox 계산 유틸 분리

**파일 구조:**
```
frontend/src/components/features/map/utils/
├── markerUtils.ts (기존)
└── viewportCalculator.ts (신규)
    ├── calculateAvailableSpace()
    ├── calculateFitScale()
    ├── calculateViewBoxSize()
    ├── calculateViewBoxOrigin()
    └── calculateViewBox() // 메인 함수
```

**예상 효과:**
- 테스트 가능성 ↑
- 재사용성 ↑
- 가독성 ↑

---

### 2.2 SearchInput 인덱싱

**리팩토링 후:**
```typescript
// 1. 데이터 로딩 시 인덱스 생성 (한 번만)
const searchIndex = useMemo(() => ({
  companies: new Map(companies.map(c => [c.name.toLowerCase(), c])),
  features: new Set(companies.flatMap(c => c.features)),
  frameworks: new Set(companies.flatMap(c => c.frameworks)),
}), [companies]);

// 2. 검색 시 인덱스 활용
const suggestions = useMemo(() => {
  // O(n²) → O(n) 개선
  const results: Suggestion[] = [];
  
  for (const [key, company] of searchIndex.companies) {
    if (key.includes(query)) results.push({ type: 'company', ... });
  }
  
  return results.slice(0, 10);
}, [inputValue, searchIndex]);
```

**예상 효과:**
- 검색 속도: ~100ms → ~10ms
- 타이핑 경험 개선

---

### 2.3 Store Selector 패턴 적용

**신규 파일:** `store/selectors.ts`
```typescript
// 각 컴포넌트별 Selector 정의
export const useMapContainerState = () => useESGMapStore(
  useCallback((state) => ({
    mapState: state.mapState,
    rightPanel: state.panelState.rightPanel,
    zoomToWorld: state.zoomToWorld,
  }), [])
);

export const useRegionGlowLayerState = () => useESGMapStore(
  useCallback((state) => ({
    viewMode: state.mapState.viewMode,
    selectedRegion: state.mapState.selectedRegion,
    selectedCountry: state.mapState.selectedCountry,
    hoveredRegion: state.mapState.hoveredRegion,
    hoveredCountry: state.mapState.hoveredCountry,
    // ... actions
  }), [])
);
```

**예상 효과:**
- 불필요한 리렌더링 최소화
- Store 구독 관리 중앙화

---

### 2.4 SVG Filter 전역 정의

**현재 문제:**
```typescript
// 각 마커마다 <defs> 정의 → 중복 렌더링
<RegionMarker>
  <defs><filter id="glow">...</filter></defs>
</RegionMarker>
```

**리팩토링 후:**
```typescript
// WorldMapContainer.tsx
<svg>
  <defs>
    <filter id="glow-global">
      <feGaussianBlur stdDeviation="8" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glow-country-global" stdDeviation="5">...</filter>
  </defs>
  
  <RegionGlowLayer />
</svg>

// RegionMarker.tsx
filter="url(#glow-global)" // 전역 참조
```

**예상 효과:**
- DOM 노드 감소
- 렌더링 성능 향상

---

## 🔷 Phase 3: Nice-to-Have (우선순위 Low)

### 3.1 Keyboard Navigation (SearchInput)

```typescript
const [selectedIndex, setSelectedIndex] = useState(0);

const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown': setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1)); break;
    case 'ArrowUp': setSelectedIndex(prev => Math.max(prev - 1, 0)); break;
    case 'Enter': handleSelect(suggestions[selectedIndex]); break;
    case 'Escape': setIsOpen(false); break;
  }
};
```

### 3.2 useDevMode Hook

```typescript
// hooks/useDevMode.ts
export const useDevMode = () => {
  const [showGrid, setShowGrid] = useState(() => {
    return localStorage.getItem('esg-map-dev-mode') === 'true' ||
           new URLSearchParams(window.location.search).has('debug');
  });
  
  useEffect(() => {
    // Ctrl + Shift + D: 개발 모드 토글
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowGrid(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return showGrid;
};
```

### 3.3 Hover 라벨 너비 정확 측정

```typescript
// CountryMarker.tsx (단일 기업 Pin)
const textRef = useRef<SVGTextElement>(null);
const [labelWidth, setLabelWidth] = useState(100);

useEffect(() => {
  if (textRef.current) {
    const bbox = textRef.current.getBBox();
    setLabelWidth(bbox.width + 24); // padding
  }
}, [company.name]);
```

### 3.4 Dead Code 제거

- `markerUtils.ts`의 `checkCollision` 함수 (미사용)
- 불필요한 주석 정리

---

## 📅 Implementation Roadmap

### Week 1: Critical Issues (Phase 1)
| Task | 예상 시간 | 담당 |
|------|----------|------|
| RegionGlowLayer 리팩토링 | 2시간 | Dev |
| AI Maturity 캐싱 | 1시간 | Dev |
| zoomToRegion 헬퍼 추출 | 30분 | Dev |
| 테스트 & 검증 | 1시간 | QA |

### Week 2: Performance (Phase 2)
| Task | 예상 시간 | 담당 |
|------|----------|------|
| ViewBox 유틸 분리 | 2시간 | Dev |
| SearchInput 인덱싱 | 1.5시간 | Dev |
| Selector 패턴 적용 | 1시간 | Dev |
| SVG Filter 전역화 | 30분 | Dev |

### Week 3: Nice-to-Have (Phase 3)
- Keyboard Navigation
- useDevMode Hook
- 기타 개선사항

---

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// markerUtils.test.ts
describe('calculateRadius', () => {
  it('should return 0 for count 0', () => {
    expect(calculateRadius(0)).toBe(0);
  });
  
  it('should use sqrt scale', () => {
    expect(calculateRadius(50, 12, 35)).toBe(35);
  });
});

// viewportCalculator.test.ts
describe('calculateViewBox', () => {
  it('should handle panel open/close', () => {
    const result1 = calculateViewBox('world', { width: 1920, height: 1080, panelWidth: 0 });
    const result2 = calculateViewBox('world', { width: 1920, height: 1080, panelWidth: 400 });
    expect(result1).not.toBe(result2);
  });
});
```

### 2. Integration Tests
- Store 액션 시퀀스 테스트
- 필터링 정확도 테스트
- 검색 성능 벤치마크

### 3. E2E Tests (Playwright)
```typescript
test('should zoom to region on click', async ({ page }) => {
  await page.goto('/analysis');
  await page.click('[data-testid="region-marker-europe"]');
  await expect(page.locator('[data-testid="country-marker-GB"]')).toBeVisible();
});
```

---

## 📊 Success Metrics

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| **코드 중복률** | 15% | < 5% | SonarQube |
| **필터링 속도** | ~200ms | < 50ms | Performance API |
| **검색 속도** | ~100ms | < 20ms | Performance API |
| **번들 크기** | 현재 | -10% | Webpack Bundle Analyzer |
| **Lighthouse Score** | 현재 | +5점 | CI Pipeline |

---

## 🚀 Quick Wins (즉시 적용 가능)

1. **zoomToRegion 헬퍼 추출** (30분)
2. **매직 넘버 상수화** (20분)
3. **Dead Code 제거** (10분)
4. **SVG Filter 전역화** (30분)

**총 소요 시간: ~1.5시간, 즉시 적용 가능** ✅

---

## ⚠️ Risk Assessment

| 위험 요소 | 확률 | 영향도 | 완화 방안 |
|----------|------|--------|----------|
| RegionGlowLayer 리팩토링 버그 | 중 | 높음 | 단계별 커밋, 철저한 테스트 |
| 성능 최적화 역효과 | 낮음 | 중 | 벤치마크 전후 비교 |
| 타입 에러 (리팩토링 후) | 중 | 낮음 | TypeScript strict 모드 |

---

## 💬 Conclusion

이 리팩토링은 **점진적 개선**을 목표로 합니다:

1. **Phase 1 (Week 1):** Critical Issues 해결 → 유지보수성 극대화
2. **Phase 2 (Week 2):** 성능 최적화 → 사용자 경험 개선
3. **Phase 3 (Week 3):** Nice-to-Have → 개발 편의성 향상

**리팩토링 없이도 현재 코드는 충분히 훌륭하지만**, 이 개선을 통해 **장기적인 유지보수 비용을 크게 절감**할 수 있습니다.

---

**다음 단계:** 팀 리뷰 후 Phase 1 착수 🚀

