/**
 * ESG Global Map Store (Zustand)
 * 글로벌 ESG SaaS 지도 기능을 위한 전역 상태 관리
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Company,
  ESGMapData,
  ESGMapMetadata,
  FilterState,
  MapState,
  PanelState,
  StatsData,
  Region,
  CountryCode,
  CompanyType,
  FilterCategory,
} from '@/types/esg-map';

// ============================================
// State 인터페이스
// ============================================

/**
 * ESG Map 상태
 */
interface ESGMapState {
  // 데이터
  companies: Company[];
  metadata: ESGMapMetadata | null;
  isLoading: boolean;
  error: string | null;

  // 필터 상태
  filters: FilterState;

  // 지도 상태
  mapState: MapState;

  // 패널 상태
  panelState: PanelState;
}

// ============================================
// Actions 인터페이스
// ============================================

/**
 * ESG Map 액션
 */
interface ESGMapActions {
  // 데이터 로딩
  setCompanies: (data: ESGMapData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 필터 액션
  setRegionFilter: (regions: Region[]) => void;
  setCountryFilter: (countries: CountryCode[]) => void;
  setCompanyTypeFilter: (types: CompanyType[]) => void;
  setCategoryFilter: (categories: FilterCategory[]) => void;
  setFeatureFilter: (features: string[]) => void;
  setFrameworkFilter: (frameworks: string[]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;

  // 지도 액션
  setHoveredRegion: (region: Region | null) => void;
  setHoveredCountry: (country: CountryCode | null) => void;
  setSelectedRegion: (region: Region | null) => void;
  setSelectedCountry: (country: CountryCode | null) => void;
  setSelectedCompany: (company: Company | null) => void;
  
  // 🎯 핵심: 뷰 모드 전환 (자동 전환 로직 포함)
  setViewMode: (mode: MapState['viewMode']) => void;
  zoomToRegion: (region: Region) => void; // 지역 클릭 시 자동 확대
  zoomToWorld: () => void; // 세계 지도로 복귀

  // 패널 액션
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: 'filters' | 'stats') => void;
  setRightPanelMode: (mode: PanelState['rightPanel']['mode']) => void;

  // 초기화
  reset: () => void;
}

// ============================================
// Computed Getters (Selector 함수)
// ============================================

/**
 * 필터링된 기업 목록
 */
const getFilteredCompanies = (state: ESGMapState): Company[] => {
  let filtered = state.companies;

  // 1. Region 필터
  if (state.filters.regions.length > 0) {
    filtered = filtered.filter((c) =>
      state.filters.regions.includes(c.region as Region)
    );
  }

  // 2. Country 필터
  if (state.filters.countries.length > 0) {
    filtered = filtered.filter((c) =>
      state.filters.countries.includes(c.countryCode as CountryCode)
    );
  }

  // 3. Company Type 필터
  if (state.filters.companyTypes.length > 0) {
    filtered = filtered.filter((c) =>
      state.filters.companyTypes.includes(c.companyType)
    );
  }

  // 4. Category 필터 (Features + Frameworks 매핑)
  if (state.filters.categories.length > 0) {
    // Category → Features/Frameworks 매핑 (constants에서 가져옴)
    const { FILTER_CATEGORIES } = require('@/constants/esg-map');
    const relatedTags = state.filters.categories.flatMap((catId) => {
      const cat = FILTER_CATEGORIES.find((c: any) => c.id === catId);
      return [
        ...(cat?.relatedFeatures || []),
        ...(cat?.relatedFrameworks || []),
      ];
    });

    filtered = filtered.filter((c) => {
      const companyTags = [...c.features, ...c.frameworks];
      return relatedTags.some((tag) => companyTags.includes(tag));
    });
  }

  // 5. Feature 필터 (직접 선택)
  if (state.filters.features.length > 0) {
    filtered = filtered.filter((c) =>
      state.filters.features.some((f) => c.features.includes(f))
    );
  }

  // 6. Framework 필터 (직접 선택)
  if (state.filters.frameworks.length > 0) {
    filtered = filtered.filter((c) =>
      state.filters.frameworks.some((fw) => c.frameworks.includes(fw))
    );
  }

  // 7. 검색 쿼리
  if (state.filters.searchQuery.trim()) {
    const query = state.filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.nameLocal.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.descriptionEn.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );
  }

  return filtered;
};

/**
 * 🎯 국가별 기업 카운트 (필터링 결과 반영)
 * Navigator 요구사항 #2, #3: 필터링 결과가 국가별 집계에 반영
 */
const getCompanyCountByCountry = (
  state: ESGMapState
): Record<CountryCode, number> => {
  const filtered = getFilteredCompanies(state);
  const countMap: Partial<Record<CountryCode, number>> = {};

  filtered.forEach((company) => {
    const code = company.countryCode as CountryCode;
    countMap[code] = (countMap[code] || 0) + 1;
  });

  return countMap as Record<CountryCode, number>;
};

