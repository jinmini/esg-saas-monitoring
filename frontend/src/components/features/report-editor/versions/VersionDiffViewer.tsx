'use client';

import React from 'react';
import { X, ArrowRight, Plus, Minus, Edit3, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VersionDiffResponse, SectionDiff } from '@/types/api';

interface VersionDiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  diff: VersionDiffResponse | null;
  isLoading?: boolean;
}

/**
 * 버전 Diff 뷰어
 * - 두 버전 간 차이점을 시각화
 * - 추가/삭제/수정된 섹션 및 블록 표시
 * - 통계 정보 제공
 */
export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  isOpen,
  onClose,
  diff,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="diff-viewer-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <div>
                  <h2 id="diff-viewer-title" className="text-xl font-semibold text-gray-900">
                    버전 비교
                  </h2>
                  {diff && (
                    <p className="text-sm text-gray-600 mt-1">
                      v{diff.source_version}
                      <ArrowRight size={14} className="inline mx-2" />
                      {diff.target_version ? `v${diff.target_version}` : '현재 문서'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              )}

              {!isLoading && diff && (
                <div className="space-y-6">
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-4 gap-4">
                    <StatCard
                      icon={<Plus size={20} />}
                      label="추가된 블록"
                      value={diff.blocks_added}
                      color="green"
                    />
                    <StatCard
                      icon={<Minus size={20} />}
                      label="삭제된 블록"
                      value={diff.blocks_removed}
                      color="red"
                    />
                    <StatCard
                      icon={<Edit3 size={20} />}
                      label="수정된 블록"
                      value={diff.blocks_modified}
                      color="blue"
                    />
                    <StatCard
                      icon={<FileText size={20} />}
                      label="변경된 문자"
                      value={diff.chars_changed}
                      color="gray"
                    />
                  </div>

                  {/* 섹션 변경사항 */}
                  <div className="space-y-4">
                    {/* 추가된 섹션 */}
                    {diff.sections_added.length > 0 && (
                      <ChangeSection
                        title="추가된 섹션"
                        items={diff.sections_added}
                        type="added"
                      />
                    )}

                    {/* 삭제된 섹션 */}
                    {diff.sections_removed.length > 0 && (
                      <ChangeSection
                        title="삭제된 섹션"
                        items={diff.sections_removed}
                        type="removed"
                      />
                    )}

                    {/* 수정된 섹션 */}
                    {diff.sections_modified.length > 0 && (
                      <ModifiedSections sections={diff.sections_modified} />
                    )}

                    {/* 변경사항 없음 */}
                    {diff.sections_added.length === 0 &&
                      diff.sections_removed.length === 0 &&
                      diff.sections_modified.length === 0 && (
                        <div className="text-center py-12">
                          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-600 font-medium">
                            두 버전 간 변경사항이 없습니다
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            문서 내용이 동일합니다.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {!isLoading && !diff && (
                <div className="text-center py-12">
                  <p className="text-gray-600">비교 데이터를 불러올 수 없습니다.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ===== Helper Components =====

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} flex items-center gap-3`}
    >
      <div>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium opacity-80">{label}</div>
      </div>
    </div>
  );
};

interface ChangeSectionProps {
  title: string;
  items: string[];
  type: 'added' | 'removed';
}

const ChangeSection: React.FC<ChangeSectionProps> = ({ title, items, type }) => {
  const Icon = type === 'added' ? Plus : Minus;
  const colorClasses =
    type === 'added'
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200';
  const iconColor = type === 'added' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`p-4 rounded-lg border ${colorClasses}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={iconColor} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-600">({items.length}개)</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ModifiedSectionsProps {
  sections: SectionDiff[];
}

const ModifiedSections: React.FC<ModifiedSectionsProps> = ({ sections }) => {
  return (
    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <Edit3 size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">수정된 섹션</h3>
        <span className="text-sm text-gray-600">({sections.length}개)</span>
      </div>
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={index}
            className="p-3 bg-white rounded-md border border-blue-100"
          >
            <div className="font-medium text-gray-900 mb-2">
              {section.section_title}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Plus size={14} className="text-green-600" />
                {section.changes.blocks_added}개 추가
              </span>
              <span className="flex items-center gap-1">
                <Minus size={14} className="text-red-600" />
                {section.changes.blocks_removed}개 삭제
              </span>
              <span className="flex items-center gap-1">
                <Edit3 size={14} className="text-blue-600" />
                {section.changes.blocks_modified}개 수정
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

