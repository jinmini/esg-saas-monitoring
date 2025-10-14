import React from 'react';
import { BlockNode } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';
import { BlockActions } from '../toolbar/BlockActions';
import { useBlockRender } from '../hooks/useBlockRender';
import { SortableBlock } from '../SortableBlock';

interface BlockProps {
  sortableId: string; // Drag & Drop을 위한 고유 ID
  block: BlockNode;
  sectionId: string;
  blockIndex: number;
  totalBlocks: number;
  isFocused: boolean;
  isHovered: boolean;
  isReadOnly: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onMouseUp: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onUpdateContent: (blockId: string, newContent: InlineNode[]) => void;
  onAddBelow: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Block 프레젠터 컴포넌트
 * 
 * 역할:
 * - SortableBlock으로 드래그 가능하게 만들기
 * - 블록 래퍼와 액션 버튼 제공
 * - useBlockRender hook을 통해 실제 블록 컴포넌트 렌더링
 * - 블록 타입에 따라 적절한 컴포넌트로 위임
 */
export const Block: React.FC<BlockProps> = ({
  sortableId,
  block,
  sectionId,
  blockIndex,
  totalBlocks,
  isFocused,
  isHovered,
  isReadOnly,
  onFocus,
  onBlur,
  onMouseUp,
  onKeyPress,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onUpdateContent,
  onAddBelow,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  // 블록 타입에 맞는 컴포넌트 가져오기
  const BlockComponent = useBlockRender(block.blockType);

  return (
    <SortableBlock id={sortableId}>
      <div
        className="relative group"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* 블록 액션 버튼 */}
        {!isReadOnly && (
          <BlockActions
            blockId={block.id}
            sectionId={sectionId}
            canMoveUp={blockIndex > 0}
            canMoveDown={blockIndex < totalBlocks - 1}
            onAddBelow={onAddBelow}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        )}

        {/* 실제 블록 컨텐츠 */}
        <BlockComponent
          block={block}
          sectionId={sectionId}
          isFocused={isFocused}
          isHovered={isHovered}
          isReadOnly={isReadOnly}
          onFocus={onFocus}
          onBlur={onBlur}
          onMouseUp={onMouseUp}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onUpdateContent={onUpdateContent}
        />
      </div>
    </SortableBlock>
  );
};
