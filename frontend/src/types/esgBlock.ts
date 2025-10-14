import { BlockNode } from '@/types/editor/block';

/**
 * ESG 지표 데이터 블록
 * 정량 데이터(KPI) 또는 표준 지표(GRI 등)에 연결되는 단위
 */
export interface ESGMetricBlock extends BlockNode {
  type: 'block';
  blockType: 'esgMetric';

  data: {
  
  /** 지표 코드 (예: GRI 305-1, SASB EM0201-01 등) */
  metricCode: string;

  /** 데이터 (연도별 값, 단위 등) */
  values: Record<string, number | string>;

  /** 단위 (예: tCO₂eq, %) */
  unit?: string;

  /** 시각화 옵션 */
  visualization?: 'table' | 'chart' | 'text';

  /** 관련 참고자료 */
  references?: {
    title: string;
      url?: string;
    }[];
  }
}
