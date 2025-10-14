'use client';

import React from 'react';
import { EditorShell } from '@/components/features/report-editor/EditorShell';
import { useRouter, useParams } from 'next/navigation';

/**
 * ESG Report Editor 페이지
 * 
 * - URL 파라미터에서 documentId 추출
 * - EditorShell이 useDocument로 자동 로드
 * - initialContent 제거 (API에서 불러옴)
 */
export default function ESGReportEditorPage() {
  const router = useRouter();
  const params = useParams();
  
  // URL 파라미터에서 documentId 추출
  const documentId = params.documentId ? Number(params.documentId) : null;

  const handleBack = () => {
    router.push('/');
  };

  // documentId가 없거나 유효하지 않은 경우
  if (!documentId || isNaN(documentId)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">잘못된 문서 ID</h2>
          <p className="text-gray-600 mb-4">유효한 문서 ID를 입력해주세요.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <EditorShell
        documentId={documentId}
        onBack={handleBack}
      />
    </div>
  );
}
