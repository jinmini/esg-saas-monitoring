'use client';

import React from 'react';
import { EditorShell } from '@/components/features/report-editor/EditorShell';
import { mockDocument } from '@/lib/mockData';
import { useRouter } from 'next/navigation';

/**
 * ESG Report Editor 테스트 페이지
 * 3-Panel 레이아웃 (EditorShell)
 */
export default function ESGReportEditorPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="w-full h-screen">
      <EditorShell
        documentId={mockDocument.id}
        initialContent={mockDocument}
        onBack={handleBack}
      />
    </div>
  );
}
