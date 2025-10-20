/**
 * 블록 유틸리티 함수
 */

import { BlockNode } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';

/**
 * InlineNode 배열을 일반 텍스트로 변환
 * @param content InlineNode 배열
 * @returns 일반 텍스트
 */
export function extractTextFromInlineNodes(content?: InlineNode[]): string {
  if (!content || content.length === 0) return '';
  
  return content
    .map((inline) => {
      if (inline.type === 'text' && inline.text) {
        return inline.text;
      }
      return '';
    })
    .join('');
}

/**
 * BlockNode에서 텍스트 추출
 * @param block BlockNode
 * @returns 블록 텍스트 또는 빈 문자열
 */
export function extractTextFromBlock(block: BlockNode): string {
  // 'content' 속성이 있는 블록 타입
  if ('content' in block && block.content) {
    return extractTextFromInlineNodes(block.content);
  }
  
  // ListBlock의 경우 children에서 텍스트 추출
  if (block.blockType === 'list' && 'children' in block) {
    return block.children
      .map((item) => extractTextFromInlineNodes(item.content))
      .join('\n');
  }
  
  // ImageBlock의 경우 alt 텍스트 반환
  if (block.blockType === 'image' && 'data' in block) {
    return block.data.alt || block.data.caption || '';
  }
  
  return '';
}

/**
 * 텍스트가 유효한지 확인 (AI Assist 사용 가능 여부)
 * @param text 텍스트
 * @returns 유효 여부
 */
export function isValidTextForAI(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 10; // 최소 10자 이상
}

