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
 * 인용구 블록 컴포넌트
 * blockquote 스타일의 인용문을 렌더링합니다.
 */
export const QuoteBlock: React.FC<BlockComponentProps> = ({
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
  const editorRef = useRef<HTMLQuoteElement>(null);
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

  const handleInput = (e: React.FormEvent<HTMLQuoteElement>) => {
    if (isReadOnly || isComposingRef.current) return;

    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateContent(block.id, newContent);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLQuoteElement>) => {
    isComposingRef.current = false;
    handleInput(e);
  };

  return (
    <blockquote
      ref={editorRef}
      className={`${baseClasses} border-l-4 border-gray-300 pl-6 italic text-gray-700`}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onFocus={() => onFocus?.(block.id, sectionId)}
      onBlur={() => onBlur?.(block.id, sectionId)}
      onMouseUp={onMouseUp as (e: React.MouseEvent) => void}
      onKeyPress={onKeyPress as (e: React.KeyboardEvent) => void}
      onKeyDown={onKeyDown}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};
