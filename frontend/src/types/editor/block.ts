import { InlineNode } from '@/types/editor/inline';

/** 1) 블록 유형 */
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'list'
  | 'quote'
  | 'table'
  | 'chart'
  | 'esgMetric';

/** 2) 공통 블록 속성 (모든 블록이 공유) */
export interface BlockAttributes {
  align?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  level?: number; // heading/list 계층 표현시 사용
  backgroundColor?: string;
  border?: string;
  padding?: number | string;
  style?: Record<string, string | number>;
}

/** ---- 블록별 전용 Attributes (공통 + 특정 속성 추가) ---- */
export interface HeadingAttributes extends BlockAttributes {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageAttributes extends BlockAttributes {
  width?: number | string;
  height?: number | string;
}

export interface ListAttributes extends BlockAttributes {
  listType: 'ordered' | 'unordered';
  startNumber?: number;
}

/** 3) 블록 공통 베이스 */
export interface BaseBlockNode {
  id: string;
  blockType: BlockType;
  attributes?: BlockAttributes; // 전용 Attributes가 있는 블록은 아래에서 재정의(좁혀서)합니다.
  content?: InlineNode[];
  data?: any;
}

/** 4) 블록별 상세 타입 */
export interface ParagraphBlock extends BaseBlockNode {
  blockType: 'paragraph';
  content: InlineNode[];
}

export interface HeadingBlock extends BaseBlockNode {
  blockType: 'heading';
  attributes: HeadingAttributes; // 공통 + level 필수
  content: InlineNode[];
}

export interface ImageBlock extends BaseBlockNode {
  blockType: 'image';
  data: { src: string; alt?: string; caption?: string };
  attributes?: ImageAttributes; // 공통 + width/height
}

export interface ListItemNode {
  id: string;
  content: InlineNode[];
}

export interface ListBlock extends BaseBlockNode {
  blockType: 'list';
  attributes: ListAttributes; // 공통 + listType/startNumber
  children: ListItemNode[];
}

export interface QuoteBlock extends BaseBlockNode {
  blockType: 'quote';
  content: InlineNode[];
}

export interface TableBlock extends BaseBlockNode {
  blockType: 'table';
  data: { rows: number; cols: number; cells: string[][] };
}

export interface ChartBlock extends BaseBlockNode {
  blockType: 'chart';
  data: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data: any[];
    options: Record<string, any>;
  };
}

export interface ESGMetricBlock extends BaseBlockNode {
  blockType: 'esgMetric';
  data: {
    metricName: string;
    category: 'environmental' | 'social' | 'governance';
    value: number | string;
    unit?: string;
  };
}

/** 5) 전체 블록 유니온 */
export type BlockNode =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | TableBlock
  | ChartBlock
  | ESGMetricBlock;

/** 6) InlineNode 생성 헬퍼 (id/type 필수 보장) */
export const createTextInline = (text = ''): InlineNode => ({
  id: crypto.randomUUID(),
  type: 'inline',          // Inline 스키마가 요구하는 literal
  text,
  marks: [],             // 필요 시 기본값
});

/** 링크 생성 헬퍼 */

export const createInlineLink = (text: string, url: string): InlineNode => ({
  id: crypto.randomUUID(),
  type: 'inline',
  text,
  link: { url },
  marks: [],
});


/** 7) 빈 블록 팩토리
 *    - 반환 타입을 BlockNode로 지정 (오류 #2 해결)
 *    - 블록별로 content/data/attributes의 안전한 기본값을 세팅
 */
export const createEmptyBlock = (type: BlockType = 'paragraph'): BlockNode => {
  const id = crypto.randomUUID();

  switch (type) {
    case 'paragraph':
      return {
        id,
        blockType: 'paragraph',
        attributes: {}, // Backend 필수 필드
        content: [createTextInline('')],
      };

    case 'heading':
      return {
        id,
        blockType: 'heading',
        attributes: { level: 2, align: 'left' },
        content: [createTextInline('제목')],
      };

    case 'list':
      return {
        id,
        blockType: 'list',
        attributes: { listType: 'unordered', indent: 0 },
        children: [
          { id: crypto.randomUUID(), content: [createTextInline('항목 1')] },
        ],
      };

    case 'quote':
      return {
        id,
        blockType: 'quote',
        attributes: {}, // Backend 필수 필드
        content: [createTextInline('')],
      };

    case 'table': {
      const rows = 2;
      const cols = 2;
      return {
        id,
        blockType: 'table',
        attributes: {}, // Backend 필수 필드
        data: {
          rows,
          cols,
          cells: Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => '')
          ),
        },
      };
    }

    case 'image':
      return {
        id,
        blockType: 'image',
        data: { src: '', alt: '', caption: '' },
        attributes: { align: 'center', width: '100%' },
      };

    case 'chart':
      return {
        id,
        blockType: 'chart',
        attributes: {}, // Backend 필수 필드
        data: { type: 'bar', data: [], options: {} },
      };

    case 'esgMetric':
      return {
        id,
        blockType: 'esgMetric',
        attributes: {}, // Backend 필수 필드
        data: {
          metricName: '',
          category: 'environmental',
          value: '',
          unit: '',
        },
      };

    default:
      // 안전장치: 혹시 모르는 확장 케이스에 대비
      return {
        id,
        blockType: 'paragraph',
        attributes: {}, // Backend 필수 필드
        content: [createTextInline('')],
      };
  }
};
