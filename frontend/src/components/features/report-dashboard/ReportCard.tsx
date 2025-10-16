'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, Layers } from 'lucide-react';
import type { APIDocumentListItem } from '@/types/api';

interface ReportCardProps {
  document: APIDocumentListItem;
}

/**
 * 개별 보고서 카드 컴포넌트
 * - 문서 제목, 섹션 수, 최종 수정일 표시
 * - 클릭 시 편집 페이지로 이동
 */
export const ReportCard: React.FC<ReportCardProps> = ({ document }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/report/${document.id}`);
  };

  // 상대 시간 표시 (예: "2시간 전", "3일 전")
  const formatRelativeTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* 템플릿 뱃지 */}
      {document.is_template && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            템플릿
          </span>
        </div>
      )}

      {/* 문서 아이콘 */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <FileText className="text-blue-600" size={24} />
        </div>

        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {document.title}
          </h3>

          {/* 설명 (있는 경우) */}
          {document.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {document.description}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {/* 섹션 수 */}
            <div className="flex items-center gap-1">
              <Layers size={14} />
              <span>{document.section_count}개 섹션</span>
            </div>

            {/* 최종 수정일 */}
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatRelativeTime(document.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 공개 상태 표시 */}
      {document.is_public && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-green-600 font-medium">공개됨</span>
        </div>
      )}
    </div>
  );
};

