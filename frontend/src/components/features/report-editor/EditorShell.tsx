'use client';

import React, { useEffect } from 'react';
import { DocumentNode } from '@/types/editor/document';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { TopBar } from './toolbar/TopBar';
import { SidebarLeft } from './sidebar/SidebarLeft';
import { SidebarRight } from './sidebar/SidebarRight';
import { Canvas } from './canvas/Canvas';
import { CommandDebugger } from './CommandDebugger';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorShellProps {
  documentId: string;
  initialContent: DocumentNode;
  onBack?: () => void;
}

 
export const EditorShell: React.FC<EditorShellProps> = ({
  documentId,
  initialContent,
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
  } = useUIStore();

  // 초기 문서 로드
  useEffect(() => {
    setDocument(initialContent);
    setSaveStatus('saved');
    setLastSaved(new Date());
  }, [initialContent, setDocument, setSaveStatus, setLastSaved]);

  // 자동 저장 시뮬레이션 (3초 후)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSaved(new Date());
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setSaveStatus, setLastSaved]);

  return (
    <div className="editor-shell h-screen flex flex-col bg-gray-50">
      {/* 상단 바 */}
      <TopBar documentId={documentId} onBack={onBack} />

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
            documentId={documentId}
            initialContent={initialContent}
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
    </div>
  );
};

