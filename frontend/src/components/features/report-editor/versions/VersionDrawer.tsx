'use client';

import React, { useEffect } from 'react';
import { X, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { VersionList } from './VersionList';

interface VersionDrawerProps {
  documentId: number;
}

/**
 * 버전 관리 사이드 드로어
 * - 우측에서 슬라이드로 열림
 * - 버전 타임라인 표시
 * - 수동 저장 버튼
 * - ESC 키로 닫기
 */
export const VersionDrawer: React.FC<VersionDrawerProps> = ({ documentId }) => {
  const { isVersionDrawerOpen, setVersionDrawerOpen } = useUIStore();

  // ESC 키 닫기 핸들링
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVersionDrawerOpen) {
        setVersionDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVersionDrawerOpen, setVersionDrawerOpen]);

  return (
    <AnimatePresence>
      {isVersionDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVersionDrawerOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <History size={20} className="text-gray-700" />
                <h2 id="version-drawer-title" className="text-lg font-semibold text-gray-900">
                  버전 히스토리
                </h2>
              </div>
              <button
                onClick={() => setVersionDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="닫기"
                aria-label="버전 히스토리 닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <VersionList documentId={documentId} />
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  버전은 수동 저장 시 생성되며, 자동 저장 버전은 3일 후 자동 삭제됩니다.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

