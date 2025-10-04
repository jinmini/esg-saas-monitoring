'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { DragHandle as TiptapDragHandle } from '@tiptap/extension-drag-handle-react';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  editor: Editor;
}

export function DragHandle({ editor }: DragHandleProps) {
  return (
    <TiptapDragHandle
      editor={editor}
      pluginKey="dragHandleReact"
      tippyOptions={{
        placement: 'left',
        offset: [-2, 16],
        zIndex: 99,
        moveTransition: 'transform 0.15s ease-out',
      }}
    >
      <div className="drag-handle-button">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
    </TiptapDragHandle>
  );
}
