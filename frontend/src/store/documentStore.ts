import { create } from 'zustand';
import { Document, DocumentChapter, DocumentSection, DocumentStore } from '@/types/document';

/**
 * ESG 보고서 기본 템플릿
 * 환경(E), 사회(S), 거버넌스(G) 3대 축 구조
 */
const createESGTemplate = (): Document => {
  const now = new Date();
  
  return {
    id: 'doc-1',
    title: 'ESG 보고서 2025',
    description: 'ESG 통합 보고서',
    chapters: [
      {
        id: 'chapter-1',
        title: '환경 (Environmental)',
        order: 1,
        isCollapsed: false,
        createdAt: now,
        updatedAt: now,
        sections: [
          {
            id: 'section-1-1',
            title: '기후변화 대응',
            content: '<h2>기후변화 대응</h2><p>기후변화 대응 전략을 입력하세요...</p>',
            order: 1,
            chapterId: 'chapter-1',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-1-2',
            title: '에너지 관리',
            content: '<h2>에너지 관리</h2><p>에너지 효율화 및 재생에너지 사용 현황을 입력하세요...</p>',
            order: 2,
            chapterId: 'chapter-1',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-1-3',
            title: '자원 순환',
            content: '<h2>자원 순환</h2><p>폐기물 관리 및 재활용 정책을 입력하세요...</p>',
            order: 3,
            chapterId: 'chapter-1',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'chapter-2',
        title: '사회 (Social)',
        order: 2,
        isCollapsed: false,
        createdAt: now,
        updatedAt: now,
        sections: [
          {
            id: 'section-2-1',
            title: '인권 및 노동',
            content: '<h2>인권 및 노동</h2><p>근무 환경 및 인권 정책을 입력하세요...</p>',
            order: 1,
            chapterId: 'chapter-2',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-2-2',
            title: '다양성 및 포용',
            content: '<h2>다양성 및 포용</h2><p>다양성 증진 및 포용적 문화 조성 활동을 입력하세요...</p>',
            order: 2,
            chapterId: 'chapter-2',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-2-3',
            title: '지역사회 공헌',
            content: '<h2>지역사회 공헌</h2><p>사회공헌 활동 및 지역사회 협력 사례를 입력하세요...</p>',
            order: 3,
            chapterId: 'chapter-2',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      {
        id: 'chapter-3',
        title: '거버넌스 (Governance)',
        order: 3,
        isCollapsed: false,
        createdAt: now,
        updatedAt: now,
        sections: [
          {
            id: 'section-3-1',
            title: '이사회 구조',
            content: '<h2>이사회 구조</h2><p>이사회 구성 및 운영 현황을 입력하세요...</p>',
            order: 1,
            chapterId: 'chapter-3',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-3-2',
            title: '윤리 경영',
            content: '<h2>윤리 경영</h2><p>윤리강령 및 준법경영 체계를 입력하세요...</p>',
            order: 2,
            chapterId: 'chapter-3',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'section-3-3',
            title: '리스크 관리',
            content: '<h2>리스크 관리</h2><p>리스크 관리 체계 및 내부통제 시스템을 입력하세요...</p>',
            order: 3,
            chapterId: 'chapter-3',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Zustand 문서 관리 스토어
 */
export const useDocumentStore = create<DocumentStore>((set, get) => ({
  document: createESGTemplate(),
  activeSectionId: 'section-1-1', // 기본값: 첫 번째 섹션

  // Document 관리
  setDocument: (document) => set({ document }),
  
  updateDocumentTitle: (title) =>
    set((state) => ({
      document: { ...state.document, title, updatedAt: new Date() },
    })),

  // Chapter 관리
  addChapter: (title) =>
    set((state) => {
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
    set((state) => ({
      document: {
        ...state.document,
        chapters: state.document.chapters.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, title, updatedAt: new Date() }
            : chapter
        ),
        updatedAt: new Date(),
      },
    })),

  deleteChapter: (chapterId) =>
    set((state) => ({
      document: {
        ...state.document,
        chapters: state.document.chapters.filter((chapter) => chapter.id !== chapterId),
        updatedAt: new Date(),
      },
      // 삭제된 챕터의 섹션이 활성화되어 있으면 초기화
      activeSectionId: state.document.chapters
        .find((c) => c.id === chapterId)
        ?.sections.some((s) => s.id === state.activeSectionId)
        ? null
        : state.activeSectionId,
    })),

  toggleChapterCollapse: (chapterId) =>
    set((state) => ({
      document: {
        ...state.document,
        chapters: state.document.chapters.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, isCollapsed: !chapter.isCollapsed }
            : chapter
        ),
      },
    })),

  // Section 관리
  addSection: (chapterId, title) =>
    set((state) => {
      const chapter = state.document.chapters.find((c) => c.id === chapterId);
      if (!chapter) return state;

      const newSection: DocumentSection = {
        id: `section-${Date.now()}`,
        title,
        content: `<h2>${title}</h2><p>내용을 입력하세요...</p>`,
        order: chapter.sections.length + 1,
        chapterId,
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
    set((state) => ({
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
    })),

  deleteSection: (sectionId) =>
    set((state) => ({
      document: {
        ...state.document,
        chapters: state.document.chapters.map((chapter) => ({
          ...chapter,
          sections: chapter.sections.filter((section) => section.id !== sectionId),
        })),
        updatedAt: new Date(),
      },
      activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
    })),

  setActiveSection: (sectionId) => set({ activeSectionId: sectionId }),

  // Getter 헬퍼
  getActiveSection: () => {
    const state = get();
    if (!state.activeSectionId) return null;
    return state.getSectionById(state.activeSectionId);
  },

  getSectionById: (sectionId) => {
    const state = get();
    for (const chapter of state.document.chapters) {
      const section = chapter.sections.find((s) => s.id === sectionId);
      if (section) return section;
    }
    return null;
  },

  getChapterById: (chapterId) => {
    const state = get();
    return state.document.chapters.find((c) => c.id === chapterId) || null;
  },
}));

