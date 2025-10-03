/**
 * ESG 보고서 문서 구조 타입 정의
 * 2단계 계층: Document > Chapter > Section
 */

export interface DocumentSection {
  id: string;
  title: string;
  content: string; // HTML 형식의 에디터 내용
  order: number;
  chapterId: string; // 상위 챕터 ID
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChapter {
  id: string;
  title: string;
  order: number;
  isCollapsed: boolean; // 접기/펼치기 상태
  sections: DocumentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  chapters: DocumentChapter[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Zustand 스토어 상태 타입
 */
export interface DocumentStore {
  document: Document;
  activeSectionId: string | null;
  
  // Document 관리
  setDocument: (document: Document) => void;
  updateDocumentTitle: (title: string) => void;
  
  // Chapter 관리
  addChapter: (title: string) => void;
  updateChapter: (chapterId: string, title: string) => void;
  deleteChapter: (chapterId: string) => void;
  toggleChapterCollapse: (chapterId: string) => void;
  
  // Section 관리
  addSection: (chapterId: string, title: string) => void;
  updateSection: (sectionId: string, updates: Partial<DocumentSection>) => void;
  deleteSection: (sectionId: string) => void;
  setActiveSection: (sectionId: string | null) => void;
  
  // Getter 헬퍼
  getActiveSection: () => DocumentSection | null;
  getSectionById: (sectionId: string) => DocumentSection | null;
  getChapterById: (chapterId: string) => DocumentChapter | null;
}

