// /**
//  * Konva Canvas 객체 타입 정의
//  */

// export type CanvasObjectType = 'text' | 'image' | 'table' | 'shape';

// export interface BaseCanvasObject {
//   id: string;
//   type: CanvasObjectType;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   rotation: number;
//   zIndex: number;
//   pageIndex: number; // Multi-page 지원
//   locked: boolean;
//   visible: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface TextBoxObject extends BaseCanvasObject {
//   type: 'text';
//   text: string;
//   fontSize: number;
//   fontFamily: string;
//   fontStyle: 'normal' | 'bold' | 'italic';
//   textAlign: 'left' | 'center' | 'right' | 'justify';
//   color: string;
//   backgroundColor?: string;
//   padding: number;
//   lineHeight: number;
// }

// export interface ImageObject extends BaseCanvasObject {
//   type: 'image';
//   src: string; // URL or Base64
//   originalWidth: number;
//   originalHeight: number;
//   maintainAspectRatio: boolean;
//   opacity: number;
//   filters?: string[]; // grayscale, blur, etc.
// }

// export interface TableCell {
//   text: string;
//   rowSpan: number;
//   colSpan: number;
//   backgroundColor?: string;
//   textAlign: 'left' | 'center' | 'right';
//   verticalAlign: 'top' | 'middle' | 'bottom';
// }

// export interface TableObject extends BaseCanvasObject {
//   type: 'table';
//   rows: number;
//   cols: number;
//   cells: TableCell[][];
//   borderColor: string;
//   borderWidth: number;
//   cellPadding: number;
//   headerRow: boolean;
// }

// export type CanvasObject = TextBoxObject | ImageObject | TableObject;

// export interface CanvasPage {
//   id: string;
//   index: number;
//   objects: CanvasObject[];
//   backgroundColor: string;
//   // A4 크기 (72 DPI 기준)
//   width: number; // 595px (210mm)
//   height: number; // 842px (297mm)
// }

// export interface CanvasDocument {
//   id: string;
//   title: string;
//   pages: CanvasPage[];
//   createdAt: string;
//   updatedAt: string;
// }

// // A4 크기 상수 (72 DPI 기준 - 웹 표준)
// export const A4_WIDTH_PX = 595; // 210mm
// export const A4_HEIGHT_PX = 842; // 297mm

// // A4 크기 상수 (96 DPI 기준 - 화면 표시용)
// export const A4_WIDTH_SCREEN = 794; // 210mm * 96/25.4
// export const A4_HEIGHT_SCREEN = 1123; // 297mm * 96/25.4

// // PDF 출력용 스케일 팩터
// export const PDF_SCALE = 2; // 고해상도 출력용

