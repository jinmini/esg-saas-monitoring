/**
 * ESG Global Map Types
 * 글로벌 ESG SaaS 지도 기능을 위한 타입 정의
 */

// ============================================
// Company 관련 타입
// ============================================

/**
 * 기업 타입 분류
 * - CORE_ESG_PLATFORM: ESG 관리가 핵심 비즈니스인 전용 플랫폼
 * - OPERATIONAL_ESG_ENABLER: 운영 효율화가 주목적이며, 그 결과로 ESG 효과를 창출
 * - INTEGRATED_*: 기존 엔터프라이즈 플랫폼에 ESG 기능을 통합한 플랫폼
 */
export type CompanyType = 
  | 'CORE_ESG_PLATFORM' 
  | 'OPERATIONAL_ESG_ENABLER'
  | 'INTEGRATED_GRC_ESG_PLATFORM'       // GRC + ESG 통합
  | 'INTEGRATED_EHS_ESG_PLATFORM'       // EHS + ESG 통합
  | 'INTEGRATED_REPORTING_PLATFORM'     // 재무 보고 + ESG 통합
  | 'INTEGRATED_CLOUD_ESG_PLATFORM'     // 클라우드 ERP + ESG 통합
  | 'INTEGRATED_ENTERPRISE_PLATFORM'    // 엔터프라이즈 소프트웨어 + ESG 통합
  | 'INTEGRATED_GRC_PLATFORM'           // GRC 플랫폼 + ESG
  | 'INTEGRATED_TRUST_PLATFORM';        // 신뢰/보안 플랫폼 + ESG

/**
 * 기업 정보 인터페이스
 */
export interface Company {
  id: string;
  name: string;
  nameLocal: string;
  companyType: CompanyType;
  country: string;
  countryCode: string;
  region: string;
  websiteUrl: string;
  description: string;
  descriptionEn: string;
  features: string[];
  frameworks: string[];
  foundedYear: number;
  fundingStage: string;
  employeeCount: string;
  headquarters: string;
  isActive: boolean;
  analysisNotes: string;
  lastVerified: string;
}

/**
 * 기업 타입별 메타 정보
 */
export interface CompanyTypeInfo {
  name: string;
  nameLocal: string;
  description: string;
  descriptionEn: string;
  count: number;
}

// ============================================
// Region 관련 타입
// ============================================

/**
 * 지역 분류 (대륙 레벨)
 */
export type Region = 'Europe' | 'North America' | 'Asia' | 'Oceania' | 'South America' | 'Middle East' | 'Africa';

/**
 * 국가 코드 (ISO 3166-1 alpha-2)
 * 
 * 🌍 현재 데이터 보유 국가:
 * - 유럽 14개국 (GB, DE, FR, NL, SE, FI, NO, CH, BE, ES, IE, EE, PL, DK)
 * - 아시아 2개국 (SG, JP)
 * - 오세아니아 1개국 (AU)
 * - 북미 2개국 (US, CA)
 */
export type CountryCode = 
  // 유럽 (Europe)
  | 'GB' // 🇬🇧 영국 (United Kingdom)
  | 'DE' // 🇩🇪 독일 (Germany)
  | 'FR' // 🇫🇷 프랑스 (France)
  | 'NL' // 🇳🇱 네덜란드 (Netherlands)
  | 'SE' // 🇸🇪 스웨덴 (Sweden)
  | 'FI' // 🇫🇮 핀란드 (Finland)
  | 'NO' // 🇳🇴 노르웨이 (Norway)
  | 'CH' // 🇨🇭 스위스 (Switzerland)
  | 'BE' // 🇧🇪 벨기에 (Belgium)
  | 'ES' // 🇪🇸 스페인 (Spain)
  | 'IE' // 🇮🇪 아일랜드 (Ireland)
  | 'EE' // 🇪🇪 에스토니아 (Estonia)
  | 'PL' // 🇵🇱 폴란드 (Poland)
  | 'DK' // 🇩🇰 덴마크 (Denmark)
  // 아시아 (Asia)
  | 'SG' // 🇸🇬 싱가포르 (Singapore)
  | 'JP' // 🇯🇵 일본 (Japan)
  // 오세아니아 (Oceania)
  | 'AU' // 🇦🇺 호주 (Australia)
  // 북미 (North America)
  | 'US' // 🇺🇸 미국 (United States)
  | 'CA'; // 🇨🇦 캐나다 (Canada)

