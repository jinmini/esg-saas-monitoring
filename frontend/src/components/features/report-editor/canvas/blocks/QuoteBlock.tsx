import React from 'react';
import { InlineRenderer } from '../../renderers/InlineRenderer';
import { BlockComponentProps } from './types';

/**
 * 인용구 블록 컴포넌트
 * 인용문을 렌더링합니다.
 */
export const QuoteBlock: React.FC<BlockComponentProps> = ({
  block,
  sectionId,
  isFocused,
  isReadOnly,
  onFocus,
  onBlur,
  onMouseUp,
  onKeyDown,
}) => {
  const baseClasses = `
    block-item 
    group
    relative
    transition-all 
    duration-200 
    rounded-lg 
    px-4 
    py-2
    ${isFocused ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}
    ${isReadOnly ? 'cursor-default' : 'cursor-text'}
  `;

  return (
    <blockquote
      className={`${baseClasses} border-l-4 border-gray-300 pl-6 italic text-gray-700`}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onFocus={() => onFocus?.(block.id, sectionId)}
      onBlur={() => onBlur?.(block.id, sectionId)}
      onMouseUp={onMouseUp}
      onKeyDown={onKeyDown}
    >
      {block.content ? <InlineRenderer content={block.content} /> : ''}
    </blockquote>
  );
};

