import { create } from 'zustand';
import { DocumentNode } from '@/types/editor/document';
import { BlockNode} from '@/types/editor/block';
import { InlineNode, TextMark } from '@/types/editor/inline';

/**
 * 에디터 선택 영역 정보
 */
export interface EditorSelection {
  blockId: string;
  offset: number;
  length: number;
  userId?: string;
}

/**
 * 에디터 히스토리 (Undo/Redo)
 */
interface EditorHistory {
  past: DocumentNode[];
  future: DocumentNode[];
}

/**
 * 에디터 상태 인터페이스
 */
interface EditorState {
  // 문서 상태
  document: DocumentNode | null;
  currentSection: string | null;
  
  // 선택 상태
  selection: EditorSelection | null;
  
  // UI 상태
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // 히스토리 (Undo/Redo)
  history: EditorHistory;
  
  // 편집 모드
  isEditing: boolean;
  focusedBlockId: string | null;
}

/**
 * 에디터 액션 인터페이스
 */
interface EditorActions {
  // 문서 관리
  setDocument: (doc: DocumentNode) => void;
  updateDocument: (updates: Partial<DocumentNode>) => void;
  
  // 블록 관리
  updateBlock: (blockId: string, sectionId: string, updates: Partial<BlockNode>) => void;
  insertBlock: (sectionId: string, position: number, block: BlockNode) => void;
  deleteBlock: (blockId: string, sectionId: string) => void;
  moveBlock: (blockId: string, sourceSectionId: string, targetSectionId: string, fromPosition: number, toPosition: number) => void;
  
  // 인라인 텍스트 업데이트
  updateBlockContent: (blockId: string, sectionId: string, content: InlineNode[]) => void;
  
  // 인라인 텍스트 마크 적용/제거
  applyMark: (blockId: string, sectionId: string, inlineIndex: number, mark: TextMark, toggle?: boolean) => void;
  
  // AI Assist 메타데이터 관리
  updateBlockMetadata: (blockId: string, sectionId: string, metadata: Record<string, any>) => void;
  updateBlockTextContent: (blockId: string, sectionId: string, text: string) => void;

  // 선택 영역 관리
  setSelection: (selection: EditorSelection | null) => void;
  
  // 섹션 관리
  setCurrentSection: (sectionId: string | null) => void;
  
  // UI 상태
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  
  // 편집 모드
  setEditing: (editing: boolean) => void;
  setFocusedBlock: (blockId: string | null) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  
  // 히스토리 관리
  pushHistory: () => void;
  
  // 초기화
  reset: () => void;
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  document: null,
  currentSection: null,
  selection: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  history: {
    past: [],
    future: [],
  },
  isEditing: false,
  focusedBlockId: null,
};

/**
 * 에디터 Zustand Store
 */