/**
 * 지역 정보 (지도 상 표시용)
 */
export interface RegionInfo {
  name: Region;
  nameLocal: string;
  count: number;
  isActive: boolean; // 데이터 존재 여부
}

/**
 * 국가 정보 (지도 상 표시용)
 */
export interface CountryInfo {
  code: CountryCode;
  name: string;
  nameLocal: string;
  region: Region;
  count: number;
  emoji: string;
  isActive: boolean;
}

/**
 * SVG 지도 상의 좌표 정보
 */
export interface RegionCoordinates {
  x: number;
  y: number;
  radius: number;
}

// ============================================
// Filter 관련 타입
// ============================================

/**
 * 필터 카테고리 (목적 기반 그룹핑)
 */
export type FilterCategory = 
  | 'compliance'      // 규제 준수
  | 'carbon'          // 탄소 관리
  | 'supply-chain'    // 공급망
  | 'reporting'       // 보고
  | 'risk'            // 리스크 관리
  | 'finance';        // 지속가능금융

/**
 * Feature Group (10~15개 그룹)
 */
export type FeatureGroup = 
  | 'carbon-net-zero'
  | 'esg-reporting'
  | 'regulatory-compliance'
  | 'supply-chain-due-diligence'
  | 'portfolio-finance-investors'
  | 'energy-utilities-operations'
  | 'real-assets-built-environment'
  | 'nature-biodiversity-land'
  | 'social-human-rights'
  | 'ai-data-automation'
  | 'product-lca-circularity'
  | 'sector-specific'
  | 'advisory-services-education'
  | 'green-finance-instruments';

/**
 * Framework Group (7~8개 그룹)
 */
export type FrameworkGroup =
  | 'global-esg-reporting'
  | 'climate-carbon-ghg'
  | 'sustainable-finance'
  | 'supply-chain-hr-dd'
  | 'product-lca-circular'
  | 'real-estate-building'
  | 'sector-theme-specific'
  | 'regional-regulations';

/**
 * User Persona (6~8개)
 */
export type UserPersona =
  | 'sustainability-team'
  | 'cfo-finance-team'
  | 'procurement-supply-chain'
  | 'investors-pe-vc-am'
  | 'real-estate-plant-operations'
  | 'sme-midmarket-startup';

/**
 * AI Maturity Level
 */
export type AIMaturityLevel = 'none' | 'ai-assisted' | 'ai-first-agentic';

/**
 * 필터 카테고리 정보
 */
export interface FilterCategoryInfo {
  id: FilterCategory;
  name: string;
  nameLocal: string;
  icon: string; // 아이콘 클래스 또는 이모지
  relatedFeatures: string[]; // 연관된 Feature 태그들
  relatedFrameworks: string[]; // 연관된 Framework 태그들
}

/**
 * 필터 상태
 */
export interface FilterState {
  regions: Region[];
  countries: CountryCode[]; // 국가별 필터 (유럽 확대 시 활용)
  companyTypes: CompanyType[];
  categories: FilterCategory[]; // 목적 기반 필터 (Quick Filters)
  
  // 새로운 필터 축
  featureGroups: FeatureGroup[]; // Feature 그룹 (10~15개)
  frameworkGroups: FrameworkGroup[]; // Framework 그룹 (7~8개)
  personas: UserPersona[]; // 사용자 페르소나
  aiMaturity: AIMaturityLevel | null; // AI 성숙도
  
  // 기존 디테일 필터 (고급 필터에서 사용)
  features: string[];
  frameworks: string[];
  searchQuery: string;
}

// ============================================
// Map State 관련 타입
// ============================================

