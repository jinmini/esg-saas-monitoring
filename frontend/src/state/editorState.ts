// import { DocumentNode } from '@/types/documentSchema';

// export interface EditorState {
//   /** 현재 편집 중인 문서 (도메인 상태) */
//   document: DocumentNode;

//   /** 커서, 선택, 포커스 등 UI 상태 */
//   ui: EditorUIState;

//   /** Undo / Redo 히스토리 */
//   history: EditorHistory;
// }

// export interface EditorUIState {
//   selectedSectionId?: string;
//   selectedBlockId?: string;
//   selectionRange?: TextSelection;
//   isDirty: boolean; // 저장되지 않은 변경 여부
// }

// export interface TextSelection {
//   anchor: number;
//   focus: number;
// }

// export interface EditorHistory {
//   past: DocumentNode[];
//   present: DocumentNode;
//   future: DocumentNode[];
// }
