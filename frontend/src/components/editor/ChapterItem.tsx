'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentChapter } from '@/types/document';
import { SectionItem } from './SectionItem';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterItemProps {
  chapter: DocumentChapter;
}

export function ChapterItem({ chapter }: ChapterItemProps) {
  const { toggleChapterCollapse, updateChapter, deleteChapter, addSection } = useDocumentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(chapter.title);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    toggleChapterCollapse(chapter.id);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      updateChapter(chapter.id, tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`"${chapter.title}" 챕터를 삭제하시겠습니까?\n하위 섹션도 모두 삭제됩니다.`)) {
      deleteChapter(chapter.id);
    }
  };

  const handleAddSection = () => {
    const title = window.prompt('새 섹션 이름을 입력하세요:');
    if (title && title.trim()) {
      addSection(chapter.id, title.trim());
    }
  };

  return (
    <div className="space-y-1">
      {/* Chapter Header */}
      <div
        className={cn(
          'group flex items-center justify-between px-2 py-2 rounded-lg transition-colors',
          'hover:bg-gray-100'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={chapter.isCollapsed ? '펼치기' : '접기'}
          >
            {chapter.isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setTempTitle(chapter.title);
                  setIsEditing(false);
                }
              }}
              className="flex-1 text-sm font-medium border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
              {chapter.title}
            </span>
          )}

          {/* Section Count Badge */}
          {!isEditing && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {chapter.sections.length}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {isHovered && !isEditing && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleAddSection}
              className="p-1 hover:bg-green-100 rounded transition-colors"
              title="섹션 추가"
            >
              <Plus className="w-3.5 h-3.5 text-green-600" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="챕터 이름 수정"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="챕터 삭제"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Sections List */}
      {!chapter.isCollapsed && chapter.sections.length > 0 && (
        <div className="ml-5 space-y-1 border-l-2 border-gray-200 pl-2">
          {chapter.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <SectionItem key={section.id} section={section} />
            ))}
        </div>
      )}

      {/* Empty State */}
      {!chapter.isCollapsed && chapter.sections.length === 0 && (
        <div className="ml-7 text-xs text-gray-400 py-2">
          섹션이 없습니다. + 버튼을 눌러 추가하세요.
        </div>
      )}
    </div>
  );
}

