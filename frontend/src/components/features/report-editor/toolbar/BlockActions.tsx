'use client';

import React from 'react';
import { 
  Plus, 
  GripVertical, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDragHandle } from '../SortableBlock';

interface BlockActionsProps {
  blockId: string;
  sectionId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddBelow: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * 블록 액션 버튼들
 * 블록에 호버할 때 왼쪽에 표시되는 액션 메뉴
 * 
 * 기능:
 * - 드래그 핸들 (useDragHandle hook으로 드래그 가능)
 * - 블록 추가 (+)
 * - 위/아래 이동
 * - 복제
 * - 삭제
 */
export const BlockActions: React.FC<BlockActionsProps> = ({
  blockId,
  sectionId,
  canMoveUp,
  canMoveDown,
  onAddBelow,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const { listeners, attributes } = useDragHandle();

  return (
    <div className="block-actions absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full pr-2">
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        className="p-1.5 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
        title="드래그하여 이동"
        type="button"
      >
        <GripVertical size={16} className="text-gray-400" />
      </button>

      {/* 추가 버튼 */}
      <button
        onClick={onAddBelow}
        className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
        title="아래에 블록 추가"
      >
        <Plus size={16} />
      </button>

      {/* 더보기 메뉴 */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="더보기"
        >
          <MoreHorizontal size={16} />
        </button>

        {/* 드롭다운 메뉴 */}
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMoreMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40"
            >
              {/* 위로 이동 */}
              <button
                onClick={() => {
                  onMoveUp();
                  setShowMoreMenu(false);
                }}
                disabled={!canMoveUp}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp size={14} />
                위로 이동
              </button>

              {/* 아래로 이동 */}
              <button
                onClick={() => {
                  onMoveDown();
                  setShowMoreMenu(false);
                }}
                disabled={!canMoveDown}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown size={14} />
                아래로 이동
              </button>

              <div className="my-1 border-t border-gray-200" />

              {/* 복제 */}
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Copy size={14} />
                복제
              </button>

              <div className="my-1 border-t border-gray-200" />

              {/* 삭제 */}
              <button
                onClick={() => {
                  if (confirm('이 블록을 삭제하시겠습니까?')) {
                    onDelete();
                    setShowMoreMenu(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                삭제
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

