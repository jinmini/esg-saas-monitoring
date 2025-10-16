'use client';

import React, { useState } from 'react';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { useVersions } from '@/hooks/useVersions';
import { useVersionDiff } from '@/hooks/useVersionDiff';
import { VersionItem } from './VersionItem';
import { CreateVersionDialog } from './CreateVersionDialog';
import { VersionDiffViewer } from './VersionDiffViewer';

interface VersionListProps {
  documentId: number;
}

/**
 * 버전 타임라인 리스트
 * - 버전 목록 조회 및 표시
 * - 자동 저장 버전 필터링
 * - 무한 스크롤 (향후 구현)
 */
export const VersionList: React.FC<VersionListProps> = ({ documentId }) => {
  const [includeAutoSaved, setIncludeAutoSaved] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDiffViewerOpen, setIsDiffViewerOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useVersions(documentId, {
    includeAutoSaved,
    limit: 50,
  });

  // Diff 데이터 fetch
  const { data: diffData, isLoading: isDiffLoading } = useVersionDiff({
    documentId,
    sourceVersionId: selectedVersionId,
    targetVersionId: null, // 현재 문서와 비교
    enabled: isDiffViewerOpen && selectedVersionId !== null,
  });

  const handleCompare = (versionId: number) => {
    setSelectedVersionId(versionId);
    setIsDiffViewerOpen(true);
  };

  const handleCloseDiff = () => {
    setIsDiffViewerOpen(false);
    setSelectedVersionId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* 수동 저장 버튼 */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          수동 버전 저장
        </button>

        {/* 필터 토글 */}
        <button
          onClick={() => setIncludeAutoSaved((v) => !v)}
          className={`flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
            includeAutoSaved
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter size={14} />
          {includeAutoSaved ? '자동 저장 포함 중' : '수동 저장만 보기'}
        </button>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">
              버전 목록을 불러오는데 실패했습니다.
            </p>
            {process.env.NODE_ENV === 'development' && error instanceof Error && (
              <p className="text-xs text-gray-500 mt-1">{error.message}</p>
            )}
          </div>
        )}

        {data && data.versions.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <Plus size={20} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              저장된 버전이 없습니다
            </p>
            <p className="text-xs text-gray-500">
              "수동 버전 저장" 버튼을 눌러 첫 버전을 생성하세요.
            </p>
          </div>
        )}

        {data && data.versions.length > 0 && (
          <div className="divide-y divide-gray-200">
            {data.versions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                documentId={documentId}
                onCompare={handleCompare}
              />
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {data && data.has_next && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 mb-2">
              {data.versions.length} / {data.total} 버전 표시 중
            </p>
            {/* 향후: 더 보기 버튼 구현 예정 */}
          </div>
        )}
      </div>

      {/* Create Version Dialog */}
      <CreateVersionDialog
        documentId={documentId}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Version Diff Viewer */}
      <VersionDiffViewer
        isOpen={isDiffViewerOpen}
        onClose={handleCloseDiff}
        diff={diffData || null}
        isLoading={isDiffLoading}
      />
    </div>
  );
};

