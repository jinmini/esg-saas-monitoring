'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

// Mock 템플릿 데이터
export const TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: '빈 문서',
    description: '처음부터 시작하는 빈 문서입니다.',
    icon: <FileText size={32} className="text-gray-600" />,
  },
  {
    id: 'gri',
    name: 'GRI 표준 연간 보고서',
    description: 'GRI Standards 기반의 지속가능성 보고서 템플릿입니다.',
    icon: <Sparkles size={32} className="text-blue-600" />,
  },
  {
    id: 'tcfd',
    name: 'TCFD 기후 대응 보고서',
    description: 'TCFD 권고안을 준수하는 기후변화 대응 보고서 템플릿입니다.',
    icon: <Sparkles size={32} className="text-green-600" />,
  },
  {
    id: 'monthly',
    name: '월간 내부 보고서',
    description: '간편하게 작성하는 월간 리포트 템플릿입니다.',
    icon: <Sparkles size={32} className="text-purple-600" />,
  },
];

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string, title: string) => void;
  isPending?: boolean;
}

/**
 * 템플릿 선택 모달 컴포넌트
 * - 빈 문서 또는 사전 정의된 템플릿 선택
 * - 문서 제목 입력
 */
export const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  isPending = false,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const [title, setTitle] = useState('');

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onClose]);

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId('blank');
      setTitle('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSelect(selectedTemplateId, title.trim());
  };

  const handleCancel = () => {
    if (!isPending) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 id="template-modal-title" className="text-xl font-semibold text-gray-900">
                새 보고서 작성
              </h2>
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* 템플릿 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    템플릿 선택
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        disabled={isPending}
                        className={`p-4 border-2 rounded-lg text-left transition-all disabled:opacity-50 ${
                          selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">
                              {template.name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 문서 제목 입력 */}
                <div>
                  <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-2">
                    문서 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="document-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 2025년 ESG 보고서"
                    disabled={isPending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    maxLength={200}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length} / 200
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
                  disabled={!title.trim() || isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? '생성 중...' : '보고서 생성'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

