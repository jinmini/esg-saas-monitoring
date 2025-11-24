/**
 * ESG Global Map Store (Zustand)
 * 글로벌 ESG SaaS 지도 기능을 위한 전역 상태 관리
 */

import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  FILTER_CATEGORIES, 
  FEATURE_GROUPS, 
  FRAMEWORK_GROUPS 
} from '@/constants/esg-map';
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
  FeatureGroup,
  FrameworkGroup,
  UserPersona,
  AIMaturityLevel,
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
    const relatedTags = filters.categories.flatMap((catId) => {
      const cat = FILTER_CATEGORIES.find((c) => c.id === catId);
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

  // 5. Feature Groups 필터
  if (filters.featureGroups.length > 0) {
    const relatedFeatures = filters.featureGroups.flatMap((groupId) => {
      const group = FEATURE_GROUPS.find((g) => g.id === groupId);
      return group?.relatedFeatures || [];
    });

    filtered = filtered.filter((c) =>
      relatedFeatures.some((f) => c.features.includes(f))
    );
  }

  // 6. Framework Groups 필터
  if (filters.frameworkGroups.length > 0) {
    const relatedFrameworks = filters.frameworkGroups.flatMap((groupId) => {
      const group = FRAMEWORK_GROUPS.find((g) => g.id === groupId);
      return group?.relatedFrameworks || [];
    });

    filtered = filtered.filter((c) =>
      relatedFrameworks.some((fw) => c.frameworks.includes(fw))
    );
  }

  // 7. User Persona 필터 (향후 Company 데이터에 persona 필드 추가 시 활성화)
  // if (filters.personas.length > 0) {
  //   filtered = filtered.filter((c) =>
  //     filters.personas.includes(c.primaryPersona)
  //   );
  // }

  // 8. AI Maturity 필터 (향후 Company 데이터에 aiMaturity 필드 추가 시 활성화)
  // if (filters.aiMaturity) {
  //   filtered = filtered.filter((c) => c.aiMaturity === filters.aiMaturity);
  // }

  // 9. Feature 필터 (직접 선택 - 고급 필터)
  if (filters.features.length > 0) {
    filtered = filtered.filter((c) =>
      filters.features.some((f) => c.features.includes(f))
    );
  }

  // 10. Framework 필터 (직접 선택 - 고급 필터)
  if (filters.frameworks.length > 0) {
    filtered = filtered.filter((c) =>
      filters.frameworks.some((fw) => c.frameworks.includes(fw))
    );
  }

  // 11. 검색 쿼리
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
  setFeatureGroupFilter: (featureGroups: FeatureGroup[]) => void;
  setFrameworkGroupFilter: (frameworkGroups: FrameworkGroup[]) => void;
  setPersonaFilter: (personas: UserPersona[]) => void;
  setAIMaturityFilter: (aiMaturity: AIMaturityLevel | null) => void;
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
  focusCompany: (companyId: string) => void;
  zoomToRegion: (region: Region) => void;
  zoomToWorld: () => void;

  // 패널 액션
  toggleLeftPanel: () => void;
  setLeftPanelTab: (tab: 'filters' | 'stats') => void;
  openRightPanel: (mode: 'list' | 'detail', targetCountry?: CountryCode) => void;
  closeRightPanel: () => void;


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
    featureGroups: [],
    frameworkGroups: [],
    personas: [],
    aiMaturity: null,
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
      mode: 'detail',
      targetCountry: null,
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
      setFeatureGroupFilter: (featureGroups: FeatureGroup[]) =>
        set((state) => ({ filters: { ...state.filters, featureGroups } })),
      setFrameworkGroupFilter: (frameworkGroups: FrameworkGroup[]) =>
        set((state) => ({ filters: { ...state.filters, frameworkGroups } })),
      setPersonaFilter: (personas: UserPersona[]) =>
        set((state) => ({ filters: { ...state.filters, personas } })),
      setAIMaturityFilter: (aiMaturity: AIMaturityLevel | null) =>
        set((state) => ({ filters: { ...state.filters, aiMaturity } })),
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
        })),
      setSelectedCompany: (company: Company | null) =>
        set((state) => ({
          mapState: { 
            ...state.mapState, 
            selectedCompany: company,
            // 선택된 기업의 국가도 함께 선택하여 지도 하이라이트 동기화
            selectedCountry: company ? (company.countryCode as CountryCode) : state.mapState.selectedCountry,
          },
          // 기업 선택 시 자동으로 Detail View로 패널 열기
          panelState: company ? {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode: 'detail',
              // 해당 기업의 국가로 targetCountry를 설정하여 'Back to List' 네비게이션 지원
              targetCountry: company.countryCode as CountryCode,
            },
          } : state.panelState,
        })),

      // 뷰 모드
      setViewMode: (mode: MapState['viewMode']) =>
        set((state) => ({ mapState: { ...state.mapState, viewMode: mode } })),
      
      // 특정 기업 포커스 (검색 자동완성 클릭 시 사용)
      focusCompany: (companyId: string) => {
        const company = get().companies.find(c => c.id === companyId);
        if (!company) return;

        const region = company.region as Region;
        let viewMode: MapState['viewMode'] = 'region';
        
        if (region === 'Europe') viewMode = 'europe_detail';
        else if (region === 'Asia') viewMode = 'asia_detail';
        else if (region === 'Oceania') viewMode = 'oceania_detail';
        else if (region === 'North America') viewMode = 'north_america_detail';

        set((state) => ({
          mapState: {
            ...state.mapState,
            viewMode,
            focusedRegion: region,
            selectedRegion: region,
            selectedCountry: company.countryCode as CountryCode,
            selectedCompany: company,
            hoveredCountry: null,
            hoveredRegion: null,
          },
          // 검색 결과 클릭 시에도 패널을 열고 Back Navigation 지원
          panelState: {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode: 'detail',
              targetCountry: company.countryCode as CountryCode,
            },
          },
        }));
      },

      zoomToRegion: (region: Region) => {
        let viewMode: MapState['viewMode'] = 'region';
        
        // 지역별 상세 뷰 모드 결정
        if (region === 'Europe') {
          viewMode = 'europe_detail';
        } else if (region === 'Asia') {
          viewMode = 'asia_detail';
        } else if (region === 'Oceania') {
          viewMode = 'oceania_detail';
        } else if (region === 'North America') {
          viewMode = 'north_america_detail';
        }

        set((state) => ({
          mapState: {
            ...state.mapState,
            selectedRegion: region,
            focusedRegion: region,
            viewMode,
            selectedCountry: null,
            selectedCompany: null,
          },
        }));
      },
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
      setLeftPanelTab: (tab: 'filters' | 'stats') =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            leftPanel: { ...state.panelState.leftPanel, activeTab: tab },
          },
        })),
      openRightPanel: (mode: 'list' | 'detail', targetCountry?: CountryCode) =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            rightPanel: {
              isOpen: true,
              mode,
              targetCountry: targetCountry || null,
            },
          },
          // detail 모드일 때는 selectedCompany가 이미 설정되어 있다고 가정
          // list 모드일 때는 selectedCompany를 초기화하지 않음 (사용자가 리스트에서 다시 선택할 수 있도록)
        })),
      closeRightPanel: () =>
        set((state) => ({
          panelState: {
            ...state.panelState,
            rightPanel: {
              ...state.panelState.rightPanel,
              isOpen: false,
            },
          },
          mapState: {
            ...state.mapState,
            selectedCompany: null, // 패널 닫으면 선택된 기업 해제
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
