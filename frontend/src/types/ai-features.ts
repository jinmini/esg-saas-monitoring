/**
 * AI Feature Use Case 타입 정의
 */

export type AIFeatureStatus = 'implemented' | 'beta' | 'research' | 'planned';
export type AIFeatureCategory = 
  | 'document-automation'
  | 'data-analysis'
  | 'monitoring'
  | 'compliance'
  | 'sustainability'
  | 'reporting';

export interface AIFeature {
  id: string;
  title: string;
  description: string;
  category: AIFeatureCategory;
  status: AIFeatureStatus;
  icon: string; // emoji or icon name
  benefits: string[];
  techStack?: string[];
  link?: string; // internal route or external URL
  externalLink?: boolean;
  imageUrl?: string; // 선택적 이미지
}

export const AI_FEATURE_STATUS_LABELS: Record<AIFeatureStatus, string> = {
  implemented: '구현 완료',
  beta: 'Beta',
  research: '연구 단계',
  planned: '계획 중',
};

export const AI_FEATURE_STATUS_COLORS: Record<AIFeatureStatus, string> = {
  implemented: 'bg-green-100 text-green-700',
  beta: 'bg-blue-100 text-blue-700',
  research: 'bg-purple-100 text-purple-700',
  planned: 'bg-gray-100 text-gray-700',
};

export const AI_FEATURE_CATEGORY_LABELS: Record<AIFeatureCategory, string> = {
  'document-automation': '📝 문서 자동화',
  'data-analysis': '📊 데이터 분석',
  'monitoring': '🔍 모니터링',
  'compliance': '✅ 컴플라이언스',
  'sustainability': '🌱 지속가능성',
  'reporting': '📈 리포팅',
};

