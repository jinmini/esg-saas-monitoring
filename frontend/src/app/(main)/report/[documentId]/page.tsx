'use client';

import React, { useMemo } from 'react';
import { EditorShell } from '@/components/features/report-editor/EditorShell';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout'; // 에러 화면용
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function ESGReportEditorPage() {
  const router = useRouter();
  const params = useParams();

  // 1. documentId 파싱 및 유효성 검사 (메모이제이션)
  const documentId = useMemo(() => {
    // params.documentId가 배열일 수도 있으므로 첫 번째 값만 취하거나 string으로 변환
    const idStr = Array.isArray(params.documentId) 
      ? params.documentId[0] 
      : params.documentId;
      
    if (!idStr) return null;
    
    const parsed = Number(idStr);
    return isNaN(parsed) ? null : parsed;
  }, [params.documentId]);

  const handleBack = () => {
    router.push('/report/dashboard');
  };

  // 2. 에러 UI 개선: DashboardLayout을 활용해 일관성 유지
  if (!documentId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-6">
          <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              문서를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              요청하신 문서 ID가 유효하지 않거나 삭제되었을 수 있습니다.<br/>
              대시보드로 돌아가서 다시 시도해주세요.
            </p>
            
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 font-medium transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 3. 정상 렌더링: 에디터는 전체 화면을 써야 하므로 Layout 없이 렌더링
  return (
    <div className="w-full h-screen bg-white">
      <EditorShell
        documentId={documentId}
        onBack={handleBack}
      />
    </div>
  );
}