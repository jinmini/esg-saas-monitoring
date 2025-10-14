import { BaseNode, NodeType } from '@/types/editor/document';
import { BlockNode } from '@/types/editor/block';

/**
 * 문서의 논리적 구분 단위 (예: 환경, 사회, 지배구조)
 */
export interface SectionNode extends BaseNode {
  type: 'section';

  /** 섹션 제목 */
  title: string;

  /** 부가 설명 (선택) */
  description?: string;

  /** ESG 표준 매핑 (GRI/SASB/기타 코드 등) */
  griReference?: {
    code : string[];
    framework : 'GRI' | 'SASB' | 'TCFD' | 'ISO26000' | 'ESRS';
  }[];

  /** 섹션별 메타데이터 */
  metadata?: SectionMetadata;

  /** 콘텐츠 블록 배열 */
  blocks: BlockNode[];
}

/**
 * 섹션 단위 메타데이터
 */
export interface SectionMetadata {
  /** 작성자 또는 담당 부서 */
  owner?: string;
  
  /** ESG 분류 (예: E, S, G) */
  category?: 'E' | 'S' | 'G' | 'General';

  /** 내부 관리용 태그 */
  tags?: string[];

  /** 승인 상태 */
  status?: 'draft' | 'in_review' | 'approved' | 'archived' | 'rejected';

  /** 첨부파일 목록 */
  attachments?: SectionAttachment[];
}

export interface SectionAttachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'image' | 'pdf';
  uploadedAt: string;
  uploadedBy: string;
}

export const createEmptySection = (title = 'New Section') : SectionNode => ({
  id: crypto.randomUUID(),
  type: 'section',
  title,
  description: '',
  blocks: [],
  metadata: {
    status: 'draft',
    category: 'General',
  },
});

