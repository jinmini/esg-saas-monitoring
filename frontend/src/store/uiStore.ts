import { create } from 'zustand';

/**
 * 에디터 UI 상태 관리 Store
 * 패널 열림/닫힘, 저장 상태, 선택된 요소 등
 */
interface UIState {
  // 패널 상태
  isSidebarLeftOpen: boolean;
  isSidebarRightOpen: boolean;
  isGlobalSidebarOpen: boolean; // 글로벌 사이드바 (DashboardLayout)
  isGlobalSidebarCollapsed: boolean; // 글로벌 사이드바 축소 모드
  
  // 선택 상태
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  
  // 저장 상태
  saveStatus: 'idle' | 'edited' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved: Date | null;
  
  // 더티 플래그 (수정 여부)
  isDirty: boolean;
  
  // 모달/드로어 상태
  isVersionDrawerOpen: boolean;
  isPermissionDrawerOpen: boolean;
  isCommentModalOpen: boolean;
}

interface UIActions {
  // 패널 토글
  toggleSidebarLeft: () => void;
  toggleSidebarRight: () => void;
  setSidebarLeft: (open: boolean) => void;
  setSidebarRight: (open: boolean) => void;
  toggleGlobalSidebar: () => void;
  setGlobalSidebar: (open: boolean) => void;
  toggleGlobalSidebarCollapse: () => void;
  setGlobalSidebarCollapsed: (collapsed: boolean) => void;
  
  // 선택 상태
  setSelectedSection: (sectionId: string | null) => void;
  setSelectedBlock: (blockId: string | null) => void;
  
  // 저장 상태
  setSaveStatus: (status: UIState['saveStatus']) => void;
  setLastSaved: (date: Date) => void;
  setDirty: (dirty: boolean) => void;
  
  // 모달/드로어
  toggleVersionDrawer: () => void;
  setVersionDrawerOpen: (open: boolean) => void;
  togglePermissionDrawer: () => void;
  toggleCommentModal: () => void;
  
  // 초기화
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  isSidebarLeftOpen: true,
  isSidebarRightOpen: true,
  isGlobalSidebarOpen: true,
  isGlobalSidebarCollapsed: false,
  selectedSectionId: null,
  selectedBlockId: null,
  saveStatus: 'idle',
  lastSaved: null,
  isDirty: false,
  isVersionDrawerOpen: false,
  isPermissionDrawerOpen: false,
  isCommentModalOpen: false,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,

  // 패널 토글
  toggleSidebarLeft: () => set((state) => ({ isSidebarLeftOpen: !state.isSidebarLeftOpen })),
  toggleSidebarRight: () => set((state) => ({ isSidebarRightOpen: !state.isSidebarRightOpen })),
  setSidebarLeft: (open) => set({ isSidebarLeftOpen: open }),
  setSidebarRight: (open) => set({ isSidebarRightOpen: open }),
  toggleGlobalSidebar: () => set((state) => ({ isGlobalSidebarOpen: !state.isGlobalSidebarOpen })),
  setGlobalSidebar: (open) => set({ isGlobalSidebarOpen: open }),
  toggleGlobalSidebarCollapse: () => set((state) => ({ isGlobalSidebarCollapsed: !state.isGlobalSidebarCollapsed })),
  setGlobalSidebarCollapsed: (collapsed) => set({ isGlobalSidebarCollapsed: collapsed }),

  // 선택 상태
  setSelectedSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),

  // 저장 상태
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSaved: (date) => set({ lastSaved: date }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  // 모달/드로어
  toggleVersionDrawer: () => set((state) => ({ isVersionDrawerOpen: !state.isVersionDrawerOpen })),
  setVersionDrawerOpen: (open) => set({ isVersionDrawerOpen: open }),
  togglePermissionDrawer: () => set((state) => ({ isPermissionDrawerOpen: !state.isPermissionDrawerOpen })),
  toggleCommentModal: () => set((state) => ({ isCommentModalOpen: !state.isCommentModalOpen })),

  // 초기화
  reset: () => set(initialState),
}));