/**
 * 지역별 기업 카운트 (필터링 결과 반영)
 */
const getCompanyCountByRegion = (
  state: ESGMapState
): Record<Region, number> => {
  const filtered = getFilteredCompanies(state);
  const countMap: Partial<Record<Region, number>> = {};

  filtered.forEach((company) => {
    const region = company.region as Region;
    countMap[region] = (countMap[region] || 0) + 1;
  });

  return countMap as Record<Region, number>;
};

/**
 * 특정 국가의 기업 목록
 */
const getCompaniesByCountry = (
  state: ESGMapState,
  countryCode: CountryCode
): Company[] => {
  const filtered = getFilteredCompanies(state);
  return filtered.filter((c) => c.countryCode === countryCode);
};

/**
 * 특정 지역의 기업 목록
 */
const getCompaniesByRegion = (
  state: ESGMapState,
  region: Region
): Company[] => {
  const filtered = getFilteredCompanies(state);
  return filtered.filter((c) => c.region === region);
};

/**
 * 통계 데이터 계산
 */
const getStats = (state: ESGMapState): StatsData => {
  const filtered = getFilteredCompanies(state);

  // Company Type 카운트
  const coreCount = filtered.filter(
    (c) => c.companyType === 'CORE_ESG_PLATFORM'
  ).length;
  const operationalCount = filtered.filter(
    (c) => c.companyType === 'OPERATIONAL_ESG_ENABLER'
  ).length;

  // 활성 지역 수
  const activeRegions = new Set(filtered.map((c) => c.region)).size;

  // Top Features
  const featureCounts: Record<string, number> = {};
  filtered.forEach((c) => {
    c.features.forEach((f) => {
      featureCounts[f] = (featureCounts[f] || 0) + 1;
    });
  });
  const topFeatures = Object.entries(featureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([feature, count]) => ({ feature, count }));

  // Top Frameworks
  const frameworkCounts: Record<string, number> = {};
  filtered.forEach((c) => {
    c.frameworks.forEach((fw) => {
      frameworkCounts[fw] = (frameworkCounts[fw] || 0) + 1;
    });
  });
  const topFrameworks = Object.entries(frameworkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([framework, count]) => ({ framework, count }));

  return {
    totalCompanies: filtered.length,
    coreCount,
    operationalCount,
    activeRegions,
    topFeatures,
    topFrameworks,
  };
};

// ============================================
// Store 타입
// ============================================

type ESGMapStore = ESGMapState & ESGMapActions & {
  // Computed Getters
  getFilteredCompanies: () => Company[];
  getCompanyCountByCountry: () => Record<CountryCode, number>;
  getCompanyCountByRegion: () => Record<Region, number>;
  getCompaniesByCountry: (countryCode: CountryCode) => Company[];
  getCompaniesByRegion: (region: Region) => Company[];
  getStats: () => StatsData;
};

// ============================================
// Initial State
// ============================================

const initialState: ESGMapState = {
  // 데이터
  companies: [],
  metadata: null,
  isLoading: false,
  error: null,

  // 필터
  filters: {
    regions: [],
    countries: [],
    companyTypes: [],
    categories: [],
    features: [],
    frameworks: [],
    searchQuery: '',
  },

  // 지도 상태
  mapState: {
    hoveredRegion: null,
    hoveredCountry: null,
    selectedRegion: null,
    selectedCountry: null,
    selectedCompany: null,
    viewMode: 'world',
    focusedRegion: null,
  },

  // 패널 상태
  panelState: {
    leftPanel: {
      isOpen: true,
      activeTab: 'filters',
    },
    rightPanel: {
      isOpen: false,
      mode: 'region-list',
    },
  },
};

// ============================================
// Store 생성
// ============================================

