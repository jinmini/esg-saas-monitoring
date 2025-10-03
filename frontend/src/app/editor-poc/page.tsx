'use client';

import React, { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { DocumentOutline } from '@/components/editor/DocumentOutline';
import { useDocumentStore } from '@/store/documentStore';
import { FileEdit, Save, Download, AlertCircle } from 'lucide-react';

export default function EditorPocPage() {
  const { 
    document, 
    activeSectionId, 
    getActiveSection, 
    updateSection 
  } = useDocumentStore();
  
  const activeSection = getActiveSection();

  // 에디터 내용 변경 시 섹션 업데이트
  const handleContentChange = (html: string) => {
    if (activeSectionId) {
      updateSection(activeSectionId, { content: html });
    }
  };

  // 전체 문서 저장 (로컬스토리지에 저장)
  const handleSave = () => {
    try {
      localStorage.setItem('esg-document', JSON.stringify(document));
      alert('문서가 저장되었습니다!');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('문서 저장에 실패했습니다.');
    }
  };

  // HTML 내보내기
  const handleExport = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px; }
        h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
        h2 { color: #166534; margin-top: 40px; }
        h3 { color: #15803d; margin-top: 30px; }
        .chapter { margin-bottom: 60px; }
        .section { margin-bottom: 40px; padding: 20px; background: #f9fafb; border-left: 4px solid #16a34a; }
    </style>
</head>
<body>
    <h1>${document.title}</h1>
    ${document.chapters
      .map(
        (chapter) => `
        <div class="chapter">
            <h2>${chapter.title}</h2>
            ${chapter.sections
              .map(
                (section) => `
                <div class="section">
                    <h3>${section.title}</h3>
                    ${section.content}
                </div>
            `
              )
              .join('')}
        </div>
    `
      )
      .join('')}
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 페이지 로드 시 로컬스토리지에서 복원 (옵션)
  useEffect(() => {
    const saved = localStorage.getItem('esg-document');
    if (saved && window.confirm('저장된 문서를 불러오시겠습니까?')) {
      try {
        const parsed = JSON.parse(saved);
        // setDocument(parsed); // 필요시 활성화
      } catch (error) {
        console.error('문서 로드 실패:', error);
      }
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left: Document Outline */}
        <DocumentOutline className="w-80 flex-shrink-0" />

        {/* Right: Editor Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileEdit className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {document.title}
                  </h1>
                  {activeSection && (
                    <p className="text-sm text-gray-600">
                      편집 중: {activeSection.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>저장</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>HTML 내보내기</span>
                </button>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm font-medium mb-1">
                🚀 Sprint 7.5: 구조화된 문서 저작 도구 (Structured Document)
              </p>
              <p className="text-blue-600 text-xs">
                왼쪽에서 챕터/섹션을 관리하고, 각 섹션을 독립적으로 편집할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 p-6 overflow-hidden">
            {activeSection ? (
              <div className="h-full">
                <TiptapEditor
                  key={activeSection.id}
                  content={activeSection.content}
                  onChange={handleContentChange}
                  placeholder={`${activeSection.title} 내용을 입력하세요...`}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">섹션을 선택하세요</h3>
                  <p className="text-sm">
                    왼쪽 목록에서 편집할 섹션을 클릭하세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {activeSection && (
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">문자 수:</span>{' '}
                  {activeSection.content.replace(/<[^>]*>/g, '').length}
                </div>
                <div>
                  <span className="font-medium">단어 수:</span>{' '}
                  {activeSection.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
                </div>
                <div>
                  <span className="font-medium">마지막 수정:</span>{' '}
                  {new Date(activeSection.updatedAt).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
