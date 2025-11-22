/**
 * ESG Global Map Constants
 * 글로벌 ESG SaaS 지도 기능을 위한 상수 정의
 */

import type { 
  Region, 
  RegionCoordinates, 
  FilterCategoryInfo, 
  MapViewport 
} from '@/types/esg-map';

// ============================================
// 지도 좌표 (SVG 기준)
// ============================================

/**
 * SVG 지도 상의 지역별 좌표
 * 
 * 🌍 유럽 중심 설계:
 * - 현재 데이터가 유럽(53개)에 집중되어 있으므로
 * - 유럽을 지도의 중심부에 배치
 * - 다른 대륙은 상대적으로 외곽 배치
 * 
 * 📐 좌표 시스템:
 * - viewBox: "0 0 1000 600" 기준
 * - x: 0(왼쪽) ~ 1000(오른쪽)
 * - y: 0(위) ~ 600(아래)
 */
export const REGION_COORDS: Record<Region, RegionCoordinates> = {
  // 유럽 - 중심부
  'Europe': { 
    x: 500, 
    y: 250, 
    radius: 100 // 데이터가 많으므로 큰 반경
  },
  
  // 북미 - 좌측
  'North America': { 
    x: 200, 
    y: 200, 
    radius: 70 
  },
  
  // 아시아-태평양 - 우측
  'APAC': { 
    x: 780, 
    y: 300, 
    radius: 90 
  },
  
  // 남미 - 좌하단
  'South America': { 
    x: 280, 
    y: 450, 
    radius: 50 
  },
  
  // 중동 - 중하단
  'Middle East': { 
    x: 580, 
    y: 350, 
    radius: 50 
  },
  
  // 아프리카 - 중하단
  'Africa': { 
    x: 500, 
    y: 400, 
    radius: 60 
  },
};

// ============================================
// 지도 뷰포트 설정
// ============================================

/**
 * 전체 세계 지도 뷰포트
 */
export const WORLD_VIEWPORT: MapViewport = {
  viewBox: '0 0 1000 600',
  centerX: 500,
  centerY: 300,
  scale: 1,
};

/**
 * 유럽 확대 뷰포트
 */
export const EUROPE_VIEWPORT: MapViewport = {
  viewBox: '300 100 400 300', // 유럽 지역만 확대
  centerX: 500,
  centerY: 250,
  scale: 1.5,
};

// ============================================
// 색상 테마
// ============================================

/**
 * 색상 상수
 * 
 * 🎨 색상 전략:
 * - CORE_PLATFORM: 초록색 (#10b981, green-500) - "성장, 지속가능성"
 * - OPERATIONAL_ENABLER: 파란색 (#3b82f6, blue-500) - "효율성, 기술"
 */
export const COLORS = {
  // Company Type 색상
  CORE_PLATFORM: '#10b981',           // Tailwind green-500
  CORE_PLATFORM_LIGHT: '#d1fae5',     // Tailwind green-100
  CORE_PLATFORM_DARK: '#065f46',      // Tailwind green-900
  
  OPERATIONAL_ENABLER: '#3b82f6',     // Tailwind blue-500
  OPERATIONAL_ENABLER_LIGHT: '#dbeafe', // Tailwind blue-100
  OPERATIONAL_ENABLER_DARK: '#1e3a8a', // Tailwind blue-900
  
  // Glow Effect
  GLOW_CORE: 'rgba(16, 185, 129, 0.6)',      // CORE 기본 glow
  GLOW_CORE_HOVER: 'rgba(16, 185, 129, 0.9)', // CORE hover glow
  GLOW_OPERATIONAL: 'rgba(59, 130, 246, 0.6)', // OPERATIONAL 기본 glow
  GLOW_OPERATIONAL_HOVER: 'rgba(59, 130, 246, 0.9)', // OPERATIONAL hover glow
  
  // 지도 배경
  MAP_LAND: '#1e293b',      // Tailwind slate-800
  MAP_LAND_HOVER: '#334155', // Tailwind slate-700
  MAP_OCEAN: '#0f172a',     // Tailwind slate-900
  MAP_BORDER: '#475569',    // Tailwind slate-600
  
  // UI 요소
  TEXT_PRIMARY: '#f1f5f9',   // Tailwind slate-100
  TEXT_SECONDARY: '#cbd5e1', // Tailwind slate-300
  TEXT_MUTED: '#64748b',     // Tailwind slate-500
  
  BACKGROUND_DARK: '#0f172a', // Tailwind slate-900
  BACKGROUND_CARD: '#1e293b', // Tailwind slate-800
  
  ACCENT: '#f59e0b',         // Tailwind amber-500 (강조용)
} as const;

