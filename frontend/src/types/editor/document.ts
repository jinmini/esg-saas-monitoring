import type { SectionNode } from './section';
/**
 * 공통 노드 타입
 */
export type NodeType = 'document' | 'section' | 'block' | 'inline';

/**
 * 기본 노드 인터페이스
 */
export interface BaseNode {
  id: string;
  type: NodeType;
}

/**
 * 문서 노드 최상위 구조
 */
export interface DocumentNode extends BaseNode {
  type: 'document';
  title: string;
  metadata: DocumentMetadata;
  pageSetup: PageSetup;
  sections: SectionNode[];
}

/**
 * 문서 메타데이터 정의
 */
export interface DocumentMetadata {

  version: number;
  revisionId: string;
  status:
    | 'draft'
    | 'in_progress'
    | 'in_review'
    | 'approved'
    | 'published'
    | 'archived'
    | 'rejected';
  authorId: string;
  language: 'ko' | 'en';
  createdAt: string ; //ISO8601
  updatedAt: string ;

  /**
   * 확장 포인트 (추후 협업/권한 관리/태그 등)
   */
  permissions?: DocumentPermission[];
  tags?: string[];
  linkedDocuments?: LinkedDocumentRef[];
}

/**
 * 페이지 설정 (PDF 및 인쇄용 레이아웃)
 */
export interface PageSetup {
  format: 'A4' | 'Letter' | 'A3' | 'Custom';
  customSize?: {
    width: number; // mm 단위
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * 문서 협업/권한 관리용 (확장용)
 */
export interface DocumentPermission {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'commenter' | 'viewer';
}

/**
 * 문서 간 참조 구조 (보고서 ↔ 데이터 리포트 등)
 */
export interface LinkedDocumentRef {
  documentId: string;
  relation: 'source' | 'reference' | 'supplement';
  note?: string;
}

export const createEmptyDocument = (title = 'New ESG Report') : DocumentNode => ({
  id: crypto.randomUUID(),
  type: 'document',
  title,
  metadata: {
    version: 1,
    revisionId: crypto.randomUUID(),
    status: 'draft',
    authorId: '',
    language: 'ko',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  pageSetup: {
    format: 'A4',
    orientation: 'portrait',
    margin: { top: 20, bottom: 20, left: 20, right: 20 },
  },
  sections: [],
});

export type { SectionNode };