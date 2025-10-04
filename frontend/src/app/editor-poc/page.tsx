'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { DocumentOutline } from '@/components/editor/DocumentOutline';
import { useDocumentStore } from '@/store/documentStore';
import { FileEdit, Save, Download, AlertCircle, Upload, FileText } from 'lucide-react';

export default function EditorPocPage() {
  const { 
    document, 
    activeSectionId, 
    getActiveSection, 
    updateSection,
    loadTemplate,
    saveDocument,
    isLoading,
    isSaving,
    lastSavedAt,
  } = useDocumentStore();
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const activeSection = getActiveSection();

  // 초기 템플릿 로드 (ID: 1)
  useEffect(() => {
    if (!document) {
      loadTemplate(1).catch((error) => {
        console.error('템플릿 로드 실패:', error);
        alert('템플릿을 불러오는데 실패했습니다.');
      });
    }
  }, [document, loadTemplate]);

  // 에디터 내용 변경 시 섹션 업데이트
  const handleContentChange = (html: string) => {
    if (activeSectionId) {
      updateSection(activeSectionId, { content: html });
    }
  };

  // 백엔드에 저장
  const handleSave = async () => {
    if (!document) return;
    
    setSaveStatus('saving');
    try {
      const documentId = typeof document.id === 'number' ? document.id : undefined;
      await saveDocument(documentId);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveStatus('error');
      alert('문서 저장에 실패했습니다.');
    }
  };

  // HTML 내보내기
  const handleExport = () => {
    if (!document) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px; line-height: 1.6; }
        h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; margin-top: 40px; }
        h2 { color: #166534; margin-top: 30px; border-left: 4px solid #16a34a; padding-left: 12px; }
        h3 { color: #15803d; margin-top: 20px; }
        p { margin: 12px 0; color: #374151; }
        .chapter { margin-bottom: 60px; page-break-after: always; }
        .section { margin-bottom: 40px; }
    </style>
</head>
<body>
    <h1>${document.title}</h1>
    ${document.description ? `<p><em>${document.description}</em></p>` : ''}
    
    ${document.chapters.map(chapter => `
        <div class="chapter">
            <h1>${chapter.title}</h1>
            ${chapter.sections.map(section => `
                <div class="section">
                    ${section.content}
                </div>
            `).join('\n')}
        </div>
    `).join('\n')}
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9가-힣]/gi, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !document) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">문서를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileEdit className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ESG 보고서 에디터
              </h1>
              <p className="text-xs text-gray-500">
                {lastSavedAt ? `마지막 저장: ${new Date(lastSavedAt).toLocaleTimeString()}` : '저장되지 않음'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Template Load */}
            <button
              onClick={() => {
                if (confirm('템플릿을 다시 불러오시겠습니까? 현재 작업 내용이 사라집니다.')) {
                  loadTemplate(1);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>템플릿 불러오기</span>
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-100 text-green-700'
                  : saveStatus === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving ? '저장 중...' : saveStatus === 'saved' ? '저장 완료!' : '저장'}
              </span>
            </button>

            {/* Export */}
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
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center space-x-2 text-blue-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            <p>
              <strong>Sprint 7 POC:</strong> 백엔드 API 연동 완료 - 템플릿 로드, 문서 저장, HTML 내보내기 기능 구현
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Document Outline */}
          <DocumentOutline className="w-80 flex-shrink-0" />

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
            {activeSection ? (
              <div className="flex-1 overflow-hidden p-6">
                <div className="h-full">
                  <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {activeSection.title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        마지막 수정: {new Date(activeSection.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <TiptapEditor
                        content={activeSection.content}
                        onChange={handleContentChange}
                        placeholder="섹션 내용을 입력하세요..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">섹션을 선택하세요</p>
                  <p className="text-sm mt-2">왼쪽에서 챕터 및 섹션을 선택하여 내용을 편집할 수 있습니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