// ============================================
// 필터 카테고리 (목적 기반)
// ============================================

/**
 * 필터 카테고리 정의
 * 
 * 🎯 사용자 니즈 중심 설계:
 * - 기술 용어(CARBON_ACCOUNTING_SCOPE3)가 아닌
 * - 사용자 목적('탄소 관리')을 기준으로 그룹핑
 */
export const FILTER_CATEGORIES: FilterCategoryInfo[] = [
  {
    id: 'compliance',
    name: 'Compliance',
    nameLocal: '규제 준수',
    icon: '📋',
    relatedFeatures: [
      'COMPLIANCE_AUTOMATION',
      'REGULATORY_MONITORING',
      'ESG_REPORTING',
      'SUSTAINABILITY_REPORTING_CSRD',
      'DOUBLE_MATERIALITY',
      'GAP_ASSESSMENT',
      'EU_TAXONOMY_COMPLIANCE',
      'SUSTAINABLE_FINANCE_SFDR',
    ],
    relatedFrameworks: [
      'CSRD',
      'ESRS',
      'SFDR',
      'EU_TAXONOMY',
      'EUDR',
      'CSDDD',
      'LkSG',
      'CBAM',
      'GRI',
      'TCFD',
      'ISSB',
    ],
  },
  {
    id: 'carbon',
    name: 'Carbon Management',
    nameLocal: '탄소 관리',
    icon: '🌱',
    relatedFeatures: [
      'CARBON_ACCOUNTING',
      'CARBON_ACCOUNTING_SCOPE3',
      'CORPORATE_CARBON_FOOTPRINT',
      'PRODUCT_CARBON_FOOTPRINT',
      'DECARBONISATION',
      'DECARBONISATION_PLANNING',
      'CARBON_REDUCTION',
      'TARGET_SETTING',
      'EMISSIONS_FORECASTING',
    ],
    relatedFrameworks: [
      'GHG_PROTOCOL',
      'SBTi',
      'CDP',
      'ISO_14064',
      'ISO_14067',
    ],
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    nameLocal: '공급망 관리',
    icon: '🔗',
    relatedFeatures: [
      'SUPPLY_CHAIN',
      'SUPPLY_CHAIN_TRACEABILITY',
      'SUPPLY_CHAIN_DUE_DILIGENCE',
      'SUPPLY_CHAIN_DECARBONISATION',
      'SUPPLIER_ENGAGEMENT',
      'SUPPLIER_DATA_AGGREGATION',
      'SUPPLIER_LIFECYCLE_MANAGEMENT',
      'SUPPLIER_RISK_MONITORING',
    ],
    relatedFrameworks: [
      'CSDDD',
      'LkSG',
      'EUDR',
      'MODERN_SLAVERY_ACT',
    ],
  },
  {
    id: 'reporting',
    name: 'Reporting & Disclosure',
    nameLocal: '보고 및 공시',
    icon: '📊',
    relatedFeatures: [
      'REPORT_AUTOMATION',
      'ESG_REPORTING',
      'SUSTAINABILITY_REPORTING',
      'ESG_QUESTIONNAIRE_AUTOMATION',
      'PROOF_MANAGEMENT',
      'DISCLOSURE_MANAGEMENT',
    ],
    relatedFrameworks: [
      'GRI',
      'SASB',
      'TCFD',
      'ISSB',
      'CSRD',
      'ESRS',
    ],
  },
  {
    id: 'risk',
    name: 'Risk & Analytics',
    nameLocal: '리스크 관리',
    icon: '⚠️',
    relatedFeatures: [
      'RISK_ANALYTICS',
      'RISK_MANAGEMENT',
      'MATERIALITY_ANALYSIS',
      'DOUBLE_MATERIALITY',
      'AI_ANALYTICS',
      'CLIMATE_RISK_ASSESSMENT',
    ],
    relatedFrameworks: [
      'TCFD',
      'TNFD',
      'CSRD',
    ],
  },
  {
    id: 'finance',
    name: 'Sustainable Finance',
    nameLocal: '지속가능금융',
    icon: '💰',
    relatedFeatures: [
      'FINANCIAL_ESG_INTEGRATION',
      'SUSTAINABLE_FINANCE',
      'PORTFOLIO_ESG_MANAGEMENT',
      'FINANCED_EMISSIONS',
      'EU_TAXONOMY_COMPLIANCE',
      'SUSTAINABLE_FINANCE_SFDR',
      'CLIMATE_FINANCE',
    ],
    relatedFrameworks: [
      'SFDR',
      'EU_TAXONOMY',
      'PCAF',
      'EDCI',
    ],
  },
];

