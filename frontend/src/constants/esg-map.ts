/**
 * ESG Global Map Constants
 * 글로벌 ESG SaaS 지도 기능을 위한 상수 정의
 */

import type { 
  Region, 
  CountryCode,
  RegionCoordinates, 
  FilterCategoryInfo, 
  MapViewport 
} from '@/types/esg-map';

// ============================================
// 지도 좌표 (SVG 기준)
// ============================================

/**
 * SVG 지도 상의 지역별 좌표
 */
export const REGION_COORDS: Record<Region, RegionCoordinates> = {
  // 유럽 - 크기 축소 (120 -> 80)
  'Europe': { 
    x: 1025, 
    y: 200, 
    radius: 80 // 지형 가림 방지
  },
  'North America': { x: 400, y: 300, radius: 60 },
  'Asia': { x: 1550, y: 350, radius: 70 },
  'Oceania': { x: 1680, y: 650, radius: 60 },
  'South America': { x: 650, y: 700, radius: 60 },
  'Middle East': { x: 1300, y: 380, radius: 50 },
  'Africa': { x: 1100, y: 550, radius: 70 },
};

/**
 * 유럽 내 국가별 좌표 (Europe Detail View용)
 * 
 * 📍 좌표 수정 (2025-11-22):
 * - 마커 겹침 방지를 위해 인위적으로 분산 (Offset 적용)
 * - 지리적 정확성보다는 "시각적 명확성" 우선
 */
export const EUROPE_HUBS: Record<string, RegionCoordinates> = {
  // 🇬🇧 영국: 좌측 상단으로 이동 (본토와 분리)
  'GB': { x: 940, y: 140, radius: 35 },
  
  // 🇮🇪 아일랜드: 영국 좌측 하단
  'IE': { x: 910, y: 160, radius: 20 },
  
  // 🇫🇷 프랑스: 하단으로 이동
  'FR': { x: 990, y: 230, radius: 30 },
  
  // 🇪🇸 스페인: 좌측 하단으로 이동
  'ES': { x: 950, y: 280, radius: 25 },
  
  // 🇩🇪 독일: 우측으로 이동 (중심)
  'DE': { x: 1070, y: 190, radius: 32 },
  
  // 🇳🇱 네덜란드: 해안가 쪽으로 이동
  'NL': { x: 1015, y: 155, radius: 24 },
  
  // 🇧🇪 벨기에: 네덜란드-프랑스 사이 (좌표 보정)
  'BE': { x: 1005, y: 180, radius: 20 },
  
  // 🇨🇭 스위스: 알프스 산맥 쪽 (좌표 보정)
  'CH': { x: 1055, y: 225, radius: 18 },
  
  // 🇩🇰 덴마크: 독일 위쪽 반도
  'DK': { x: 1050, y: 120, radius: 18 },
  
  // 🇳🇴 노르웨이: 좌측 상단 스칸디나비아
  'NO': { x: 1040, y: 80, radius: 20 },
  
  // 🇸🇪 스웨덴: 노르웨이 우측
  'SE': { x: 1090, y: 90, radius: 24 },
  
  // 🇫🇮 핀란드: 최우측 상단
  'FI': { x: 1140, y: 80, radius: 20 },
  
  // 🇵🇱 폴란드: 독일 우측 (좌표 보정)
  'PL': { x: 1140, y: 180, radius: 20 },
  
  // 🇪🇪 에스토니아: 발트해 연안
  'EE': { x: 1140, y: 130, radius: 18 },
};

/**
 * 아시아 국가별 좌표 (Asia Region View용)
 * 
 * 📍 좌표 기준 (2025-11-23):
 * - viewBox 2000x857 기준
 * - 싱가포르, 일본
 */
export const ASIA_HUBS: Record<string, RegionCoordinates> = {
  // 🇸🇬 싱가포르: 말레이 반도 끝자락 (미세 보정)
  'SG': { x: 1480, y: 515, radius: 25 },
  
  // 🇯🇵 일본: 도쿄 (미세 보정)
  'JP': { x: 1760, y: 310, radius: 30 },
};

/**
 * 오세아니아 국가별 좌표 (Oceania Region View용)
 * 
 * 📍 좌표 기준 (2025-11-23):
 * - viewBox 2000x857 기준
 * - 호주
 */
export const OCEANIA_HUBS: Record<string, RegionCoordinates> = {
  // 🇦🇺 호주: 시드니/멜버른 쪽으로 (우측 하단)
  'AU': { x: 1700, y: 700, radius: 30 },
};

/**
 * 북미 국가별 좌표 (North America Region View용)
 * 
 * 📍 좌표 기준 (2025-11-24):
 * - viewBox 2000x857 기준
 * - 미국, 캐나다
 */
