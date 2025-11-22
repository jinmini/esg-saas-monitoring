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
 */
export type CompanyType = 'CORE_ESG_PLATFORM' | 'OPERATIONAL_ESG_ENABLER';

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
 * 지역 분류
 */
export type Region = 'Europe' | 'North America' | 'APAC' | 'South America' | 'Middle East' | 'Africa';

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
  companyTypes: CompanyType[];
  categories: FilterCategory[]; // 목적 기반 필터
  features: string[];
  frameworks: string[];
  searchQuery: string;
}

// ============================================
// Map State 관련 타입
// ============================================

/**
 * 지도 상태
 */
export interface MapState {
  hoveredRegion: Region | null;
  selectedRegion: Region | null;
  selectedCompany: Company | null;
  viewMode: 'world' | 'region'; // 전체 지도 vs 지역 확대
  focusedRegion: Region | null; // 확대된 지역
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
 * 패널 상태
 */
export interface PanelState {
  leftPanel: {
    isOpen: boolean;
    activeTab: 'filters' | 'stats';
  };
  rightPanel: {
    isOpen: boolean;
    mode: 'region-list' | 'company-detail' | 'comparison';
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
  onRegionHover: (region: Region | null) => void;
  onRegionClick: (region: Region) => void;
  onCompanySelect: (company: Company) => void;
  onMarkerClick: (region: Region) => void;
}