// ============================================
// Quick Filter Chips (인기 필터)
// ============================================

/**
 * 상단 Quick Filter로 노출할 인기 태그
 * 
 * 💡 사용자가 자주 찾는 키워드 기준
 */
export const QUICK_FILTERS = {
  frameworks: ['CSRD', 'SFDR', 'SBTi', 'GHG_PROTOCOL', 'EU_TAXONOMY', 'CDP'],
  features: ['CARBON_ACCOUNTING_SCOPE3', 'SUPPLIER_ENGAGEMENT', 'AI_ANALYTICS', 'DECARBONISATION'],
};

// ============================================
// 지역별 메타 정보
// ============================================

/**
 * 지역별 기본 정보
 */
export const REGION_INFO: Record<Region, { nameLocal: string; emoji: string }> = {
  'Europe': { nameLocal: '유럽', emoji: '🇪🇺' },
  'North America': { nameLocal: '북미', emoji: '🇺🇸' },
  'APAC': { nameLocal: '아시아-태평양', emoji: '🌏' },
  'South America': { nameLocal: '남미', emoji: '🇧🇷' },
  'Middle East': { nameLocal: '중동', emoji: '🇦🇪' },
  'Africa': { nameLocal: '아프리카', emoji: '🌍' },
};

// ============================================
// 애니메이션 설정
// ============================================

/**
 * 애니메이션 duration (ms)
 */
export const ANIMATION = {
  GLOW_PULSE: 2000,      // Glow 펄스 애니메이션
  HOVER_TRANSITION: 200, // Hover 전환
  PANEL_SLIDE: 300,      // 패널 슬라이드
  MAP_ZOOM: 600,         // 지도 줌 전환
} as const;

// ============================================
// UI 레이아웃 상수
// ============================================

/**
 * 패널 크기
 */
export const PANEL_WIDTH = {
  LEFT: 384,  // 24rem (w-96)
  RIGHT: 448, // 28rem (w-112)
} as const;

/**
 * Z-Index 레이어
 */
export const Z_INDEX = {
  MAP_BASE: 1,
  MAP_MARKERS: 10,
  TOOLTIP: 50,
  PANEL: 100,
  MODAL: 1000,
} as const;

// ============================================
// Data 로딩 설정
// ============================================

/**
 * JSON 데이터 경로
 */
export const DATA_PATH = '/data/esg_companies_global.json';

/**
 * 캐시 설정
 */
export const CACHE_KEY = {
  COMPANIES: 'esg-companies',
  METADATA: 'esg-metadata',
} as const;

