/**
 * Unified Report Editor 통합 데이터 모델
 * 텍스트, 이미지, 표를 하나의 객체 배열로 관리
 */

export type UnifiedObjectType = 'text' | 'image' | 'table';

/**
 * 모든 객체의 공통 속성
 */
export interface BaseUnifiedObject {
  id: string;
  type: UnifiedObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  pageIndex: number;
  locked: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Rich Text Box 객체
 * contentEditable + 기본 서식 지원
 */
export interface TextObject extends BaseUnifiedObject {
  type: 'text';
  content: string; // HTML 콘텐츠
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  padding: number;
  borderColor?: string;
  borderWidth: number;
}

/**
 * 이미지 객체
 */
export interface ImageObject extends BaseUnifiedObject {
  type: 'image';
  src: string;
  originalWidth: number;
  originalHeight: number;
  maintainAspectRatio: boolean;
  opacity: number;
  borderRadius: number;
}

/**
 * 테이블 셀
 */
export interface TableCell {
  text: string;
  rowSpan: number;
  colSpan: number;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  bold?: boolean;
  italic?: boolean;
}

/**
 * 테이블 객체
 */
export interface TableObject extends BaseUnifiedObject {
  type: 'table';
  rows: number;
  cols: number;
  cells: TableCell[][];
  borderColor: string;
  borderWidth: number;
  cellPadding: number;
  headerRow: boolean;
}

/**
 * Union 타입
 */
export type UnifiedObject = TextObject | ImageObject | TableObject;

/**
 * 페이지
 */
export interface UnifiedPage {
  id: string;
  index: number;
  objects: UnifiedObject[];
  backgroundColor: string;
  width: number; // A4: 794px
  height: number; // A4: 1123px
  createdAt: string;
  updatedAt: string;
}

/**
 * 문서
 */
export interface UnifiedDocument {
  id: string;
  title: string;
  description?: string;
  pages: UnifiedPage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 텍스트 서식 스타일
 */
export interface TextFormatStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

/**
 * 에디터 상태
 */
export interface EditorState {
  document: UnifiedDocument | null;
  currentPageIndex: number;
  selectedObjectIds: string[];
  clipboard: UnifiedObject[];
  history: UnifiedDocument[];
  historyIndex: number;
  isEditing: boolean;
  editingObjectId: string | null;
}

// A4 크기 상수 (96 DPI 기준)
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

// 기본 여백
export const DEFAULT_MARGIN = 40;

// Z-index 레이어
export const Z_INDEX = {
  CANVAS_BACKGROUND: 0,
  CANVAS_OBJECTS: 10,
  TEXT_OVERLAY: 50,
  INTERACTION_LAYER: 100,
} as const;

