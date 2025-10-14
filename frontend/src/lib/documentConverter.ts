/**
 * Document Converter
 * 
 * Frontend DocumentNode ↔ Backend APIDocument 변환 유틸리티
 */

import { DocumentNode } from '@/types/editor/document';
import { SectionNode } from '@/types/editor/section';
import { BlockNode } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';
import {
  APIDocument,
  APIDocumentSection,
  APIBlockNode,
  APIInlineNode,
  APIDocumentBulkUpdateRequest,
} from '@/types/api';

/**
 * Backend API Document → Frontend DocumentNode 변환
 */
export function apiDocumentToDocumentNode(apiDoc: APIDocument): DocumentNode {
  return {
    id: String(apiDoc.id),
    type: 'document' as const,
    title: apiDoc.title,
    metadata: {
      version: 1,
      revisionId: crypto.randomUUID(),
      status: 'draft',
      authorId: apiDoc.user_id?.toString() || '',
      language: 'ko' as const,
      createdAt: apiDoc.created_at,
      updatedAt: apiDoc.updated_at,
      tags: [],
    },
    pageSetup: {
      format: 'A4' as const,
      orientation: 'portrait' as const,
      margin: { top: 20, bottom: 20, left: 20, right: 20 },
    },
    sections: apiDoc.sections.map(apiSectionToSectionNode),
  };
}

/**
 * Backend API Section → Frontend SectionNode 변환
 */
function apiSectionToSectionNode(apiSection: APIDocumentSection): SectionNode {
  return {
    id: String(apiSection.id),
    type: 'section' as const,
    title: apiSection.title,
    description: apiSection.description,
    blocks: apiSection.blocks.map(apiBlockToBlockNode),
    griReference: apiSection.griReference || [],
    metadata: apiSection.metadata || {},
  };
}

/**
 * Backend API Block → Frontend BlockNode 변환
 */
function apiBlockToBlockNode(apiBlock: APIBlockNode): BlockNode {
  const baseBlock = {
    id: apiBlock.id,
    type: 'block' as const,
    blockType: apiBlock.blockType,
    attributes: apiBlock.attributes || {},
  };

  // content가 있으면 변환 (텍스트 블록)
  if (apiBlock.content && Array.isArray(apiBlock.content)) {
    return {
      ...baseBlock,
      content: apiBlock.content.map(apiInlineToInlineNode),
    } as any; // 타입 단언 사용 (Discriminated Union 복잡성 회피)
  }

  // data가 있으면 추가 (테이블, 차트, ESG 메트릭)
  if (apiBlock.data) {
    return {
      ...baseBlock,
      data: apiBlock.data,
    } as any;
  }

  // children이 있으면 추가 (리스트)
  if (apiBlock.children) {
    return {
      ...baseBlock,
      children: apiBlock.children,
    } as any;
  }

  // 기본값 (빈 content)
  return {
    ...baseBlock,
    content: [],
  } as any;
}

/**
 * Backend API Inline → Frontend InlineNode 변환
 */
function apiInlineToInlineNode(apiInline: APIInlineNode): InlineNode {
  return {
    id: apiInline.id,
    type: 'inline' as const,
    text: apiInline.text,
    marks: apiInline.marks as any || [],
    link: apiInline.link,
    annotation: apiInline.annotation,
  };
}

// ==========================================
// Frontend → Backend 변환
// ==========================================

/**
 * Frontend DocumentNode → Backend Bulk Update Request 변환
 */
export function documentNodeToApiBulkUpdate(
  doc: DocumentNode
): APIDocumentBulkUpdateRequest {
  const result: APIDocumentBulkUpdateRequest = {
    title: doc.title,
    sections: doc.sections.map((section, index) => sectionNodeToApiSection(section, index)),
  };
  
  // undefined 대신 키를 생략
  // description은 DocumentMetadata에 없으므로 포함하지 않음
  
  return result;
}

/**
 * Frontend SectionNode → Backend API Section 변환
 */
function sectionNodeToApiSection(section: SectionNode, index: number): APIDocumentBulkUpdateRequest['sections'][0] {
  return {
    title: section.title,
    description: section.description,
    order: index, // SectionNode에 order 없으므로 index 사용
    blocks: section.blocks.map(blockNodeToApiBlock),
    griReference: section.griReference,
    metadata: section.metadata,
  };
}

/**
 * Frontend BlockNode → Backend API Block 변환
 */
function blockNodeToApiBlock(block: BlockNode): APIBlockNode {
  const apiBlock: APIBlockNode = {
    id: block.id,
    blockType: block.blockType,
    attributes: block.attributes || {}, // 기본값 빈 객체
  };

  // content가 있으면 변환
  if ('content' in block && block.content) {
    apiBlock.content = block.content.map(inlineNodeToApiInline);
  }

  // data가 있으면 추가
  if ('data' in block && block.data) {
    apiBlock.data = block.data;
  }

  // children이 있으면 추가
  if ('children' in block && block.children) {
    apiBlock.children = block.children;
  }

  // attributes가 undefined이면 빈 객체로 설정 (Backend 필수 필드)
  if (!apiBlock.attributes) {
    apiBlock.attributes = {};
  }

  return apiBlock;
}

/**
 * Frontend InlineNode → Backend API Inline 변환
 */
function inlineNodeToApiInline(inline: InlineNode): APIInlineNode {
  return {
    id: inline.id,
    type: 'inline' as const,
    text: inline.text,
    marks: inline.marks as string[],
    link: inline.link,
    annotation: inline.annotation,
  };
}

// ==========================================
// 유틸리티 함수
// ==========================================

/**
 * API 문서가 비어있는지 확인
 */
export function isEmptyApiDocument(apiDoc: APIDocument): boolean {
  return (
    !apiDoc.sections ||
    apiDoc.sections.length === 0 ||
    apiDoc.sections.every((s) => !s.blocks || s.blocks.length === 0)
  );
}

/**
 * Frontend 문서가 비어있는지 확인
 */
export function isEmptyDocumentNode(doc: DocumentNode): boolean {
  return (
    !doc.sections ||
    doc.sections.length === 0 ||
    doc.sections.every((s) => !s.blocks || s.blocks.length === 0)
  );
}

