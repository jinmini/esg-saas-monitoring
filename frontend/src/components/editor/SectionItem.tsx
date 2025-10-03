'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { DocumentSection } from '@/types/document';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionItemProps {
  section: DocumentSection;
}

export function SectionItem({ section }: SectionItemProps) {
  const { activeSectionId, setActiveSection, updateSection, deleteSection } = useDocumentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [isHovered, setIsHovered] = useState(false);

  const isActive = activeSectionId === section.id;

  const handleSelect = () => {
    if (!isEditing) {
      setActiveSection(section.id);
    }
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      updateSection(section.id, { title: tempTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`"${section.title}" 섹션을 삭제하시겠습니까?`)) {
      deleteSection(section.id);
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer',
        isActive
          ? 'bg-green-100 border-l-4 border-green-600 shadow-sm'
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      )}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <FileText
          className={cn(
            'w-4 h-4 flex-shrink-0',
            isActive ? 'text-green-600' : 'text-gray-400'
          )}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setTempTitle(section.title);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              'flex-1 text-sm truncate',
              isActive ? 'text-green-900 font-medium' : 'text-gray-700'
            )}
          >
            {section.title}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {isHovered && !isEditing && (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="섹션 이름 수정"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="섹션 삭제"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}