export const useESGMapStore = create<ESGMapStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ========================================
      // 데이터 로딩
      // ========================================

      setCompanies: (data: ESGMapData) =>
        set({
          companies: data.companies,
          metadata: data.metadata,
          isLoading: false,
          error: null,
        }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      // ========================================
      // 필터 액션
      // ========================================

      setRegionFilter: (regions: Region[]) =>
        set((state) => ({
          filters: { ...state.filters, regions },
        })),

      setCountryFilter: (countries: CountryCode[]) =>
        set((state) => ({
          filters: { ...state.filters, countries },
        })),

      setCompanyTypeFilter: (types: CompanyType[]) =>
        set((state) => ({
          filters: { ...state.filters, companyTypes: types },
        })),

      setCategoryFilter: (categories: FilterCategory[]) =>
        set((state) => ({
          filters: { ...state.filters, categories },
        })),

      setFeatureFilter: (features: string[]) =>
        set((state) => ({
          filters: { ...state.filters, features },
        })),

      setFrameworkFilter: (frameworks: string[]) =>
        set((state) => ({
          filters: { ...state.filters, frameworks },
        })),

      setSearchQuery: (query: string) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        })),

      resetFilters: () =>
        set({
          filters: initialState.filters,
        }),

      // ========================================
      // 지도 액션
      // ========================================

      setHoveredRegion: (region: Region | null) =>
        set((state) => ({
          mapState: { ...state.mapState, hoveredRegion: region },
        })),

      setHoveredCountry: (country: CountryCode | null) =>
        set((state) => ({
          mapState: { ...state.mapState, hoveredCountry: country },
        })),

      setSelectedRegion: (region: Region | null) =>
        set((state) => ({
          mapState: { ...state.mapState, selectedRegion: region },
        })),

      setSelectedCountry: (country: CountryCode | null) =>
        set((state) => ({
          mapState: { ...state.mapState, selectedCountry: country },
          // 국가 선택 시 우측 패널 자동 열기
          panelState: {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode: 'region-list',
            },
          },
        })),

      setSelectedCompany: (company: Company | null) =>
        set((state) => ({
          mapState: { ...state.mapState, selectedCompany: company },
          // 기업 선택 시 우측 패널 모드 전환
          panelState: {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode: company ? 'company-detail' : 'region-list',
            },
          },
        })),

      setViewMode: (mode: MapState['viewMode']) =>
        set((state) => ({
          mapState: { ...state.mapState, viewMode: mode },
        })),

      /**
       * 🎯 Navigator 요구사항 #1: 지역 클릭 시 자동 뷰 모드 전환
       * Europe 클릭 → europe_detail로 자동 전환
       */
      zoomToRegion: (region: Region) =>
        set((state) => ({
          mapState: {
            ...state.mapState,
            selectedRegion: region,
            focusedRegion: region,
            // 🚀 자동 뷰 모드 전환 로직
            viewMode: region === 'Europe' ? 'europe_detail' : 'region',
            // 국가 선택 초기화 (새 지역으로 전환 시)
            selectedCountry: null,
            selectedCompany: null,
          },
          // 우측 패널 자동 열기 (국가 리스트 표시)
          panelState: {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode: 'region-list',
            },
          },
        })),

      /**
       * 세계 지도로 복귀
       */
      zoomToWorld: () =>
        set((state) => ({
          mapState: {
            ...state.mapState,
            viewMode: 'world',
            focusedRegion: null,
            selectedRegion: null,
            selectedCountry: null,
            hoveredRegion: null,
            hoveredCountry: null,
          },
        })),

      // ========================================
      // 패널 액션
      // ========================================

      toggleLeftPanel: () =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            leftPanel: {
              ...state.panelState.leftPanel,
              isOpen: !state.panelState.leftPanel.isOpen,
            },
          },
        })),

      toggleRightPanel: () =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            rightPanel: {
              ...state.panelState.rightPanel,
              isOpen: !state.panelState.rightPanel.isOpen,
            },
          },
        })),

      setLeftPanelTab: (tab: 'filters' | 'stats') =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            leftPanel: {
              ...state.panelState.leftPanel,
              activeTab: tab,
            },
          },
        })),

      setRightPanelMode: (mode: PanelState['rightPanel']['mode']) =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            rightPanel: {
              ...state.panelState.rightPanel,
              mode,
            },
          },
        })),

      // ========================================
      // Computed Getters
      // ========================================

      getFilteredCompanies: () => getFilteredCompanies(get()),

      getCompanyCountByCountry: () => getCompanyCountByCountry(get()),

      getCompanyCountByRegion: () => getCompanyCountByRegion(get()),

      getCompaniesByCountry: (countryCode: CountryCode) =>
        getCompaniesByCountry(get(), countryCode),

      getCompaniesByRegion: (region: Region) =>
        getCompaniesByRegion(get(), region),

      getStats: () => getStats(get()),

      // ========================================
      // 초기화
      // ========================================

      reset: () => set(initialState),
    }),
    {
      name: 'ESGMapStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// Selector Hooks (최적화된 리렌더링)
// ============================================

/**
 * 필터링된 기업만 구독 (최적화)
 */
export const useFilteredCompanies = () =>
  useESGMapStore((state) => state.getFilteredCompanies());

/**
 * 국가별 카운트만 구독
 */
export const useCompanyCountByCountry = () =>
  useESGMapStore((state) => state.getCompanyCountByCountry());

/**
 * 지역별 카운트만 구독
 */
export const useCompanyCountByRegion = () =>
  useESGMapStore((state) => state.getCompanyCountByRegion());

/**
 * 통계 데이터만 구독
 */
export const useStats = () => useESGMapStore((state) => state.getStats());

/**
 * 지도 상태만 구독
 */
export const useMapState = () => useESGMapStore((state) => state.mapState);

/**
 * 필터 상태만 구독
 */
export const useFilters = () => useESGMapStore((state) => state.filters);

