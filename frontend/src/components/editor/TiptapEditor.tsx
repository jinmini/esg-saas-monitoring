'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { handleDOMEvents, DragHandlePlugin } from '@tiptap/extension-drag-handle-react';
import { MenuBar } from './MenuBar';
import { DragHandle } from './DragHandle';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function TiptapEditor({
  content = '',
  onChange,
  editable = true,
  placeholder = '내용을 입력하세요...',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      DragHandlePlugin,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] max-w-none p-8',
      },
      handleDOMEvents,
    },
  });

  // content prop이 변경될 때 에디터 내용 업데이트 (섹션 전환 시)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white shadow-sm">
      {editable && <MenuBar editor={editor} />}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
        {editable && <DragHandle editor={editor} />}
      </div>
    </div>
  );
}
