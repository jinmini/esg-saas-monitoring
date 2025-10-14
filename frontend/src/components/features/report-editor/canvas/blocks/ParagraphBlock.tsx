import React from 'react';
import { InlineRenderer } from '../../renderers/InlineRenderer';
import { domToInlineNodes } from '@/lib/parsers/domParser';
import { BlockComponentProps } from './types';

/**
 * 문단 블록 컴포넌트
 * 기본적인 텍스트 문단을 렌더링합니다.
 */
export const ParagraphBlock: React.FC<BlockComponentProps> = ({
  block,
  sectionId,
  isFocused,
  isReadOnly,
  onFocus,
  onBlur,
  onMouseUp,
  onKeyPress,
  onKeyDown,
  onUpdateContent,
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

  const handleInput = (e: React.FormEvent<HTMLParagraphElement>) => {
    if (isReadOnly) return;

    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateContent(block.id, newContent);
  };

  return (
    <p
      className={`${baseClasses} text-base leading-relaxed`}
      style={{ textAlign: block.attributes?.align || 'left' }}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onFocus={() => onFocus?.(block.id, sectionId)}
      onBlur={() => onBlur?.(block.id, sectionId)}
      onMouseUp={onMouseUp as (e: React.MouseEvent) => void}
      onKeyPress={onKeyPress as (e: React.KeyboardEvent) => void}
      onKeyDown={onKeyDown}
      onInput={handleInput}
    >
      {block.content ? <InlineRenderer content={block.content} /> : ''}
    </p>
  );
};

