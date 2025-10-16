'use client';

import React, { useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestoreVersion } from '@/hooks/useRestoreVersion';
import type { VersionMetadata } from '@/types/api';

interface RestoreConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  version: VersionMetadata;
  documentId: number;
}

/**
 * 버전 복원 확인 다이얼로그
 * - 복원 경고 메시지
 * - 현재 상태 자동 백업 안내
 * - 복원 실행
 * - ESC 키로 닫기
 * - 접근성 지원
 */
export const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
  isOpen,
  onClose,
  version,
  documentId,
}) => {
  // 안전 가드: version이 없으면 렌더링하지 않음
  if (!version) return null;
  const { mutate: restoreVersion, isPending } = useRestoreVersion({
    onSuccess: (result) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Version restored:', result);
      }
      
      // 성공 애니메이션 후 닫기
      setTimeout(() => {
        onClose();
      }, 400);
      
      // TODO: Toast 메시지 표시
      // toast.success(
      //   `버전 v${result.restored_version_number} 복원 완료\n` +
      //   `현재 상태는 버전 v${result.backup_version_number}에 백업됨`
      // );
    },
    onError: (error) => {
      console.error('❌ Failed to restore version:', error);
      // TODO: Toast 에러 메시지 표시
      // toast.error('버전 복원 실패');
    },
  });

  const handleConfirm = () => {
    restoreVersion({
      documentId,
      versionId: version.id,
    });
  };

  const handleCancel = () => {
    if (!isPending) {
      onClose();
    }
  };

  // ESC 키 닫기 핸들링
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isPending]);

  // 날짜 포맷팅 (명확한 형식)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-confirm-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            {/* Loading Overlay */}
            {isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <RotateCcw size={20} className="text-orange-600" />
                <h2 id="restore-confirm-title" className="text-lg font-semibold text-gray-900">
                  버전 복원 확인
                </h2>
              </div>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-orange-900 mb-1">
                    현재 문서가 이전 버전으로 대체됩니다
                  </p>
                  <p className="text-orange-700">
                    현재 상태는 자동으로 새 버전에 백업되며, 언제든지 되돌릴 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Version Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">복원할 버전</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      v{version.version_number}
                    </span>
                    {version.is_auto_saved && (
                      <span className="text-xs text-gray-500">(자동)</span>
                    )}
                  </div>
                </div>

                {version.comment && (
                  <div className="text-sm">
                    <span className="text-gray-600">설명:</span>{' '}
                    <span className="text-gray-900">{version.comment}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText size={12} />
                  <span>
                    {version.sections_count}개 섹션 · {version.blocks_count}개 블록 · {version.chars_count}자
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  생성: {formatDate(version.created_at)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
                복원하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