export const NORTH_AMERICA_HUBS: Record<string, RegionCoordinates> = {
  // 🇺🇸 미국: 뉴욕/동부 해안 기준 (우측으로 이동)
  'US': { x: 550, y: 350, radius: 35 },
  
  // 🇨🇦 캐나다: 토론토/몬트리올 기준 (우측 하단으로 이동)
  'CA': { x: 550, y: 250, radius: 25 },
};

/**
 * 중동 국가별 좌표 (Middle East Region View용)
 * 
 * 📍 좌표 기준 (2025-11-28):
 * - viewBox 2000x857 기준
 * - UAE, Saudi Arabia, Israel
 */
export const MIDDLE_EAST_HUBS: Record<string, RegionCoordinates> = {
  // 🇦🇪 아랍에미리트: 두바이/아부다비 (중동 금융 허브)
  'AE': { x: 1280, y: 400, radius: 25 },
  
  // 🇸🇦 사우디아라비아: 리야드 (중동 최대 경제)
  'SA': { x: 1240, y: 410, radius: 30 },
  
  // 🇮🇱 이스라엘: 텔아비브 (ESG Tech 혁신 중심)
  'IL': { x: 1200, y: 360, radius: 22 },
};

/**
 * 남미 국가별 좌표 (South America / LatAm Region View용)
 * 
 * 📍 좌표 기준 (2025-11-28):
 * - viewBox 2000x857 기준
 * - Brazil, Chile, Argentina, Colombia, Costa Rica (LatAm)
 */
export const SOUTH_AMERICA_HUBS: Record<string, RegionCoordinates> = {
  // 🇧🇷 브라질: 상파울루 (남미 최대 경제/ESG 시장)
  'BR': { x: 680, y: 680, radius: 35 },
  
  // 🇨🇱 칠레: 산티아고 (재생에너지 선도국)
  'CL': { x: 600, y: 750, radius: 22 },
  
  // 🇦🇷 아르헨티나: 부에노스아이레스 (농업/환경 중요)
  'AR': { x: 640, y: 770, radius: 25 },
  
  // 🇨🇴 콜롬비아: 보고타 (생물다양성 핫스팟)
  'CO': { x: 590, y: 560, radius: 20 },
  
  // 🇨🇷 코스타리카: 산호세 (중앙아메리카, LatAm 맥락상 남미 클러스터 포함)
  'CR': { x: 575, y: 530, radius: 18 },
};

/**
 * Region Hub Map
 * viewMode별로 표시할 Country Hubs 매핑
 * 
 * Configuration-Driven Rendering을 위한 중앙 집중식 설정
 * - 'world': null (Region 마커만 표시)
 * - 'XXX_detail': 해당 지역의 Country Hubs
 * 
 * @see RegionGlowLayer.tsx - 이 맵을 사용하여 조건부 렌더링
 */
export const REGION_HUB_MAP: Record<string, Record<string, RegionCoordinates> | null> = {
  'world': null,
  'europe_detail': EUROPE_HUBS,
  'asia_detail': ASIA_HUBS,
  'oceania_detail': OCEANIA_HUBS,
  'north_america_detail': NORTH_AMERICA_HUBS,
  'middle_east_detail': MIDDLE_EAST_HUBS,
  'south_america_detail': SOUTH_AMERICA_HUBS,
  'region': null, // Fallback for undefined regions
};

// ============================================
// 지도 뷰포트 (BBox) 설정
// ============================================

/**
 * Region Bounding Boxes (Logical Area of Interest)
 * Dynamic Fit-Bounds 계산을 위한 각 지역별 관심 영역 정의
 */
export const REGION_BBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  'world': { x: 0, y: 0, w: 2000, h: 857 },
  'europe_detail': { x: 880, y: 50, w: 300, h: 260 },
  'asia_detail': { x: 1450, y: 250, w: 350, h: 280 },
  'oceania_detail': { x: 1520, y: 550, w: 260, h: 200 },
  // 🇺🇸 북미 특별 보정: 알래스카/하와이 제외, 본토(Mainland)와 캐나다 남부 집중
  'north_america_detail': { x: 380, y: 150, w: 350, h: 300 },
  // 🇦🇪 중동: UAE, 사우디, 이스라엘 포함 (페르시아만~지중해)
  'middle_east_detail': { x: 1150, y: 320, w: 200, h: 140 },
  // 🇧🇷 남미: 브라질, 칠레, 아르헨티나, 콜롬비아 커버
  'south_america_detail': { x: 550, y: 520, w: 200, h: 300 },
};

export const WORLD_VIEWPORT: MapViewport = {
  viewBox: '0 0 2000 857',
  centerX: 1000,
  centerY: 428,
  scale: 1,
};

/**
 * 유럽 확대 뷰포트
 * 
 * 변경사항:
 * - 마커 분산에 따라 뷰포트 확장
 * - x: 900~1160, y: 60~300 커버
 */
