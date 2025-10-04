'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TextObject, TextFormatStyle } from '@/types/unified';
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextBoxProps {
  object: TextObject;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onUpdate: (attrs: Partial<TextObject>) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export function RichTextBox({
  object,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onStartEdit,
  onEndEdit,
}: RichTextBoxProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(object.content);

  // 콘텐츠 동기화
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      contentRef.current.innerHTML = object.content;
    }
  }, [object.content, isEditing]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) {
      e.preventDefault();
      onSelect();
    }
  };

  // 더블클릭으로 편집 모드
  const handleDoubleClick = () => {
    onStartEdit();
    setTimeout(() => {
      contentRef.current?.focus();
    }, 0);
  };

  // 입력 변경
  const handleInput = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      setLocalContent(newContent);
    }
  };

  // 블러 시 저장
  const handleBlur = () => {
    if (contentRef.current) {
      onUpdate({ content: contentRef.current.innerHTML });
      onEndEdit();
    }
  };

  // 서식 적용
  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        zIndex: 50 + object.zIndex,
        transform: `rotate(${object.rotation}deg)`,
        pointerEvents: object.locked ? 'none' : 'auto',
        opacity: object.visible ? 1 : 0.3,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* 편집 툴바 (편집 모드일 때만) */}
      {isEditing && (
        <div
          className="absolute -top-10 left-0 flex items-center space-x-1 bg-white border border-gray-300 rounded-md shadow-lg p-1 z-10"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => applyFormat('bold')}
            className="p-1 hover:bg-gray-100 rounded"
            title="굵게 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('italic')}
            className="p-1 hover:bg-gray-100 rounded"
            title="기울임 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('underline')}
            className="p-1 hover:bg-gray-100 rounded"
            title="밑줄 (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <button
            onClick={() => applyFormat('justifyLeft')}
            className="p-1 hover:bg-gray-100 rounded"
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('justifyCenter')}
            className="p-1 hover:bg-gray-100 rounded"
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('justifyRight')}
            className="p-1 hover:bg-gray-100 rounded"
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <select
            onChange={(e) => applyFormat('fontSize', e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-1"
            defaultValue="3"
          >
            <option value="1">10px</option>
            <option value="2">12px</option>
            <option value="3">14px</option>
            <option value="4">16px</option>
            <option value="5">18px</option>
            <option value="6">24px</option>
            <option value="7">32px</option>
          </select>

          <input
            type="color"
            onChange={(e) => applyFormat('foreColor', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="글자 색상"
          />
        </div>
      )}

      {/* 텍스트 박스 */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        className="w-full h-full overflow-auto outline-none"
        style={{
          padding: object.padding,
          fontSize: object.fontSize,
          fontFamily: object.fontFamily,
          color: object.color,
          backgroundColor: object.backgroundColor,
          textAlign: object.textAlign,
          border: isSelected
            ? `2px solid #16a34a`
            : object.borderWidth > 0
            ? `${object.borderWidth}px solid ${object.borderColor || '#d1d5db'}`
            : 'none',
          borderRadius: '4px',
          cursor: isEditing ? 'text' : 'move',
          userSelect: isEditing ? 'text' : 'none',
        }}
      >
        {/* Initial content will be set via dangerouslySetInnerHTML equivalent */}
      </div>

      {/* 선택 인디케이터 */}
      {isSelected && !isEditing && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: '2px solid #16a34a',
            borderRadius: '4px',
          }}
        />
      )}
    </div>
  );
}

