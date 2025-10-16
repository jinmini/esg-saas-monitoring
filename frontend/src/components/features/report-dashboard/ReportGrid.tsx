'use client';

import React, { useState } from 'react';
import { Loader2, Search, FileText, Plus } from 'lucide-react';
import type { APIDocumentListItem } from '@/types/api';
import { ReportCard } from './ReportCard';

interface ReportGridProps {
  documents: APIDocumentListItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onCreateNew: () => void;
}

/**
 * 보고서 그리드 컴포넌트
 * - 검색, 필터, 정렬 UI
 * - 로딩/에러/빈 상태 처리
 * - 카드 그리드 레이아웃
 */
export const ReportGrid: React.FC<ReportGridProps> = ({
  documents,
  isLoading,
  isError,
  error,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터 적용
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-600">문서를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="text-red-500 mb-4" size={48} />
        <p className="text-lg font-medium text-gray-900 mb-2">문서를 불러올 수 없습니다</p>
        <p className="text-sm text-gray-600">
          {error?.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
      </div>
    );
  }

  // 빈 상태 (문서가 없음)
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="text-gray-400" size={40} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성된 보고서가 없습니다</h3>
        <p className="text-sm text-gray-600 mb-6">새 보고서를 작성하여 시작해보세요.</p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          새 보고서 작성
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 & 필터 바 */}
      <div className="flex items-center gap-4">
        {/* 검색 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="보고서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 새 보고서 버튼 */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          새 보고서
        </button>
      </div>

      {/* 검색 결과가 없을 때 */}
      {filteredDocuments.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-12">
          <Search className="text-gray-300 mb-3" size={40} />
          <p className="text-gray-600">
            &quot;<span className="font-medium">{searchQuery}</span>&quot;에 대한 검색 결과가 없습니다.
          </p>
        </div>
      )}

      {/* 보고서 카드 그리드 */}
      {filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <ReportCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* 총 문서 수 표시 */}
      <div className="text-sm text-gray-500 text-center pt-4 border-t border-gray-200">
        총 {filteredDocuments.length}개의 보고서
        {searchQuery && ` (검색: "${searchQuery}")`}
      </div>
    </div>
  );
};