export const EUROPE_VIEWPORT: MapViewport = {
  viewBox: '880 50 300 260', // 더 넓게 잡음
  centerX: 1030,
  centerY: 180,
  scale: 2.5,
};

/**
 * 아시아 확대 뷰포트
 * 
 * 커버 범위:
 * - 싱가포르 (1520, 480)
 * - 일본 (1730, 320)
 */
export const ASIA_VIEWPORT: MapViewport = {
  viewBox: '1450 250 350 280', // x: 1450~1800, y: 250~530
  centerX: 1625,
  centerY: 400,
  scale: 2.0,
};

/**
 * 오세아니아 확대 뷰포트
 * 
 * 커버 범위:
 * - 호주 (1650, 650)
 */
export const OCEANIA_VIEWPORT: MapViewport = {
  viewBox: '1520 550 260 200', // x: 1520~1780, y: 550~750
  centerX: 1650,
  centerY: 650,
  scale: 2.5,
};

/**
 * 북미 확대 뷰포트
 * 
 * 커버 범위:
 * - 캐나다 (300, 250)
 */
export const NORTH_AMERICA_VIEWPORT: MapViewport = {
  viewBox: '170 150 260 200', // x: 170~430, y: 150~350
  centerX: 300,
  centerY: 250,
  scale: 2.5,
};

// ============================================
// 색상 테마
// ============================================

export const COLORS = {
  CORE_PLATFORM: '#10b981',           // Green
  CORE_PLATFORM_LIGHT: '#d1fae5',
  CORE_PLATFORM_DARK: '#065f46',
  
  OPERATIONAL_ENABLER: '#3b82f6',     // Blue
  OPERATIONAL_ENABLER_LIGHT: '#dbeafe',
  OPERATIONAL_ENABLER_DARK: '#1e3a8a',
  
  // Glow Effect
  GLOW_CORE: 'rgba(16, 185, 129, 0.4)',      // 투명도 높임 (0.6 -> 0.4)
  GLOW_CORE_HOVER: 'rgba(16, 185, 129, 0.8)',
  GLOW_OPERATIONAL: 'rgba(59, 130, 246, 0.4)',
  GLOW_OPERATIONAL_HOVER: 'rgba(59, 130, 246, 0.8)',
  
  // 지도 배경
  MAP_LAND: '#334155',      // 밝게 수정 (slate-700) - path가 보이도록
  MAP_LAND_HOVER: '#475569', // slate-600
  MAP_OCEAN: '#0f172a',     // slate-900
  MAP_BORDER: '#64748b',    // slate-500 (테두리 강화)
  
  // UI 요소
  TEXT_PRIMARY: '#f8fafc',   // slate-50
  TEXT_SECONDARY: '#cbd5e1', // slate-300
  TEXT_MUTED: '#94a3b8',     // slate-400
  
  BACKGROUND_DARK: '#0f172a',
  BACKGROUND_CARD: '#1e293b',
  
  ACCENT: '#f59e0b',         // Amber
} as const;

// ============================================
// 필터 카테고리 (목적 기반)
// ============================================

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

export const QUICK_FILTERS = {
  frameworks: ['CSRD', 'SFDR', 'SBTi', 'GHG_PROTOCOL', 'EU_TAXONOMY', 'CDP'],
  features: ['CARBON_ACCOUNTING_SCOPE3', 'SUPPLIER_ENGAGEMENT', 'AI_ANALYTICS', 'DECARBONISATION'],
};

// ============================================
// Feature Groups (10~15개 그룹)
// ============================================

export interface FeatureGroupInfo {
  id: string;
  name: string;
  nameLocal: string;
  icon: string;
  description: string;
  relatedFeatures: string[]; // 매핑된 Feature 태그들
}

