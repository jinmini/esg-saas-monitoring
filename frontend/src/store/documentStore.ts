import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Document as APIDocument } from '@/types/api';
import { documentsApi } from '@/lib/api';

/**
 * Frontend Document Types (string IDs for local state)
 */
export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChapter {
  id: string;
  title: string;
  order: number;
  isCollapsed: boolean;
  sections: DocumentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string | number; // string for local, number for backend
  title: string;
  description?: string;
  isPublic: boolean;
  isTemplate: boolean;
  chapters: DocumentChapter[];
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentStore {
  document: Document | null;
  activeSectionId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  
  // Document operations
  setDocument: (document: Document) => void;
  updateDocumentTitle: (title: string) => void;
  loadDocument: (documentId: number) => Promise<void>;
  saveDocument: (documentId?: number) => Promise<void>;
  loadTemplate: (templateId: number) => Promise<void>;
  
  // Chapter operations
  addChapter: (title: string) => void;
  updateChapter: (chapterId: string, title: string) => void;
  deleteChapter: (chapterId: string) => void;
  toggleChapterCollapse: (chapterId: string) => void;
  
  // Section operations
  addSection: (chapterId: string, title: string) => void;
  updateSection: (sectionId: string, updates: Partial<DocumentSection>) => void;
  deleteSection: (sectionId: string) => void;
  setActiveSection: (sectionId: string | null) => void;
  
  // Getters
  getActiveSection: () => DocumentSection | null;
  getSectionById: (sectionId: string) => DocumentSection | null;
  getChapterById: (chapterId: string) => DocumentChapter | null;
}

/**
 * Convert API Document to Frontend Document
 */
const apiToFrontendDocument = (apiDoc: APIDocument): Document => {
  return {
    id: apiDoc.id,
    title: apiDoc.title,
    description: apiDoc.description,
    isPublic: apiDoc.is_public,
    isTemplate: apiDoc.is_template,
    chapters: apiDoc.chapters.map(chapter => ({
      id: chapter.id?.toString() || `chapter-${Date.now()}`,
      title: chapter.title,
      order: chapter.order,
      isCollapsed: chapter.is_collapsed,
      sections: chapter.sections.map(section => ({
        id: section.id?.toString() || `section-${Date.now()}`,
        title: section.title,
        content: section.content,
        order: section.order,
        createdAt: section.created_at ? new Date(section.created_at) : new Date(),
        updatedAt: section.updated_at ? new Date(section.updated_at) : new Date(),
      })),
      createdAt: chapter.created_at ? new Date(chapter.created_at) : new Date(),
      updatedAt: chapter.updated_at ? new Date(chapter.updated_at) : new Date(),
    })),
    createdAt: new Date(apiDoc.created_at),
    updatedAt: new Date(apiDoc.updated_at),
  };
};

/**
 * Convert Frontend Document to API format
 */
const frontendToApiDocument = (doc: Document) => {
  return {
    title: doc.title,
    description: doc.description,
    is_public: doc.isPublic,
    is_template: doc.isTemplate,
    chapters: doc.chapters.map(chapter => ({
      title: chapter.title,
      order: chapter.order,
      is_collapsed: chapter.isCollapsed,
      sections: chapter.sections.map(section => ({
        title: section.title,
        content: section.content,
        order: section.order,
      })),
    })),
  };
};

/**
 * Create empty document
 */
const createEmptyDocument = (): Document => {
  const now = new Date();
  return {
    id: 'new',
    title: '새 문서',
    description: '',
    isPublic: false,
    isTemplate: false,
    chapters: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Zustand Document Store with Backend Integration
 */
export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      document: null,
      activeSectionId: null,
      isLoading: false,
      isSaving: false,
      lastSavedAt: null,

      // Document operations
      setDocument: (document) => set({ document, activeSectionId: document.chapters[0]?.sections[0]?.id || null }),

      updateDocumentTitle: (title) =>
        set((state) => ({
          document: state.document
            ? { ...state.document, title, updatedAt: new Date() }
            : null,
        })),

      loadDocument: async (documentId: number) => {
        set({ isLoading: true });
        try {
          const apiDoc = await documentsApi.getById(documentId);
          const frontendDoc = apiToFrontendDocument(apiDoc);
          set({
            document: frontendDoc,
            activeSectionId: frontendDoc.chapters[0]?.sections[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load document:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loadTemplate: async (templateId: number) => {
        set({ isLoading: true });
        try {
          const apiDoc = await documentsApi.getById(templateId);
          const frontendDoc = apiToFrontendDocument(apiDoc);
          // Reset ID to 'new' for template copy
          frontendDoc.id = 'new';
          frontendDoc.isTemplate = false;
          frontendDoc.title = `${frontendDoc.title} (사본)`;
          set({
            document: frontendDoc,
            activeSectionId: frontendDoc.chapters[0]?.sections[0]?.id || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load template:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      saveDocument: async (documentId?: number) => {
        const state = get();
        if (!state.document) return;

        set({ isSaving: true });
        try {
          const apiData = frontendToApiDocument(state.document);

          if (documentId && typeof state.document.id === 'number') {
            // Update existing document
            const result = await documentsApi.bulkUpdate(documentId, apiData);
            const updatedDoc = apiToFrontendDocument(result.document);
            set({
              document: updatedDoc,
              isSaving: false,
              lastSavedAt: new Date(),
            });
          } else {
            // Create new document
            const result = await documentsApi.create(apiData);
            const newDoc = apiToFrontendDocument(result);
            set({
              document: newDoc,
              isSaving: false,
              lastSavedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to save document:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Chapter operations
      addChapter: (title) =>
        set((state) => {
          if (!state.document) return state;

          const newChapter: DocumentChapter = {
            id: `chapter-${Date.now()}`,
            title,
            order: state.document.chapters.length + 1,
            isCollapsed: false,
            sections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return {
            document: {
              ...state.document,
              chapters: [...state.document.chapters, newChapter],
              updatedAt: new Date(),
            },
          };
        }),

      updateChapter: (chapterId, title) =>
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? { ...chapter, title, updatedAt: new Date() }
                  : chapter
              ),
              updatedAt: new Date(),
            },
          };
        }),

      deleteChapter: (chapterId) =>
        set((state) => {
          if (!state.document) return state;
          const deletedChapter = state.document.chapters.find((c) => c.id === chapterId);
          const hasActiveSection = deletedChapter?.sections.some(
            (s) => s.id === state.activeSectionId
          );

          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.filter((chapter) => chapter.id !== chapterId),
              updatedAt: new Date(),
            },
            activeSectionId: hasActiveSection ? null : state.activeSectionId,
          };
        }),

      toggleChapterCollapse: (chapterId) =>
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? { ...chapter, isCollapsed: !chapter.isCollapsed }
                  : chapter
              ),
            },
          };
        }),

      // Section operations
      addSection: (chapterId, title) =>
        set((state) => {
          if (!state.document) return state;
          const chapter = state.document.chapters.find((c) => c.id === chapterId);
          if (!chapter) return state;

          const newSection: DocumentSection = {
            id: `section-${Date.now()}`,
            title,
            content: `<h2>${title}</h2><p>내용을 입력하세요...</p>`,
            order: chapter.sections.length + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.map((c) =>
                c.id === chapterId
                  ? { ...c, sections: [...c.sections, newSection], updatedAt: new Date() }
                  : c
              ),
              updatedAt: new Date(),
            },
          };
        }),

      updateSection: (sectionId, updates) =>
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.map((chapter) => ({
                ...chapter,
                sections: chapter.sections.map((section) =>
                  section.id === sectionId
                    ? { ...section, ...updates, updatedAt: new Date() }
                    : section
                ),
              })),
              updatedAt: new Date(),
            },
          };
        }),

      deleteSection: (sectionId) =>
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              chapters: state.document.chapters.map((chapter) => ({
                ...chapter,
                sections: chapter.sections.filter((section) => section.id !== sectionId),
              })),
              updatedAt: new Date(),
            },
            activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
          };
        }),

      setActiveSection: (sectionId) => set({ activeSectionId: sectionId }),

      // Getters
      getActiveSection: () => {
        const state = get();
        if (!state.activeSectionId || !state.document) return null;
        return state.getSectionById(state.activeSectionId);
      },

      getSectionById: (sectionId) => {
        const state = get();
        if (!state.document) return null;
        for (const chapter of state.document.chapters) {
          const section = chapter.sections.find((s) => s.id === sectionId);
          if (section) return section;
        }
        return null;
      },

      getChapterById: (chapterId) => {
        const state = get();
        if (!state.document) return null;
        return state.document.chapters.find((c) => c.id === chapterId) || null;
      },
    }),
    {
      name: 'esg-document-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist only document data, not loading states
      partialize: (state) => ({
        document: state.document,
        activeSectionId: state.activeSectionId,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