export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  // 문서 설정
  setDocument: (doc) => {
    set({ document: doc, lastSaved: new Date() });
  },

  // 문서 업데이트
  updateDocument: (updates) => {
    const { document } = get();
    if (!document) return;

    set({
      document: {
        ...document,
        ...updates,
        sections: updates.sections ?? document.sections,
        metadata: {
          ...document.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  },

  // 블록 업데이트
  updateBlock: (blockId, sectionId, updates) => {
    const { document, pushHistory } = get();
    if (!document) return;

    pushHistory(); // 히스토리에 현재 상태 저장

    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        blocks: section.blocks.map((block: BlockNode) => {
          if (block.id !== blockId) return block;

          const updatedBlock = { ...block } as BlockNode;

          if (updates.attributes) {
            updatedBlock.attributes = {
              ...(block.attributes ?? {}),
              ...updates.attributes,
            };
          }
          
          if (updates.data) {
            updatedBlock.data = {
              ...(block.data ?? {}),
              ...updates.data,
            };
          }
          
          Object.assign(updatedBlock, updates);

        return updatedBlock ;

        }),
      };
    });

    set({ document: { ...document, sections: newSections, metadata: { ...document.metadata, updatedAt: new Date().toISOString() } } });
  },

  // 블록 콘텐츠 업데이트 (텍스트 편집)
  updateBlockContent: (blockId, sectionId, content) => {
    const { updateBlock } = get();
    updateBlock(blockId, sectionId, { content });

  },

  // 블록 삽입
  insertBlock: (sectionId, position, block) => {
    const { document, pushHistory } = get();
    if (!document) return;

    pushHistory(); // 히스토리에 현재 상태 저장

    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      const newBlocks = [...section.blocks];
      newBlocks.splice(position, 0, block);

      return {
        ...section,
        blocks: newBlocks,
      };
    });

    set({
      document: {
        ...document,
        sections: newSections,
        metadata: {
          ...document.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  },

  // 블록 삭제
  deleteBlock: (blockId, sectionId) => {
    const { document, pushHistory } = get();
    if (!document) return;

    pushHistory(); // 히스토리에 현재 상태 저장

    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        blocks: section.blocks.filter((block: BlockNode) => block.id !== blockId),
      };
    });

    set({
      document: {
        ...document,
        sections: newSections,
        metadata: {
          ...document.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  },

  // 블록 이동
  moveBlock: (blockId, sourceSectionId, targetSectionId, fromPosition, toPosition) => {
    const { document, pushHistory } = get();
    if (!document) return;

    pushHistory(); // Undo 스냅샷 저장

    // 같은 섹션 내 이동

    if (sourceSectionId === targetSectionId) {
      const newSections = document.sections.map((section) => {
        if (section.id !== sourceSectionId) return section;

        const newBlocks = [...section.blocks];
        const [movedBlock] = newBlocks.splice(fromPosition, 1);
        newBlocks.splice(toPosition, 0, movedBlock);

        return {
          ...section,
          blocks: newBlocks,
        };
      });
    
      set({
        document: {
          ...document,
          sections: newSections,
          metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
        },
      });
      return;
    }

    // 다른 섹션 간 이동

    let movedBlock: BlockNode | null = null;

    // 1) 원본 섹션에서 블록 제거
    const newSections = document.sections.map((section) => {
      if (section.id === sourceSectionId) {
        const newBlocks = [...section.blocks];
        const blockIndex = newBlocks.findIndex((b) => b.id === blockId);
  
        if (blockIndex !== -1) {
          [movedBlock] = newBlocks.splice(blockIndex, 1);
        }
  
        return { ...section, blocks: newBlocks };
      }
      return section;
    });

    // 2. 대상 섹션에 블록 삽입입

    const finalSections = newSections.map((section) => {
      if (section.id === targetSectionId && movedBlock) { 
        const newBlocks = [...section.blocks];
        newBlocks.splice(toPosition, 0, movedBlock);

        return {
          ...section,
          blocks: newBlocks,
        };
      }

      return section;
    });

    // 3. 상태 업데이트
    set({
      document: {
        ...document,
        sections: finalSections,
        metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
      },
    });
  },

  // 인라인 텍스트 마크 적용/제거
  applyMark: (blockId, sectionId, inlineIndex, mark, toggle = true) => {
    const { document, pushHistory } = get();
    if (!document) return;

    pushHistory(); 

    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;

      const newBlocks = section.blocks.map((block) => {
        if (block.id !== blockId || !block.content) return block;

        const newContent = block.content.map((inline, index) => {
          if (index !== inlineIndex) return inline;

          const currentMarks = inline.marks ?? [];
          const hasMark = currentMarks.includes(mark);

          let newMarks: TextMark[];

          if (toggle) {
            newMarks = hasMark
            ? currentMarks.filter((m) => m !== mark) : [...currentMarks, mark];
          } else {
            newMarks = hasMark ? currentMarks : [...currentMarks, mark];
          }

          return {
            ...inline,
            marks: newMarks
          };
        });

        return {
          ...block,
          content: newContent,
        };
      });
      
      return {
        ...section,
        blocks: newBlocks,
      };
    });

    set({
      document: {
        ...document,
        sections: newSections,
        metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
      },
    });
  },
  
  // AI Assist: 블록 메타데이터 업데이트 (ESG 프레임워크 태깅)
  updateBlockMetadata: (blockId, sectionId, metadata) => {
    const { document, pushHistory } = get();
    if (!document) return;
    
    pushHistory();
    
    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;
      
      const newBlocks = section.blocks.map((block) => {
        if (block.id !== blockId) return block;
        
        return {
          ...block,
          data: {
            ...(block.data || {}),
            aiAssist: {
              ...(block.data?.aiAssist || {}),
              ...metadata,
            },
          },
        };
      });
      
      return {
        ...section,
        blocks: newBlocks,
      };
    });
    
    set({
      document: {
        ...document,
        sections: newSections,
        metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
      },
    });
  },
  
  // AI Assist: 블록 텍스트 내용 업데이트 (내용 확장)
  updateBlockTextContent: (blockId, sectionId, text) => {
    const { document, pushHistory } = get();
    if (!document) return;
    
    pushHistory();
    
    const newSections = document.sections.map((section) => {
      if (section.id !== sectionId) return section;
      
      const newBlocks = section.blocks.map((block) => {
        if (block.id !== blockId) return block;
        
        // 텍스트를 InlineNode로 변환
        const newContent: InlineNode[] = [{
          id: crypto.randomUUID(),
          type: 'text',
          text,
        }];
        
        return {
          ...block,
          content: newContent,
        };
      });
      
      return {
        ...section,
        blocks: newBlocks,
      };
    });
    
    set({
      document: {
        ...document,
        sections: newSections,
        metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
      },
    });
  },

  // 선택 영역 설정
  setSelection: (selection) => {
    set({ selection });
  },

  // 현재 섹션 설정
  setCurrentSection: (sectionId) => {
    set({ currentSection: sectionId });
  },

  // UI 상태 관리
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  
  // 편집 모드
  setEditing: (editing) => set({ isEditing: editing }),
  setFocusedBlock: (blockId) => set({ focusedBlockId: blockId }),

  // Undo
  undo: () => {
    const { history, document } = get();
    if (history.past.length === 0 || !document) return;

    const previous = history.past[history.past.length - 1];

    const newPast = history.past.slice(0, -1);
    set({
      document: previous,
      history: {
        past: newPast,
        future: [document, ...history.future],
      },
    });
  },

  // Redo
  redo: () => {
    const { history, document } = get();
    if (history.future.length === 0 || !document) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      document: next,
      history: {
        past: [...history.past, document],
        future: newFuture,
      },
    });
  },

  // 히스토리에 현재 상태 추가
  pushHistory: () => {
    const { document, history } = get();
    if (!document) return;

    // 최대 50개의 히스토리만 유지

    const snapshot = structuredClone ? structuredClone(document) : JSON.parse(JSON.stringify(document));
    const newPast = [...history.past, snapshot].slice(-50);

    set({
      history: {
        past: newPast,
        future: [], // 새 액션이 발생하면 future는 초기화
      },
    });
  },

  // 초기화
  reset: () => {
    set(initialState);
  },
}));