export const FEATURE_GROUPS: FeatureGroupInfo[] = [
  {
    id: 'carbon-net-zero',
    name: 'Carbon & Net Zero',
    nameLocal: '탄소 & Net Zero',
    icon: '🌱',
    description: 'Carbon accounting, Scope 3, Net Zero strategy, Decarbonisation planning',
    relatedFeatures: [
      'CARBON_ACCOUNTING',
      'CARBON_ACCOUNTING_SCOPE3',
      'CORPORATE_CARBON_FOOTPRINT',
      'PRODUCT_CARBON_FOOTPRINT',
      'SCOPE3_CARBON_MANAGEMENT',
      'TARGET_SETTING',
      'DECARBONISATION',
      'DECARBONISATION_PLANNING',
      'EMISSIONS_FORECASTING',
    ],
  },
  {
    id: 'esg-reporting',
    name: 'ESG Reporting & Disclosure',
    nameLocal: 'ESG 보고 & 공시',
    icon: '📊',
    description: 'Automated ESG reporting, CSRD/ISSB disclosure, Report automation',
    relatedFeatures: [
      'ESG_REPORTING',
      'SUSTAINABILITY_REPORTING',
      'SUSTAINABILITY_REPORTING_CSRD',
      'ISSB_REPORTING',
      'CLIMATE_DISCLOSURE',
      'REPORT_AUTOMATION',
      'DISCLOSURE_MANAGEMENT',
      'XBRL_CONVERSION',
      'XBRL_TAGGING',
      'DISCLOSURE_GRADE_DATA',
    ],
  },
  {
    id: 'regulatory-compliance',
    name: 'Regulatory & Compliance',
    nameLocal: '규제 & 컴플라이언스',
    icon: '📋',
    description: 'Compliance automation, Regulatory monitoring, Gap analysis',
    relatedFeatures: [
      'COMPLIANCE_AUTOMATION',
      'REGULATORY_COMPLIANCE',
      'COMPLIANCE_MAPPING',
      'REGULATORY_MONITORING',
      'REGULATORY_GAP_ANALYSIS',
      'GAP_ASSESSMENT',
    ],
  },
  {
    id: 'supply-chain-due-diligence',
    name: 'Supply Chain & Due Diligence',
    nameLocal: '공급망 & 실사',
    icon: '🔗',
    description: 'Supply chain ESG, Supplier engagement, HRDD, Traceability',
    relatedFeatures: [
      'SUPPLY_CHAIN',
      'SUPPLY_CHAIN_TRACEABILITY',
      'SUPPLY_CHAIN_DUE_DILIGENCE',
      'SUPPLY_CHAIN_DECARBONISATION',
      'SUPPLIER_ENGAGEMENT',
      'SUPPLIER_DATA_AGGREGATION',
      'SUPPLIER_LIFECYCLE_MANAGEMENT',
      'SUPPLIER_RISK_MONITORING',
      'SUPPLIER_ESG_ASSESSMENT',
      'MODERN_SLAVERY_RISK',
    ],
  },
  {
    id: 'portfolio-finance-investors',
    name: 'Portfolio, Finance & Investors',
    nameLocal: '포트폴리오 & 금융',
    icon: '💰',
    description: 'Private markets ESG, LP reporting, Financed emissions, SFDR/Taxonomy',
    relatedFeatures: [
      'PRIVATE_MARKETS_ESG',
      'PORTFOLIO_ESG_MANAGEMENT',
      'FINANCED_EMISSIONS',
      'SUSTAINABLE_FINANCE',
      'GREEN_BONDS',
      'INVESTMENT_PORTFOLIO_ANALYSIS',
      'LP_REPORTING',
      'FINANCIAL_ESG_INTEGRATION',
      'FINANCIAL_IMPACT_MODELING',
    ],
  },
  {
    id: 'energy-utilities-operations',
    name: 'Energy, Utilities & Operations',
    nameLocal: '에너지 & 유틸리티',
    icon: '⚡',
    description: 'Energy management, Utility monitoring, Building energy, Real-time IoT',
    relatedFeatures: [
      'ENERGY_MANAGEMENT',
      'UTILITY_DATA_MANAGEMENT',
      'REAL_TIME_UTILITY_MONITORING',
      'BUILDING_ENERGY_MANAGEMENT',
      'YARD_MANAGEMENT',
      'LOGISTICS_OPTIMIZATION',
      'VIRTUAL_ENERGY_MANAGER',
      'ISO_50001_ENMS',
    ],
  },
  {
    id: 'real-assets-built-environment',
    name: 'Real Assets & Built Environment',
    nameLocal: '부동산 & 건축 환경',
    icon: '🏢',
    description: 'Building LCA, Construction EPD, Building certification, GRESB',
    relatedFeatures: [
      'BUILDING_LCA',
      'CONSTRUCTION_EPD',
      'BUILDING_CERTIFICATION',
    ],
  },
  {
    id: 'nature-biodiversity-land',
    name: 'Nature, Biodiversity & Land',
    nameLocal: '자연 & 생물다양성',
    icon: '🌳',
    description: 'TNFD, Biodiversity monitoring, Deforestation, Land use',
    relatedFeatures: [
      'NATURE_BIODIVERSITY',
      'BIODIVERSITY_MONITORING',
      'LAND_USE',
      'DEFORESTATION_MONITORING',
    ],
  },
  {
    id: 'social-human-rights',
    name: 'Social & Human Rights',
    nameLocal: '사회 & 인권',
    icon: '🤝',
    description: 'Worker engagement, Social impact, HRDD, Diversity',
    relatedFeatures: [
      'DIRECT_WORKER_ENGAGEMENT',
      'PEOPLE_HEALTH_DIVERSITY',
      'SOCIAL_IMPACT_MANAGEMENT',
      'SOCIAL_VALUE_REPORTING',
      'MODERN_SLAVERY_RISK',
      'COMMUNITY_ENGAGEMENT',
    ],
  },
  {
    id: 'ai-data-automation',
    name: 'AI, Data Infrastructure & Automation',
    nameLocal: 'AI & 데이터 자동화',
    icon: '🤖',
    description: 'AI copilot, AI agents, Data extraction, API integration, Automation',
    relatedFeatures: [
      'AI_COPILOT',
      'AI_AGENTS',
      'AI_ANALYTICS',
      'AI_DATA_EXTRACTION',
      'AUTOMATION_WORKFLOWS',
      'DATA_HUB',
      'API_INTEGRATION',
      'CARBON_MANAGEMENT_API',
      'UTILITY_DATA_API',
      'MCP_INTEGRATION',
    ],
  },
  {
    id: 'product-lca-circularity',
    name: 'Product LCA & Circularity',
    nameLocal: '제품 LCA & 순환경제',
    icon: '♻️',
    description: 'Product LCA, EPD generation, Circular economy, Digital Product Passport',
    relatedFeatures: [
      'PRODUCT_LCA',
      'LCA',
      'CIRCULAR_ECONOMY',
      'DIGITAL_PRODUCT_PASSPORT',
      'EPD_GENERATION',
      'TEXTILE_FASHION_ECODESIGN',
      'ECODESIGN',
    ],
  },
  {
    id: 'sector-specific',
    name: 'Sector-Specific Solutions',
    nameLocal: '섹터 특화 솔루션',
    icon: '🏭',
    description: 'Fashion, Food, Hospitality, Events, Oil & Gas, Real Estate',
    relatedFeatures: [
      'FOOD_INDUSTRY_FOCUS',
      'TEXTILE_FASHION_ECODESIGN',
      'HOSPITALITY_DATA_HUB',
      'EVENT_SUSTAINABILITY',
      'OIL_GAS_ENVIRONMENTAL_MANAGEMENT',
    ],
  },
  {
    id: 'advisory-services-education',
    name: 'Advisory, Services & Education',
    nameLocal: '자문 & 교육 서비스',
    icon: '🎓',
    description: 'ESG consulting, Advisory services, BPO, E-learning, Stewardship',
    relatedFeatures: [
      'ESG_CONSULTING',
      'EXPERT_ADVISORY_SERVICES',
      'BPO_SERVICES',
      'SUSTAINABILITY_ELEARNING',
      'ENGAGEMENT_SERVICES',
      'STEWARDSHIP_SERVICES',
    ],
  },
];

