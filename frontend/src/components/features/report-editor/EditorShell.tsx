'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useDocument } from '@/hooks/useDocument';
import { useAutosave } from '@/hooks/useAutosave';
import { TopBar } from './toolbar/TopBar';
import { SidebarLeft } from './sidebar/SidebarLeft';
import { SidebarRight } from './sidebar/SidebarRight';
import { Canvas } from './canvas/Canvas';
import { CommandDebugger } from './CommandDebugger';
import { VersionDrawer } from './versions/VersionDrawer';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorShellProps {
  documentId: number; // API ID (number)
  onBack?: () => void;
  // initialContent는 제거 - useDocument hook에서 불러옴
}

/**
 * EditorShell
 * 
 * - useDocument로 문서 불러오기
 * - useAutosave로 자동 저장
 * - 3-Panel 레이아웃 관리
 */
export const EditorShell: React.FC<EditorShellProps> = ({
  documentId,
  onBack,
}) => {
  const { setDocument } = useEditorStore();
  const {
    isSidebarLeftOpen,
    isSidebarRightOpen,
    toggleSidebarLeft,
    toggleSidebarRight,
    setSaveStatus,
    setLastSaved,
    setDirty,
  } = useUIStore();

  // 🔥 문서 불러오기 (React Query)
  const { data: document, isLoading, isError, error } = useDocument(documentId);

  // 🔥 자동 저장 (React Query + Debounce)
  useAutosave(documentId);

  // ✅ 초기 로드 시에만 Zustand store에 저장 (중복 덮어쓰기 방지)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (document && isInitialLoad) {
      setDocument(document);
      setSaveStatus('saved');
      setLastSaved(new Date());
      setDirty(false);
      setIsInitialLoad(false); // 초기 로드 완료
    }
  }, [document, isInitialLoad, setDocument, setSaveStatus, setLastSaved, setDirty]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">문서를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 문서가 없는 경우
  if (!document) {
    return null;
  }

  return (
    <div className="editor-shell h-screen flex flex-col bg-gray-50">
      {/* 상단 바 */}
      <TopBar documentId={String(documentId)} onBack={onBack} />

      {/* 메인 영역: 3-Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 좌측 패널 토글 버튼 (패널이 닫혔을 때) */}
        {!isSidebarLeftOpen && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={toggleSidebarLeft}
            className="absolute left-4 top-4 z-10 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="목차 열기"
          >
            <PanelLeftOpen size={20} />
          </motion.button>
        )}

        {/* 우측 패널 토글 버튼 (패널이 닫혔을 때) */}
        {!isSidebarRightOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={toggleSidebarRight}
            className="absolute right-4 top-4 z-10 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="댓글 열기"
          >
            <PanelRightOpen size={20} />
          </motion.button>
        )}

        {/* 좌측 사이드바 */}
        <AnimatePresence>
          {isSidebarLeftOpen && (
            <div className="relative">
              <SidebarLeft />
              {/* 닫기 버튼 */}
              <button
                onClick={toggleSidebarLeft}
                className="absolute top-2 right-2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="목차 닫기"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          )}
        </AnimatePresence>

        {/* 중앙 캔버스 */}
        <div className="flex-1 overflow-auto">
          <Canvas
            documentId={String(documentId)}
            initialContent={document}
            readOnly={false}
          />
        </div>

        {/* 우측 사이드바 */}
        <AnimatePresence>
          {isSidebarRightOpen && (
            <div className="relative">
              <SidebarRight />
              {/* 닫기 버튼 */}
              <button
                onClick={toggleSidebarRight}
                className="absolute top-2 left-2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="댓글 닫기"
              >
                <PanelRightClose size={16} />
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Command System 디버거 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && <CommandDebugger />}

      {/* Version Drawer */}
      <VersionDrawer documentId={documentId} />
    </div>
  );
};

