'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { ChapterItem } from './ChapterItem';
import { Plus, FileText } from 'lucide-react';

interface DocumentOutlineProps {
  className?: string;
}

export function DocumentOutline({ className }: DocumentOutlineProps) {
  const { document, addChapter, updateDocumentTitle } = useDocumentStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(document.title);

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      updateDocumentTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleAddChapter = () => {
    const title = window.prompt('새 챕터 이름을 입력하세요:');
    if (title && title.trim()) {
      addChapter(title.trim());
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-green-600" />
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTempTitle(document.title);
                  setIsEditingTitle(false);
                }
              }}
              className="flex-1 text-sm font-semibold border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h2
              className="flex-1 text-sm font-semibold text-gray-900 cursor-pointer hover:text-green-600"
              onClick={() => setIsEditingTitle(true)}
              title="클릭하여 제목 수정"
            >
              {document.title}
            </h2>
          )}
        </div>
        
        <button
          onClick={handleAddChapter}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>챕터 추가</span>
        </button>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {document.chapters.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>챕터가 없습니다.</p>
            <p className="text-xs mt-1">위 버튼을 눌러 새 챕터를 추가하세요.</p>
          </div>
        ) : (
          document.chapters.map((chapter) => (
            <ChapterItem key={chapter.id} chapter={chapter} />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>총 챕터:</span>
            <span className="font-medium">{document.chapters.length}개</span>
          </div>
          <div className="flex justify-between">
            <span>총 섹션:</span>
            <span className="font-medium">
              {document.chapters.reduce((sum, ch) => sum + ch.sections.length, 0)}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