// ============================================
// Framework Groups (7~8개 그룹)
// ============================================

export interface FrameworkGroupInfo {
  id: string;
  name: string;
  nameLocal: string;
  icon: string;
  description: string;
  relatedFrameworks: string[];
}

export const FRAMEWORK_GROUPS: FrameworkGroupInfo[] = [
  {
    id: 'global-esg-reporting',
    name: 'Global ESG Reporting Standards',
    nameLocal: '글로벌 ESG 보고 표준',
    icon: '🌐',
    description: 'GRI, SASB, ESRS, CSRD, ISSB, IFRS S1/S2, SDG, HKEX',
    relatedFrameworks: [
      'GRI',
      'SASB',
      'ESRS',
      'CSRD',
      'ISSB',
      'IFRS_S1_S2',
      'IFRS_S2',
      'SDG',
      'HKEX',
    ],
  },
  {
    id: 'climate-carbon-ghg',
    name: 'Climate, Carbon & GHG',
    nameLocal: '기후 & 탄소 & GHG',
    icon: '🌡️',
    description: 'GHG Protocol, TCFD, SBTi, PCAF, ISO 14064/67, EU ETS, SEC Climate',
    relatedFrameworks: [
      'GHG_PROTOCOL',
      'TCFD',
      'SBTi',
      'SBTi_FLAG',
      'PCAF',
      'PAS_2060',
      'ISO_14064',
      'ISO_14067',
      'EU_ETS',
      'SECR',
      'ASRS',
      'SEC_CLIMATE_RULE',
      'OSFI_B15',
    ],
  },
  {
    id: 'sustainable-finance',
    name: 'Sustainable Finance & Investment',
    nameLocal: '지속가능 금융 & 투자',
    icon: '💸',
    description: 'SFDR, EU Taxonomy, NZIF, Green Bonds, ILPA, EDCI',
    relatedFrameworks: [
      'SFDR',
      'EU_TAXONOMY',
      'NZIF',
      'GREEN_BONDS',
      'ILPA',
      'EDCI',
    ],
  },
  {
    id: 'supply-chain-hr-dd',
    name: 'Supply Chain & Human Rights DD',
    nameLocal: '공급망 & 인권 실사',
    icon: '⚖️',
    description: 'CSDDD, LkSG, HRDD, Modern Slavery Act, UFLPA',
    relatedFrameworks: [
      'CSDDD',
      'LkSG',
      'HRDD',
      'MODERN_SLAVERY_ACT',
      'UFLPA',
    ],
  },
  {
    id: 'product-lca-circular',
    name: 'Product LCA & Circular Economy',
    nameLocal: '제품 LCA & 순환경제',
    icon: '🔄',
    description: 'ISO 14040, PEF/PEFCR, EPD, ESPR/DPP, AGEC, EN 15804',
    relatedFrameworks: [
      'ISO_14040',
      'PEF',
      'PEFCR',
      'EPD',
      'ESPR',
      'DPP_ESPR',
      'AGEC',
      'BILAN_CARBONE',
      'EN_15804',
      'EN_15978',
    ],
  },
  {
    id: 'real-estate-building',
    name: 'Real Estate & Building Certification',
    nameLocal: '부동산 & 건물 인증',
    icon: '🏗️',
    description: 'LEED, BREEAM, DGNB, WELL, GRESB',
    relatedFrameworks: [
      'LEED',
      'BREEAM',
      'DGNB',
      'WELL_STANDARD',
      'GRESB',
    ],
  },
  {
    id: 'sector-theme-specific',
    name: 'Sector & Theme Specific',
    nameLocal: '섹터 & 테마 특화',
    icon: '🎯',
    description: 'Higg Index, GBTA, ESBN Green Deal, HCMI/HWMI, OSPAR',
    relatedFrameworks: [
      'HIGG_INDEX',
      'GBTA',
      'ESBN_GREEN_DEAL',
      'HCMI_HWMI',
      'OSPAR_HOCNF',
    ],
  },
  {
    id: 'regional-regulations',
    name: 'Regional Regulations',
    nameLocal: '지역별 규제',
    icon: '🗺️',
    description: 'ASRS, SB 253/261, Climate Active, HKEX, MITECO, OSFI, VSME',
    relatedFrameworks: [
      'ASRS',
      'SB_253',
      'SB_261',
      'CLIMATE_ACTIVE',
      'HKEX',
      'MITECO',
      'OSFI_B15',
      'VSME',
    ],
  },
];

