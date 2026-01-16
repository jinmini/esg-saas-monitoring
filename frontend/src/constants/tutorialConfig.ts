/**
 * Tutorial Configuration
 * 페이지별 튜토리얼 설정 데이터
 */

export interface TutorialStep {
  number: number;
  description: string;
}

export interface DualVideoConfig {
  left: {
    videoSrc: string;
    title: string;
    description: string;
  };
  right: {
    videoSrc: string;
    title: string;
    description: string;
  };
}

export interface TutorialConfig {
  videoSrc?: string;
  title: string;
  description: string;
  steps?: TutorialStep[];
  dualVideo?: DualVideoConfig; // 2단 뷰 영상 설정
}

/**
 * 페이지 경로별 튜토리얼 설정
 */
export const TUTORIAL_CONFIG: Record<string, TutorialConfig> = {
  '/market-insight': {
    videoSrc: '/tutorials/market-insight.mp4',
    title: 'Market Insight 사용법',
    description: '필터링, 기업 선택, 기사 선택 방법을 안내합니다.',
    steps: [
      {
        number: 1,
        description: '기간 필터로 원하는 날짜 범위를 선택하세요',
      },
      {
        number: 2,
        description: '기업 필터에서 특정 기업을 선택하세요',
      },
      {
        number: 3,
        description: '기사 카드를 클릭하여 상세 내용을 확인하세요',
      },
    ],
    dualVideo: {
      left: {
        videoSrc: '/tutorials/kr-saas-tutorial.mp4',
        title: 'KR SaaS',
        description: '국내 ESG SaaS 기업 정보를 확인하세요',
      },
      right: {
        videoSrc: '/tutorials/gb-saas-tutorial.mp4',
        title: 'Global SaaS',
        description: '글로벌 ESG SaaS 기업 정보를 확인하세요',
      },
    },
  },
  // 다른 페이지 설정은 추후 추가
  '/analysis': {
    videoSrc: '/tutorials/analysis.mp4',
    title: 'Analysis 사용법',
    description: '인터랙티브 지도 탐색 방법을 안내합니다.',
    steps: [],
  },
  '/ai-features': {
    videoSrc: '/tutorials/ai-features.mp4',
    title: 'AI Features 사용법',
    description: 'AI 기능 활용 방법을 안내합니다.',
    steps: [],
  },
};

/**
 * 현재 경로에 해당하는 튜토리얼 설정을 가져옵니다
 */
export function getTutorialConfig(pathname: string): TutorialConfig | null {
  return TUTORIAL_CONFIG[pathname] || null;
}

