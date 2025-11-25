import type { AIFeature } from '@/types/ai-features';

/**
 * ESG SaaS AI 기능 Use Cases
 * - 구현된 기능 + 연구/계획 중인 기능
 */
export const AI_FEATURES: AIFeature[] = [
  // ✅ 구현된 기능: Report Editor (Beta)
  {
    id: 'report-editor-beta',
    title: 'AI 보고서 자동 생성 (Beta)',
    description: 'AI가 ESG 보고서를 자동으로 작성하고 프레임워크에 매핑합니다.',
    category: 'document-automation',
    status: 'beta',
    icon: 'FileText',
    benefits: [],
    techStack: [],
    link: '/report/dashboard',
    externalLink: false,
  },

  // 📊 데이터 분석
  {
    id: 'esg-scoring',
    title: 'ESG 평가 자동화',
    description: '공시 데이터와 뉴스를 분석하여 실시간 ESG 점수를 산출합니다.',
    category: 'data-analysis',
    status: 'research',
    icon: 'BarChart3',
    benefits: [],
    techStack: [],
  },

  {
    id: 'supply-chain-risk',
    title: '공급망 리스크 모니터링',
    description: '공급망 전체의 ESG 리스크를 실시간으로 감지하고 경고합니다.',
    category: 'monitoring',
    status: 'research',
    icon: 'Network',
    benefits: [],
    techStack: [],
  },

  {
    id: 'carbon-footprint',
    title: '탄소발자국 추정',
    description: '활동 데이터를 기반으로 탄소 배출량을 계산하고 시뮬레이션합니다.',
    category: 'sustainability',
    status: 'planned',
    icon: 'Leaf',
    benefits: [],
    techStack: [],
  },

  // 🔍 모니터링
  {
    id: 'regulatory-tracking',
    title: '글로벌 규제 추적',
    description: '전 세계 ESG 규제 변화를 추적하고 영향도를 분석합니다.',
    category: 'compliance',
    status: 'research',
    icon: 'Scale',
    benefits: [],
    techStack: [],
  },

  // ✅ 컴플라이언스
  {
    id: 'audit-automation',
    title: 'ESG 감사 자동화',
    description: '데이터 정합성을 검증하고 감사 리포트를 자동으로 생성합니다.',
    category: 'compliance',
    status: 'planned',
    icon: 'ShieldCheck',
    benefits: [],
    techStack: [],
  },

  {
    id: 'materiality-assessment',
    title: 'AI 중대성 평가',
    description: '산업별 이슈를 분석하여 기업의 중대성 이슈를 도출합니다.',
    category: 'compliance',
    status: 'research',
    icon: 'Target',
    benefits: [],
    techStack: [],
  },

  // 📈 리포팅
  {
    id: 'multi-framework-mapping',
    title: '프레임워크 자동 매핑',
    description: '단일 데이터로 GRI, SASB 등 여러 프레임워크 보고서를 생성합니다.',
    category: 'reporting',
    status: 'research',
    icon: 'RefreshCw',
    benefits: [],
    techStack: [],
  },


  {
    id: 'peer-benchmarking',
    title: '동종업계 벤치마킹',
    description: '경쟁사의 ESG 성과를 자동으로 수집하고 비교 분석합니다.',
    category: 'data-analysis',
    status: 'planned',
    icon: 'TrendingUp',
    benefits: [],
    techStack: [],
  },

];
