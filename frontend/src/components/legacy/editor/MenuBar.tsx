'use client';

import React, { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Highlighter,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuBarProps {
  editor: Editor;
}

export function MenuBar({ editor }: MenuBarProps) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL을 입력하세요:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const MenuButton = ({
    onClick,
    isActive,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-gray-100 transition-colors text-gray-700',
        isActive && 'bg-gray-200 text-blue-600 font-semibold'
      )}
      title={label}
      type="button"
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
      {/* Text Formatting */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          label="굵게 (Ctrl+B)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          label="기울임 (Ctrl+I)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          label="밑줄 (Ctrl+U)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          label="취소선"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          icon={Highlighter}
          label="형광펜"
        />
      </div>

      {/* Headings */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          label="제목 1"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          label="제목 2"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          label="제목 3"
        />
      </div>

      {/* Lists */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          label="순서 없는 목록"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          label="순서 있는 목록"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          label="인용"
        />
      </div>

      {/* Text Alignment */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          label="왼쪽 정렬"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          label="가운데 정렬"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={AlignRight}
          label="오른쪽 정렬"
        />
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          icon={AlignJustify}
          label="양쪽 정렬"
        />
      </div>

      {/* Link & Code */}
      <div className="flex gap-1 pr-2 border-r border-gray-300">
        <MenuButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          icon={LinkIcon}
          label="링크 추가"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          icon={Code}
          label="인라인 코드"
        />
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          label="실행 취소 (Ctrl+Z)"
        />
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          label="다시 실행 (Ctrl+Y)"
        />
      </div>
    </div>
  );
}