/**
 * 지도 뷰 모드
 * - world: 전체 세계 지도 (대륙별 마커 표시)
 * - europe_detail: 유럽 확대 뷰 (국가별 마커 표시)
 * - asia_detail: 아시아 확대 뷰 (국가별 마커 표시)
 * - oceania_detail: 오세아니아 확대 뷰 (국가별 마커 표시)
 * - north_america_detail: 북미 확대 뷰 (국가별 마커 표시)
 * - region: 기타 대륙 확대 뷰 (향후 확장용)
 */
export type MapViewMode = 'world' | 'europe_detail' | 'asia_detail' | 'oceania_detail' | 'north_america_detail' | 'region';

/**
 * 지도 상태
 */
export interface MapState {
  // 호버 상태
  hoveredRegion: Region | null;
  hoveredCountry: CountryCode | null;
  
  // 선택 상태
  selectedRegion: Region | null;
  selectedCountry: CountryCode | null;
  selectedCompany: Company | null;
  
  // 뷰 모드
  viewMode: MapViewMode;
  focusedRegion: Region | null; // 확대된 지역 (Europe, North America 등)
}

/**
 * 지도 뷰포트 설정
 */
export interface MapViewport {
  viewBox: string; // SVG viewBox 값 (예: "0 0 1000 600")
  centerX: number;
  centerY: number;
  scale: number;
}

// ============================================
// Metadata 관련 타입
// ============================================

/**
 * ESG Map 전체 메타데이터
 */
export interface ESGMapMetadata {
  version: string;
  lastUpdated: string;
  totalCompanies: number;
  dataSource: string;
  curator: string;
  regions: Record<Region, number>;
  companyTypes: {
    CORE_ESG_PLATFORM: CompanyTypeInfo;
    OPERATIONAL_ESG_ENABLER: CompanyTypeInfo;
  };
  features: Record<string, string>;
  frameworks: Record<string, string>;
}

/**
 * JSON 파일 전체 구조
 */
export interface ESGMapData {
  metadata: ESGMapMetadata;
  companies: Company[];
}

// ============================================
// UI 관련 타입
// ============================================

/**
 * 패널 모드
 * - list: 국가 내 기업 목록
 * - detail: 특정 기업 상세 정보
 */
export type PanelMode = 'list' | 'detail';

/**
 * 패널 상태
 */
export interface PanelState {
  leftPanel: {
    isOpen: boolean;
    activeTab: 'filters' | 'stats';
  };
  rightPanel: {
    isOpen: boolean;
    mode: PanelMode;
    targetCountry: CountryCode | null; // list 모드에서 사용
  };
}

/**
 * 비교 모드용 타입
 */
export interface ComparisonData {
  companies: Company[];
  compareFields: Array<'features' | 'frameworks' | 'fundingStage' | 'employeeCount'>;
}

/**
 * 통계 데이터
 */
export interface StatsData {
  totalCompanies: number;
  coreCount: number;
  operationalCount: number;
  activeRegions: number;
  topFeatures: Array<{ feature: string; count: number }>;
  topFrameworks: Array<{ framework: string; count: number }>;
}

// ============================================
// Analysis Notes Parsing
// ============================================

/**
 * analysisNotes를 구조화된 데이터로 파싱한 결과
 */
export interface ParsedAnalysisNotes {
  coreStrategy: string; // "핵심 전략:" 이후 텍스트
  keyTags: string[]; // 추출된 주요 키워드
  strongPoints: string[]; // 강점 리스트
  differentiators: string[]; // 차별점
}

// ============================================
// Event 관련 타입
// ============================================

/**
 * 지도 이벤트 핸들러 타입
 */
export interface MapEventHandlers {
  // 대륙 레벨 이벤트
  onRegionHover: (region: Region | null) => void;
  onRegionClick: (region: Region) => void;
  
  // 국가 레벨 이벤트 (유럽 확대 뷰)
  onCountryHover: (country: CountryCode | null) => void;
  onCountryClick: (country: CountryCode) => void;
  
  // 기업 선택
  onCompanySelect: (company: Company) => void;
}

