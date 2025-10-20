/**
 * Analysis Engine
 * 고객사 프로필 기반 규제/프레임워크/인벤토리 추천 로직
 */

import type {
  CustomerProfile,
  AnalysisResult,
  RegulatoryImpact,
  FrameworkRecommendation,
  InventoryScope,
  BenchmarkData,
  Industry,
} from '@/types/analysis';

// 산업별 한글 이름
export const INDUSTRY_LABELS: Record<Industry, string> = {
  manufacturing: '제조업',
  it: 'IT/소프트웨어',
  finance: '금융',
  construction: '건설',
  logistics: '물류',
  retail: '유통/소매',
  energy: '에너지',
};

// 규모별 한글 이름
export const SIZE_LABELS = {
  small: '중소기업',
  medium: '중견기업',
  large: '대기업',
};

/**
 * 고객사 프로필 기반 종합 분석
 */
export async function analyzeCustomer(
  profile: CustomerProfile
): Promise<AnalysisResult> {
  const regulatoryImpacts = getRegulatoryImpacts(profile);
  const frameworks = getFrameworkRecommendations(profile);
  const inventoryScope = await getInventoryScope(profile);
  const benchmark = getBenchmarkData(profile);

  return {
    profile,
    regulatoryImpacts,
    frameworks,
    inventoryScope,
    benchmark,
  };
}

/**
 * 규제 영향도 분석
 */
function getRegulatoryImpacts(profile: CustomerProfile): RegulatoryImpact[] {
  const impacts: RegulatoryImpact[] = [];

  // K-ESG (상장사 필수)
  if (profile.listed) {
    impacts.push({
      name: 'K-ESG 가이드라인',
      status: 'required',
      description: '상장사 ESG 정보 공시 의무 (환경부)',
      effectiveDate: '2024년~',
    });
  } else {
    impacts.push({
      name: 'K-ESG 가이드라인',
      status: 'recommended',
      description: '중소/중견기업 자율 공시 권장',
    });
  }

  // CBAM (EU 수출)
  if (
    profile.exportToEU &&
    ['manufacturing', 'construction', 'energy'].includes(profile.industry)
  ) {
    impacts.push({
      name: 'EU CBAM (탄소국경조정제도)',
      status: 'required',
      description:
        '철강/알루미늄/시멘트/비료/전력 수출 시 탄소배출량 보고 및 인증서 구매 의무',
      effectiveDate: '2026년 1월~',
    });
  }

  // K-IFRS (ISSB 기반)
  if (profile.listed && profile.size === 'large') {
    impacts.push({
      name: 'K-IFRS 지속가능성 공시',
      status: 'upcoming',
      description: 'ISSB 기준 도입, 코스피 상위 기업 우선 적용',
      effectiveDate: '2025년 6월 예정',
    });
  }

  // EU CSRD (EU 진출 대기업)
  if (
    profile.exportToEU &&
    profile.size === 'large' &&
    ['manufacturing', 'finance', 'energy'].includes(profile.industry)
  ) {
    impacts.push({
      name: 'EU CSRD (지속가능성 보고 지침)',
      status: 'upcoming',
      description: '유럽 내 대기업 및 상장사 지속가능성 보고 의무',
      effectiveDate: '2025년~',
    });
  }

  return impacts;
}

/**
 * 프레임워크 추천
 */
function getFrameworkRecommendations(
  profile: CustomerProfile
): FrameworkRecommendation[] {
  const recommendations: FrameworkRecommendation[] = [];

  // GRI (모든 기업 기본)
  recommendations.push({
    framework: 'GRI',
    priority: 1,
    rationale: '국제 표준, 모든 산업에 적용 가능, 이해관계자 중심',
  });

  // TCFD (금융/상장사)
  if (profile.industry === 'finance' || profile.listed) {
    recommendations.push({
      framework: 'TCFD',
      priority: 2,
      rationale: '기후 관련 재무정보 공시, 투자자 요구사항',
    });
  }

  // ISSB (상장사)
  if (profile.listed) {
    recommendations.push({
      framework: 'ISSB',
      priority: 2,
      rationale: 'K-IFRS 전환 대비 (2025년 예정)',
    });
  }

  // SASB (산업별)
  if (['manufacturing', 'it', 'finance', 'energy'].includes(profile.industry)) {
    recommendations.push({
      framework: 'SASB',
      priority: 3,
      rationale: `${INDUSTRY_LABELS[profile.industry]} 특화 지표 제공`,
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

/**
 * 인벤토리 범위 추천
 */
async function getInventoryScope(
  profile: CustomerProfile
): Promise<InventoryScope> {
  // Scope 3 카테고리 로드
  const response = await fetch('/data/analysis/scope3-categories.json');
  const allCategories = await response.json();
  const scope3Categories = allCategories[profile.industry] || [];

  return {
    scope1: true, // 항상 포함
    scope2: true, // 항상 포함
    scope3Categories,
  };
}

/**
 * 벤치마크 데이터 (정적)
 */
function getBenchmarkData(profile: CustomerProfile): BenchmarkData {
  const benchmarks: Record<
    Industry,
    { average: number; top: string[]; point: string }
  > = {
    manufacturing: {
      average: 78,
      top: ['삼성전자 (CDP A)', 'LG전자 (CDP A)', '현대차 (CDP A-)'],
      point: 'Scope 3 검증 완료 및 과학기반 감축목표(SBTi) 설정',
    },
    it: {
      average: 82,
      top: ['네이버 (CDP B)', '카카오 (CDP B)', 'SK텔레콤 (CDP A-)'],
      point: '재생에너지 100% 전환(RE100) 및 탄소중립 데이터센터',
    },
    finance: {
      average: 85,
      top: ['KB금융 (CDP A-)', '신한금융 (CDP B)', 'NH금융 (CDP B)'],
      point: '투자 포트폴리오 탄소배출량 공시 (Scope 3 Cat.15)',
    },
    construction: {
      average: 65,
      top: ['삼성물산 (CDP B)', 'GS건설 (CDP B-)', '현대건설 (CDP C)'],
      point: '친환경 건축 자재 사용 비율 및 에너지 효율 등급',
    },
    logistics: {
      average: 68,
      top: ['CJ대한통운 (CDP B)', '한진 (CDP C)', '롯데글로벌로지스 (CDP C)'],
      point: '친환경 차량 전환율 및 배송 효율화',
    },
    retail: {
      average: 72,
      top: ['신세계 (CDP B)', '롯데쇼핑 (CDP B-)', '이마트 (CDP C)'],
      point: '공급망 ESG 관리 및 순환경제 모델',
    },
    energy: {
      average: 75,
      top: ['SK에너지 (CDP B)', 'GS칼텍스 (CDP B-)', 'S-Oil (CDP C)'],
      point: '저탄소 에너지 전환 로드맵 및 CCUS 기술 도입',
    },
  };

  const data = benchmarks[profile.industry];
  return {
    industryAverage: data.average,
    topPerformers: data.top,
    differentiationPoint: data.point,
  };
}

