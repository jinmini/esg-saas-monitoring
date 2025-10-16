'use client';

import React, { useState } from 'react';
import { Clock, FileText, User, RotateCcw, Trash2, GitCompare } from 'lucide-react';
import type { VersionMetadata } from '@/types/api';
import { RestoreConfirmDialog } from './RestoreConfirmDialog';

interface VersionItemProps {
  version: VersionMetadata;
  documentId: number;
  onCompare?: (versionId: number) => void;
}

/**
 * 개별 버전 카드
 * - 버전 정보 표시
 * - 복원 버튼
 * - 삭제 버튼 (최신 버전 아닌 경우)
 */
export const VersionItem: React.FC<VersionItemProps> = ({ 
  version, 
  documentId,
  onCompare 
}) => {
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  const isAutoSaved = version.is_auto_saved;

  return (
    <>
      <div className="p-4 hover:bg-gray-50 transition-colors group">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${
                isAutoSaved
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              v{version.version_number}
            </div>
            {isAutoSaved && (
              <span className="text-xs text-gray-500">(자동)</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCompare && (
              <button
                onClick={() => onCompare(version.id)}
                className="p-1.5 hover:bg-purple-50 text-purple-600 rounded transition-colors"
                title="현재 문서와 비교"
              >
                <GitCompare size={14} />
              </button>
            )}
            <button
              onClick={() => setIsRestoreDialogOpen(true)}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
              title="이 버전으로 복원"
            >
              <RotateCcw size={14} />
            </button>
            {/* 삭제 버튼은 Phase 1.3에서 구현 */}
          </div>
        </div>

        {/* Comment */}
        {version.comment && (
          <p className="text-sm text-gray-900 mb-2 line-clamp-2">
            {version.comment}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <time dateTime={version.created_at}>
              {formatDateTime(version.created_at)}
            </time>
          </div>
          
          {version.author_name && (
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>{version.author_name}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <FileText size={12} />
            <span>
              {version.sections_count}개 섹션 · {version.blocks_count}개 블록
            </span>
          </div>
        </div>
      </div>

      {/* Restore Confirm Dialog */}
      <RestoreConfirmDialog
        isOpen={isRestoreDialogOpen}
        onClose={() => setIsRestoreDialogOpen(false)}
        version={version}
        documentId={documentId}
      />
    </>
  );
};

/**
 * 날짜 포맷팅
 * 예: "2025-01-15 14:30"
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 1분 미만
  if (minutes < 1) return '방금';
  // 1시간 미만
  if (minutes < 60) return `${minutes}분 전`;
  // 24시간 미만
  if (hours < 24) return `${hours}시간 전`;
  // 7일 미만
  if (days < 7) return `${days}일 전`;

  // 그 이상은 날짜 표시
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  // 올해면 년도 생략
  if (year === now.getFullYear()) {
    return `${month}-${day} ${hour}:${minute}`;
  }
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

