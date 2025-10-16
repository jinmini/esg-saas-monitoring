'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateVersion } from '@/hooks/useCreateVersion';

interface CreateVersionDialogProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 수동 버전 저장 다이얼로그
 * - 버전 설명(comment) 입력
 * - 버전 생성 mutation 실행
 * - ESC 키로 닫기
 * - 접근성 지원
 */
export const CreateVersionDialog: React.FC<CreateVersionDialogProps> = ({
  documentId,
  isOpen,
  onClose,
}) => {
  const [comment, setComment] = useState('');
  
  const { mutate: createVersion, isPending } = useCreateVersion({
    onSuccess: (version) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Version created:', version);
      }
      
      // 성공 애니메이션 후 닫기
      setTimeout(() => {
        setComment('');
        onClose();
      }, 300);
      
      // TODO: Toast 메시지 표시
      // toast.success(`버전 v${version.version_number} 저장 완료`);
    },
    onError: (error) => {
      console.error('❌ Failed to create version:', error);
      // TODO: Toast 에러 메시지 표시
      // toast.error('버전 저장 실패');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createVersion({
      documentId,
      data: {
        comment: comment.trim() || undefined,
        is_auto_saved: false,
      },
    });
  };

  const handleCancel = () => {
    if (!isPending) {
      setComment('');
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
            aria-labelledby="create-version-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Save size={20} className="text-blue-600" />
                  <h2 id="create-version-title" className="text-lg font-semibold text-gray-900">
                    버전 저장
                  </h2>
                </div>
                <button
                  type="button"
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
                <div>
                  <label
                    htmlFor="version-comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    버전 설명 (선택사항)
                  </label>
                  <textarea
                    id="version-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isPending}
                    placeholder="예: 초안 완성 / 검토 반영 / 승인본 저장"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    maxLength={500}
                    aria-describedby="version-comment-hint"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p id="version-comment-hint" className="text-xs text-gray-500">
                      변경사항을 간단히 설명해주세요.
                    </p>
                    <span className="text-xs text-gray-400">
                      {comment.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      저장
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