// ============================================
// User Personas (6~8개)
// ============================================

export interface UserPersonaInfo {
  id: string;
  name: string;
  nameLocal: string;
  icon: string;
  description: string;
}

export const USER_PERSONAS: UserPersonaInfo[] = [
  {
    id: 'sustainability-team',
    name: 'Sustainability Team',
    nameLocal: '지속가능성 팀',
    icon: '🌱',
    description: 'ESG managers, Sustainability directors, Climate officers',
  },
  {
    id: 'cfo-finance-team',
    name: 'CFO / Finance Team',
    nameLocal: 'CFO / 재무팀',
    icon: '💼',
    description: 'CFOs, Finance teams, Accounting teams',
  },
  {
    id: 'procurement-supply-chain',
    name: 'Procurement / Supply Chain',
    nameLocal: '구매 / 공급망팀',
    icon: '📦',
    description: 'Procurement officers, Supply chain managers',
  },
  {
    id: 'investors-pe-vc-am',
    name: 'Investors / PE / VC / Asset Managers',
    nameLocal: '투자자 / PE / VC / 자산운용사',
    icon: '💰',
    description: 'LPs, GPs, Asset managers, Pension funds',
  },
  {
    id: 'real-estate-plant-operations',
    name: 'Real Estate / Plant / Operations',
    nameLocal: '부동산 / 플랜트 / 운영팀',
    icon: '🏢',
    description: 'Facility managers, Plant operators, Real estate teams',
  },
  {
    id: 'sme-midmarket-startup',
    name: 'SME / Mid-market / Startup',
    nameLocal: 'SME / 중견기업 / 스타트업',
    icon: '🚀',
    description: 'Small and medium enterprises, Startups, Scale-ups',
  },
];

// ============================================
// AI Maturity Levels (3개)
// ============================================

export interface AIMaturityLevelInfo {
  id: string;
  name: string;
  nameLocal: string;
  icon: string;
  description: string;
}

export const AI_MATURITY_LEVELS: AIMaturityLevelInfo[] = [
  {
    id: 'none',
    name: 'No AI',
    nameLocal: 'AI 없음',
    icon: '📝',
    description: 'Traditional software without AI capabilities',
  },
  {
    id: 'ai-assisted',
    name: 'AI-Assisted (Copilot)',
    nameLocal: 'AI 보조 (코파일럿)',
    icon: '🤝',
    description: 'AI copilot, Auto-classification, Suggestions',
  },
  {
    id: 'ai-first-agentic',
    name: 'AI-First / Agentic',
    nameLocal: 'AI 우선 / Agentic',
    icon: '🤖',
    description: 'AI agents, Autonomous workflows, AI-native platform',
  },
];

// ============================================
// 지역별 메타 정보
// ============================================

