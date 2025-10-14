import { BaseNode} from '@/types/editor/document';

/**
 * 블록 내부의 최소 단위 텍스트 노드
 * InlineNode는 중첩이 아닌 평면(flat) 구조로 구성되어,
 * 스타일은 marks 배열로 표현됩니다.
 */
export interface InlineNode extends BaseNode {
  type: 'inline';
  
  /** 실제 텍스트 내용 */
  text: string;

  /** 텍스트에 적용된 포맷(스타일) 배열 */
  marks?: TextMark[];

  /** 하이퍼링크 (선택적) */
  link?: InlineLink;

  /** 주석(코멘트)이나 참고 표시 */
  annotation?: InlineAnnotation;
}

/**
 * 텍스트 포맷 스타일 정의
 * Markdown-like 표현을 JSON으로 구조화
 */
export type TextMark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'highlight'
  | 'code'
  | 'subscript'
  | 'superscript';

/**
 * 링크 객체 구조
 */
export interface InlineLink {
  url: string;
  title?: string;
  target?: '_blank' | '_self';
}

/**
 * 주석/코멘트(리뷰, 감사 등) 정보
 */
export interface InlineAnnotation {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}
