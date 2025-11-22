/**
 * ESG Global Map Store (Zustand)
 * 글로벌 ESG SaaS 지도 기능을 위한 전역 상태 관리
 */

import { useMemo } from 'react';
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
// Helper Functions (순수 함수)
// ============================================

/**
 * 필터링 로직 (순수 함수)
 */
const calculateFilteredCompanies = (companies: Company[], filters: FilterState): Company[] => {
  let filtered = companies;

  // 1. Region 필터
  if (filters.regions.length > 0) {
    filtered = filtered.filter((c) =>
      filters.regions.includes(c.region as Region)
    );
  }

  // 2. Country 필터
  if (filters.countries.length > 0) {
    filtered = filtered.filter((c) =>
      filters.countries.includes(c.countryCode as CountryCode)
    );
  }

  // 3. Company Type 필터
  if (filters.companyTypes.length > 0) {
    filtered = filtered.filter((c) =>
      filters.companyTypes.includes(c.companyType)
    );
  }

  // 4. Category 필터 (Features + Frameworks 매핑)
  if (filters.categories.length > 0) {
    const { FILTER_CATEGORIES } = require('@/constants/esg-map');
    const relatedTags = filters.categories.flatMap((catId) => {
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
  if (filters.features.length > 0) {
    filtered = filtered.filter((c) =>
      filters.features.some((f) => c.features.includes(f))
    );
  }

  // 6. Framework 필터 (직접 선택)
  if (filters.frameworks.length > 0) {
    filtered = filtered.filter((c) =>
      filters.frameworks.some((fw) => c.frameworks.includes(fw))
    );
  }

  // 7. 검색 쿼리
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
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
 * 국가별 기업 카운트 계산
 */
const calculateCompanyCountByCountry = (
  filteredCompanies: Company[]
): Record<CountryCode, number> => {
  const countMap: Partial<Record<CountryCode, number>> = {};

  filteredCompanies.forEach((company) => {
    const code = company.countryCode as CountryCode;
    countMap[code] = (countMap[code] || 0) + 1;
  });

  return countMap as Record<CountryCode, number>;
};

/**
 * 지역별 기업 카운트 계산
 */
const calculateCompanyCountByRegion = (
  filteredCompanies: Company[]
): Record<Region, number> => {
  const countMap: Partial<Record<Region, number>> = {};

  filteredCompanies.forEach((company) => {
    const region = company.region as Region;
    countMap[region] = (countMap[region] || 0) + 1;
  });

  return countMap as Record<Region, number>;
};

/**
 * 통계 데이터 계산
 */
const calculateStats = (filteredCompanies: Company[]): StatsData => {
  // Company Type 카운트
  const coreCount = filteredCompanies.filter(
    (c) => c.companyType === 'CORE_ESG_PLATFORM'
  ).length;
  const operationalCount = filteredCompanies.filter(
    (c) => c.companyType === 'OPERATIONAL_ESG_ENABLER'
  ).length;

  // 활성 지역 수
  const activeRegions = new Set(filteredCompanies.map((c) => c.region)).size;

  // Top Features
  const featureCounts: Record<string, number> = {};
  filteredCompanies.forEach((c) => {
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
  filteredCompanies.forEach((c) => {
    c.frameworks.forEach((fw) => {
      frameworkCounts[fw] = (frameworkCounts[fw] || 0) + 1;
    });
  });
  const topFrameworks = Object.entries(frameworkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([framework, count]) => ({ framework, count }));

  return {
    totalCompanies: filteredCompanies.length,
    coreCount,
    operationalCount,
    activeRegions,
    topFeatures,
    topFrameworks,
  };
};

// ============================================
// State 인터페이스
// ============================================

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
  
  // 뷰 모드 전환
  setViewMode: (mode: MapState['viewMode']) => void;
  zoomToRegion: (region: Region) => void;
  zoomToWorld: () => void;

  // 패널 액션
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: 'filters' | 'stats') => void;
  setRightPanelMode: (mode: PanelState['rightPanel']['mode']) => void;

  // 초기화
  reset: () => void;
}

// ============================================
// Store 타입 & Initial State
// ============================================

type ESGMapStore = ESGMapState & ESGMapActions & {
  // Helper Methods (for direct usage)
  getFilteredCompanies: () => Company[];
  getCompaniesByCountry: (countryCode: CountryCode) => Company[];
  getCompaniesByRegion: (region: Region) => Company[];
};

const initialState: ESGMapState = {
  companies: [],
  metadata: null,
  isLoading: false,
  error: null,
  filters: {
    regions: [],
    countries: [],
    companyTypes: [],
    categories: [],
    features: [],
    frameworks: [],
    searchQuery: '',
  },
  mapState: {
    hoveredRegion: null,
    hoveredCountry: null,
    selectedRegion: null,
    selectedCountry: null,
    selectedCompany: null,
    viewMode: 'world',
    focusedRegion: null,
  },
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

      // 데이터 로딩
      setCompanies: (data: ESGMapData) =>
        set({
          companies: data.companies,
          metadata: data.metadata,
          isLoading: false,
          error: null,
        }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // 필터 액션
      setRegionFilter: (regions: Region[]) =>
        set((state) => ({ filters: { ...state.filters, regions } })),
      setCountryFilter: (countries: CountryCode[]) =>
        set((state) => ({ filters: { ...state.filters, countries } })),
      setCompanyTypeFilter: (types: CompanyType[]) =>
        set((state) => ({ filters: { ...state.filters, companyTypes: types } })),
      setCategoryFilter: (categories: FilterCategory[]) =>
        set((state) => ({ filters: { ...state.filters, categories } })),
      setFeatureFilter: (features: string[]) =>
        set((state) => ({ filters: { ...state.filters, features } })),
      setFrameworkFilter: (frameworks: string[]) =>
        set((state) => ({ filters: { ...state.filters, frameworks } })),
      setSearchQuery: (query: string) =>
        set((state) => ({ filters: { ...state.filters, searchQuery: query } })),
      resetFilters: () => set({ filters: initialState.filters }),

      // 지도 액션
      setHoveredRegion: (region: Region | null) =>
        set((state) => ({ mapState: { ...state.mapState, hoveredRegion: region } })),
      setHoveredCountry: (country: CountryCode | null) =>
        set((state) => ({ mapState: { ...state.mapState, hoveredCountry: country } })),
      setSelectedRegion: (region: Region | null) =>
        set((state) => ({ mapState: { ...state.mapState, selectedRegion: region } })),
      setSelectedCountry: (country: CountryCode | null) =>
        set((state) => ({
          mapState: { ...state.mapState, selectedCountry: country },
          panelState: {
            ...state.panelState,
            rightPanel: { isOpen: true, mode: 'region-list' },
          },
        })),
      setSelectedCompany: (company: Company | null) =>
        set((state) => ({
          mapState: { ...state.mapState, selectedCompany: company },
          panelState: {
            ...state.panelState,
            rightPanel: { isOpen: true, mode: company ? 'company-detail' : 'region-list' },
          },
        })),

      // 뷰 모드
      setViewMode: (mode: MapState['viewMode']) =>
        set((state) => ({ mapState: { ...state.mapState, viewMode: mode } })),
      zoomToRegion: (region: Region) =>
        set((state) => ({
          mapState: {
            ...state.mapState,
            selectedRegion: region,
            focusedRegion: region,
            viewMode: region === 'Europe' ? 'europe_detail' : 'region',
            selectedCountry: null,
            selectedCompany: null,
          },
          panelState: {
            ...state.panelState,
            rightPanel: { isOpen: true, mode: 'region-list' },
          },
        })),
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

      // 패널 액션
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
            leftPanel: { ...state.panelState.leftPanel, activeTab: tab },
          },
        })),
      setRightPanelMode: (mode: PanelState['rightPanel']['mode']) =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            rightPanel: { ...state.panelState.rightPanel, mode },
          },
        })),

      // 초기화
      reset: () => set(initialState),

      // Direct Helper
      getFilteredCompanies: () => calculateFilteredCompanies(get().companies, get().filters),
      getCompaniesByCountry: (countryCode: CountryCode) => {
        const filtered = calculateFilteredCompanies(get().companies, get().filters);
        return filtered.filter((c) => c.countryCode === countryCode);
      },
      getCompaniesByRegion: (region: Region) => {
        const filtered = calculateFilteredCompanies(get().companies, get().filters);
        return filtered.filter((c) => c.region === region);
      },
    }),
    {
      name: 'ESGMapStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// Selector Hooks (useMemo로 최적화)
// ============================================

/**
 * 필터링된 기업만 구독
 */
export const useFilteredCompanies = () => {
  const companies = useESGMapStore((state) => state.companies);
  const filters = useESGMapStore((state) => state.filters);

  return useMemo(
    () => calculateFilteredCompanies(companies, filters),
    [companies, filters]
  );
};

/**
 * 국가별 카운트만 구독
 */
export const useCompanyCountByCountry = () => {
  const filteredCompanies = useFilteredCompanies();

  return useMemo(
    () => calculateCompanyCountByCountry(filteredCompanies),
    [filteredCompanies]
  );
};

/**
 * 지역별 카운트만 구독
 */
export const useCompanyCountByRegion = () => {
  const filteredCompanies = useFilteredCompanies();

  return useMemo(
    () => calculateCompanyCountByRegion(filteredCompanies),
    [filteredCompanies]
  );
};

/**
 * 통계 데이터만 구독
 */
export const useStats = () => {
  const filteredCompanies = useFilteredCompanies();

  return useMemo(() => calculateStats(filteredCompanies), [filteredCompanies]);
};

/**
 * 지도 상태만 구독
 */
export const useMapState = () => useESGMapStore((state) => state.mapState);

/**
 * 필터 상태만 구독
 */
export const useFilters = () => useESGMapStore((state) => state.filters);
