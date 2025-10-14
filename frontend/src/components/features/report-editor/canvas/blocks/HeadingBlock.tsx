import React from 'react';
import { InlineRenderer } from '../../renderers/InlineRenderer';
import { BlockComponentProps } from './types';
import { domToInlineNodes } from '@/lib/parsers/domParser';

/**
 * 제목 블록 컴포넌트
 * H1, H2, H3 제목을 렌더링합니다.
 */
export const HeadingBlock: React.FC<BlockComponentProps> = ({
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
  const level = block.attributes?.level || 1;
  
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

  const headingClasses = {
    1: 'text-4xl font-bold mt-8 mb-4',
    2: 'text-3xl font-bold mt-6 mb-3',
    3: 'text-2xl font-semibold mt-4 mb-2',
    4: 'text-xl font-semibold mt-3 mb-2',
    5: 'text-lg font-semibold mt-2 mb-1',
    6: 'text-base font-semibold mt-1 mb-1',
  }[level] || 'text-xl font-semibold mt-3 mb-2';

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    if (isReadOnly) return;
    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateContent(block.id, newContent);
  };

// 공통 props 정의
const commonProps = {
  className: `${baseClasses} ${headingClasses}`,
  style: { textAlign: block.attributes?.align || 'left' },
  contentEditable: !isReadOnly,
  suppressContentEditableWarning: true,
  onFocus : () => onFocus?.(block.id, sectionId),
  onBlur : () => onBlur?.(block.id, sectionId),
  onMouseUp,
  onKeyPress,
  onKeyDown,  
  onInput: handleInput,
};

switch (level) {
  case 1:
    return <h1 {...commonProps}><InlineRenderer content={block.content || []} /></h1>
  case 2:
    return <h2 {...commonProps}><InlineRenderer content={block.content || []} /></h2>
  case 3:
    return <h3 {...commonProps}><InlineRenderer content={block.content || []} /></h3>
  case 4:
    return <h4 {...commonProps}><InlineRenderer content={block.content || []} /></h4>
  case 5:
    return <h5 {...commonProps}><InlineRenderer content={block.content || []} /></h5>
  case 6:
    return <h6 {...commonProps}><InlineRenderer content={block.content || []} /></h6>
  default:
    return <h2 {...commonProps}><InlineRenderer content={block.content || []} /></h2>
}
};