export const REGION_INFO: Record<Region, { nameLocal: string; emoji: string }> = {
  'Europe': { nameLocal: '유럽', emoji: '🇪🇺' },
  'North America': { nameLocal: '북미', emoji: '🌎' },
  'Asia': { nameLocal: '아시아', emoji: '🌏' },
  'Oceania': { nameLocal: '오세아니아', emoji: '🇦🇺' },
  'South America': { nameLocal: '남미', emoji: '🇧🇷' },
  'Middle East': { nameLocal: '중동', emoji: '🇦🇪' },
  'Africa': { nameLocal: '아프리카', emoji: '🌍' },
};

export const COUNTRY_INFO: Record<CountryCode, { 
  name: string; 
  nameLocal: string; 
  emoji: string;
  region: Region;
  capital?: string;
  cluster?: string;
}> = {
  'GB': { 
    name: 'United Kingdom', 
    nameLocal: '영국', 
    emoji: '🇬🇧',
    region: 'Europe',
    capital: 'London',
    cluster: 'FinTech ESG & Data Platforms'
  },
  'DE': { 
    name: 'Germany', 
    nameLocal: '독일', 
    emoji: '🇩🇪',
    region: 'Europe',
    capital: 'Berlin',
    cluster: 'Supply Chain & Compliance'
  },
  'FR': { 
    name: 'France', 
    nameLocal: '프랑스', 
    emoji: '🇫🇷',
    region: 'Europe',
    capital: 'Paris',
    cluster: 'Sustainable Finance'
  },
  'NL': { 
    name: 'Netherlands', 
    nameLocal: '네덜란드', 
    emoji: '🇳🇱',
    region: 'Europe',
    capital: 'Amsterdam',
    cluster: 'Circular Economy'
  },
  'SE': { 
    name: 'Sweden', 
    nameLocal: '스웨덴', 
    emoji: '🇸🇪',
    region: 'Europe',
    capital: 'Stockholm',
    cluster: 'Climate Tech & Net Zero'
  },
  'FI': { 
    name: 'Finland', 
    nameLocal: '핀란드', 
    emoji: '🇫🇮',
    region: 'Europe',
    capital: 'Helsinki',
    cluster: 'LCA & Sustainability'
  },
  'NO': { 
    name: 'Norway', 
    nameLocal: '노르웨이', 
    emoji: '🇳🇴',
    region: 'Europe',
    capital: 'Oslo',
    cluster: 'Climate Risk'
  },
  'CH': { 
    name: 'Switzerland', 
    nameLocal: '스위스', 
    emoji: '🇨🇭',
    region: 'Europe',
    capital: 'Zurich',
    cluster: 'Carbon Finance'
  },
  'BE': { 
    name: 'Belgium', 
    nameLocal: '벨기에', 
    emoji: '🇧🇪',
    region: 'Europe',
    capital: 'Brussels',
    cluster: 'EU Regulation'
  },
  'ES': { 
    name: 'Spain', 
    nameLocal: '스페인', 
    emoji: '🇪🇸',
    region: 'Europe',
    capital: 'Madrid',
    cluster: 'Renewable Energy'
  },
  'IE': { 
    name: 'Ireland', 
    nameLocal: '아일랜드', 
    emoji: '🇮🇪',
    region: 'Europe',
    capital: 'Dublin',
    cluster: 'Energy Analytics'
  },
  'EE': { 
    name: 'Estonia', 
    nameLocal: '에스토니아', 
    emoji: '🇪🇪',
    region: 'Europe',
    capital: 'Tallinn',
    cluster: 'ESG Data'
  },
  'PL': { 
    name: 'Poland', 
    nameLocal: '폴란드', 
    emoji: '🇵🇱',
    region: 'Europe',
    capital: 'Kraków',
    cluster: 'Satellite Analytics'
  },
  'DK': { 
    name: 'Denmark', 
    nameLocal: '덴마크', 
    emoji: '🇩🇰',
    region: 'Europe',
    capital: 'Copenhagen',
    cluster: 'Sustainable Tech'
  },
  // 아시아 (Asia)
  'SG': {
    name: 'Singapore',
    nameLocal: '싱가포르',
    emoji: '🇸🇬',
    region: 'Asia',
    capital: 'Singapore',
    cluster: 'ESG Data Infrastructure'
  },
  'JP': {
    name: 'Japan',
    nameLocal: '일본',
    emoji: '🇯🇵',
    region: 'Asia',
    capital: 'Tokyo',
    cluster: 'Industrial ESG & LCA'
  },
  // 오세아니아 (Oceania)
  'AU': {
    name: 'Australia',
    nameLocal: '호주',
    emoji: '🇦🇺',
    region: 'Oceania',
    capital: 'Sydney',
    cluster: 'ASRS Compliance & Climate Risk'
  },
  // 북미 (North America)
  'US': {
    name: 'United States',
    nameLocal: '미국',
    emoji: '🇺🇸',
    region: 'North America',
    capital: 'New York',
    cluster: 'Enterprise ESG & AI Analytics'
  },
  'CA': {
    name: 'Canada',
    nameLocal: '캐나다',
    emoji: '🇨🇦',
    region: 'North America',
    capital: 'Toronto',
    cluster: 'Disclosure & Reporting'
  },
  // 중동 (Middle East)
  'AE': {
    name: 'United Arab Emirates',
    nameLocal: '아랍에미리트',
    emoji: '🇦🇪',
    region: 'Middle East',
    capital: 'Dubai',
    cluster: 'Sustainable Finance & Green Economy'
  },
  'SA': {
    name: 'Saudi Arabia',
    nameLocal: '사우디아라비아',
    emoji: '🇸🇦',
    region: 'Middle East',
    capital: 'Riyadh',
    cluster: 'Energy Transition & Vision 2030'
  },
  'IL': {
    name: 'Israel',
    nameLocal: '이스라엘',
    emoji: '🇮🇱',
    region: 'Middle East',
    capital: 'Tel Aviv',
    cluster: 'Climate Tech Innovation'
  },
  // 남미 (South America)
  'BR': {
    name: 'Brazil',
    nameLocal: '브라질',
    emoji: '🇧🇷',
    region: 'South America',
    capital: 'São Paulo',
    cluster: 'Amazon & Biodiversity'
  },
  'CL': {
    name: 'Chile',
    nameLocal: '칠레',
    emoji: '🇨🇱',
    region: 'South America',
    capital: 'Santiago',
    cluster: 'Renewable Energy & Mining ESG'
  },
  'AR': {
    name: 'Argentina',
    nameLocal: '아르헨티나',
    emoji: '🇦🇷',
    region: 'South America',
    capital: 'Buenos Aires',
    cluster: 'Agriculture & Climate Resilience'
  },
  'CO': {
    name: 'Colombia',
    nameLocal: '콜롬비아',
    emoji: '🇨🇴',
    region: 'South America',
    capital: 'Bogotá',
    cluster: 'Biodiversity & TNFD'
  },
  'CR': {
    name: 'Costa Rica',
    nameLocal: '코스타리카',
    emoji: '🇨🇷',
    region: 'South America',
    capital: 'San José',
    cluster: 'Carbon Neutrality & Eco-tourism'
  },
};

