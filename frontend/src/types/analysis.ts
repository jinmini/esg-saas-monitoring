/**
 * Analysis 페이지 관련 타입 정의
 * AM Workspace: 고객사 분석 도구
 */

// 산업 분류
export type Industry =
  | 'manufacturing'
  | 'it'
  | 'finance'
  | 'construction'
  | 'logistics'
  | 'retail'
  | 'energy';

// 기업 규모
export type CompanySize = 'small' | 'medium' | 'large';

// 프레임워크 종류
export type Framework = 'GRI' | 'TCFD' | 'ISSB' | 'SASB' | 'K-ESG';

// Scope 3 카테고리
export type Scope3Category = {
  id: number;
  name: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
};

// 고객사 프로필
export interface CustomerProfile {
  industry: Industry;
  size: CompanySize;
  exportToEU: boolean;
  listed: boolean;
}

// 규제 영향도
export interface RegulatoryImpact {
  name: string;
  status: 'required' | 'upcoming' | 'recommended';
  description: string;
  effectiveDate?: string;
}

// 프레임워크 추천
export interface FrameworkRecommendation {
  framework: Framework;
  priority: 1 | 2 | 3;
  rationale: string;
}

// 인벤토리 범위 추천
export interface InventoryScope {
  scope1: boolean;
  scope2: boolean;
  scope3Categories: Scope3Category[];
}

// 벤치마크 데이터
export interface BenchmarkData {
  industryAverage: number;
  topPerformers: string[];
  differentiationPoint: string;
}

// 분석 결과
export interface AnalysisResult {
  profile: CustomerProfile;
  regulatoryImpacts: RegulatoryImpact[];
  frameworks: FrameworkRecommendation[];
  inventoryScope: InventoryScope;
  benchmark: BenchmarkData;
}

// 프레임워크 비교 데이터
export interface FrameworkComparison {
  framework: Framework;
  purpose: string;
  keyMetrics: string[];
  suitableFor: string[];
  mandatoryFor?: string[];
}

// 규제 타임라인 이벤트
export interface RegulatoryEvent {
  id: string;
  date: string;
  title: string;
  category: 'CBAM' | 'K-IFRS' | 'EU-CSRD' | 'K-ESG' | 'ISSB' | 'Other';
  description: string;
  impact: Industry[];
}

