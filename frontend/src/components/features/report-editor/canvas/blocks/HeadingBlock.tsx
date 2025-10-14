import React, { useRef, useEffect } from 'react';
import { domToInlineNodes } from '@/lib/parsers/domParser';
import { BlockComponentProps } from './types';
import { InlineNode } from '@/types/editor/inline';

/**
 * InlineNode 배열을 HTML 문자열로 변환
 */
function inlineNodesToHTML(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      let text = node.text;
      const marks = node.marks || [];

      if (marks.includes('code')) text = `<code>${text}</code>`;
      if (marks.includes('bold')) text = `<strong>${text}</strong>`;
      if (marks.includes('italic')) text = `<em>${text}</em>`;
      if (marks.includes('underline')) text = `<u>${text}</u>`;
      if (marks.includes('strike')) text = `<s>${text}</s>`;
      if (marks.includes('highlight')) text = `<mark>${text}</mark>`;

      if (node.link) {
        text = `<a href="${node.link.url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }

      return text;
    })
    .join('');
}

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
  const editorRef = useRef<HTMLHeadingElement>(null);
  const isComposingRef = useRef(false);
  
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

  useEffect(() => {
    if (!editorRef.current || isComposingRef.current) return;
    
    const html = block.content ? inlineNodesToHTML(block.content) : '';
    
    // 포커스 중일 때: 커서 위치 저장 후 복원
    if (document.activeElement === editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const caretOffset = preCaretRange.toString().length;

      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;

        const textNode = editorRef.current.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const newRange = document.createRange();
          const newOffset = Math.min(caretOffset, textNode.textContent?.length || 0);
          newRange.setStart(textNode, newOffset);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else {
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [block.content]);

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    if (isReadOnly || isComposingRef.current) return;
    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateContent(block.id, newContent);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLHeadingElement>) => {
    isComposingRef.current = false;
    handleInput(e);
  };

  // 공통 props 정의
  const commonProps = {
    ref: editorRef,
    className: `${baseClasses} ${headingClasses}`,
    style: { textAlign: block.attributes?.align || 'left' },
    contentEditable: !isReadOnly,
    suppressContentEditableWarning: true,
    onFocus: () => onFocus?.(block.id, sectionId),
    onBlur: () => onBlur?.(block.id, sectionId),
    onMouseUp,
    onKeyPress,
    onKeyDown,  
    onInput: handleInput,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  };

  switch (level) {
    case 1:
      return <h1 {...commonProps} />;
    case 2:
      return <h2 {...commonProps} />;
    case 3:
      return <h3 {...commonProps} />;
    case 4:
      return <h4 {...commonProps} />;
    case 5:
      return <h5 {...commonProps} />;
    case 6:
      return <h6 {...commonProps} />;
    default:
      return <h2 {...commonProps} />;
  }
};