// ============================================
// 애니메이션 설정
// ============================================

export const ANIMATION = {
  GLOW_PULSE: 2000,
  HOVER_TRANSITION: 200,
  PANEL_SLIDE: 300,
  MAP_ZOOM: 600,
} as const;

// ============================================
// UI 레이아웃 상수
// ============================================

export const PANEL_WIDTH = {
  LEFT: 384,
  RIGHT: 448,
} as const;

export const Z_INDEX = {
  MAP_BASE: 1,
  MAP_MARKERS: 10,
  TOOLTIP: 50,
  PANEL: 1000,
  DROPDOWN: 1100,
  MODAL: 2000,
} as const;

// ============================================
// Data 로딩 설정
// ============================================

export const DATA_PATH = '/data/esg_companies_global.json';

export const CACHE_KEY = {
  COMPANIES: 'esg-companies',
  METADATA: 'esg-metadata',
} as const;

// ============================================
// 개발 모드 설정
// ============================================

export const DEV_MODE = {
  SHOW_COORDINATES: false,
  SHOW_COUNTRY_CODES: false,
  SHOW_GRID: false,
  ENABLE_DRAG: false,
} as const;

export const MARKER_COLLISION = {
  MIN_DISTANCE: 35,
  AUTO_ADJUST: false,
  OFFSET_STEP: 10,
} as const;

export const PERFORMANCE = {
  DEBOUNCE_FILTER: 50,
  THROTTLE_HOVER: 16,
  LAZY_LOAD_THRESHOLD: 100,
} as const;

// ============================================
// AI Maturity 분류 기준
// ============================================

/**
 * AI 성숙도 자동 분류를 위한 기준
 * 
 * 기업의 Features 및 Description을 분석하여
 * AI 성숙도 레벨을 동적으로 판단합니다.
 */
export const AI_MATURITY_CRITERIA = {
  // Level 3: AI-First / Agentic (자율 에이전트, 생성형 AI, 고도화된 예측)
  LEVEL_3_FEATURES: ['AI_AGENTS', 'AI_COPILOT', 'AI_ANOMALY_DETECTION', 'AI_POWERED_MAPPING'],
  LEVEL_3_KEYWORDS: [
    'generative', 'llm', 'gpt', 'copilot', 'autonomous', 'agent', 
    'predictive', 'forecasting', 'neural network', 'deep learning'
  ],
  
  // Level 2: AI-Assisted (자동화, 분석 지원, 추출)
  LEVEL_2_FEATURES: ['AI_DATA_EXTRACTION', 'AI_ANALYTICS'],
  LEVEL_2_KEYWORDS: [
    'automation', 'automated', 'machine learning', 'ml', 'nlp', 
    'extraction', 'analytics', 'smart', 'optimization'
  ],
} as const;
