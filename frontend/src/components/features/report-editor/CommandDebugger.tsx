'use client';

import React from 'react';
import { useCommand } from '@/hooks/useCommand';
import { useEditorStore } from '@/store/editorStore';
import { 
  CommandType,
  InsertBlockPayload,
  UpdateBlockContentPayload,
  DeleteBlockPayload 
} from '@/commands';
import { Terminal, Plus, Trash2, Edit, X } from 'lucide-react';

interface CommandDebuggerProps {
  onClose?: () => void;
}

/**
 * Command System 디버거 컴포넌트
 * 개발 모드에서만 표시되며, Command 실행을 테스트할 수 있음
 */
export const CommandDebugger: React.FC<CommandDebuggerProps> = ({ onClose }) => {
  const { dispatch, undo, redo, canUndo, canRedo, historySize } = useCommand();
  const { document } = useEditorStore();

  // 표시 상태 저장 및 닫기
  const handleClose = () => {
    localStorage.setItem('command-debugger-visible', 'false');
    onClose?.();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // 테스트용 블록 삽입
  const handleInsertBlock = () => {
    if (!document || document.sections.length === 0) return;

    const firstSection = document.sections[0];
    const payload: InsertBlockPayload = {
      sectionId: firstSection.id,
      position: 0,
      block: {
        id: `block-test-${Date.now()}`,
        blockType: 'paragraph',
        content: [
          {
            id: `inline-test-${Date.now()}`,
            type: 'inline',
            text: '🧪 Command로 추가된 테스트 블록입니다.',
            marks: ['bold'],
          },
        ],
      },
    };

    const result = dispatch(CommandType.INSERT_BLOCK, payload);
    console.log('Insert command result:', result);
  };

  // 테스트용 블록 삭제
  const handleDeleteBlock = () => {
    if (!document || document.sections.length === 0) return;

    const firstSection = document.sections[0];
    if (firstSection.blocks.length === 0) return;

    const firstBlock = firstSection.blocks[0];

    const payload: DeleteBlockPayload = {
      sectionId: firstSection.id,
      blockId: firstBlock.id,
    };

    const result = dispatch(CommandType.DELETE_BLOCK, payload);
    console.log('Delete command result:', result);
  };

  // 테스트용 블록 내용 업데이트
  const handleUpdateBlock = () => {
    if (!document || document.sections.length === 0) return;

    const firstSection = document.sections[0];
    if (firstSection.blocks.length === 0) return;

    const firstBlock = firstSection.blocks[0];
    const timestamp = Date.now();

    const payload: UpdateBlockContentPayload = {
      sectionId: firstSection.id,
      blockId: firstBlock.id,
      content: [
        {
          id: `inline-${timestamp}-1`,
          type: 'inline',
          text: '✏️ Command로 수정된 블록입니다 - ',
          marks: [],
        },
        {
          id: `inline-${timestamp}-2`,
          type: 'inline',
          text: new Date().toLocaleTimeString('ko-KR'),
          marks: ['italic'],
        },
      ],
    };

    const result = dispatch(CommandType.UPDATE_BLOCK_CONTENT, payload);
    console.log('Update command result:', result);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-2xl w-80 z-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} />
          <h3 className="text-sm font-semibold">Command Debugger</h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="디버거 닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* 히스토리 정보 */}
      <div className="mb-3 text-xs bg-gray-800 p-2 rounded">
        <div className="flex justify-between">
          <span>History:</span>
          <span className="font-mono">{historySize} commands</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Can Undo:</span>
          <span className={canUndo ? 'text-green-400' : 'text-red-400'}>
            {canUndo ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Can Redo:</span>
          <span className={canRedo ? 'text-green-400' : 'text-red-400'}>
            {canRedo ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* 테스트 버튼들 */}
      <div className="space-y-2">
        <button
          onClick={handleInsertBlock}
          className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
        >
          <Plus size={14} />
          Insert Block (첫 섹션)
        </button>

        <button
          onClick={handleUpdateBlock}
          className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
        >
          <Edit size={14} />
          Update First Block
        </button>

        <button
          onClick={handleDeleteBlock}
          className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
        >
          <Trash2 size={14} />
          Delete First Block
        </button>

        <div className="flex gap-2 pt-2 border-t border-gray-700">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Redo
          </button>
        </div>
      </div>

      {/* 힌트 */}
      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
        💡 Ctrl+Z / Ctrl+Shift+Z
      </div>
    </div>
  );
};

