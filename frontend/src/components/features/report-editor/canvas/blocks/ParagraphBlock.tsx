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

      // marks에 따라 HTML 태그 래핑
      if (marks.includes('code')) {
        text = `<code>${text}</code>`;
      }
      if (marks.includes('bold')) {
        text = `<strong>${text}</strong>`;
      }
      if (marks.includes('italic')) {
        text = `<em>${text}</em>`;
      }
      if (marks.includes('underline')) {
        text = `<u>${text}</u>`;
      }
      if (marks.includes('strike')) {
        text = `<s>${text}</s>`;
      }
      if (marks.includes('highlight')) {
        text = `<mark>${text}</mark>`;
      }

      // 링크 처리
      if (node.link) {
        text = `<a href="${node.link.url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }

      return text;
    })
    .join('');
}

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
  const editorRef = useRef<HTMLParagraphElement>(null);
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

  // ✅ block.content가 변경되면 DOM 업데이트 (단, 사용자가 입력 중이 아닐 때만)
  useEffect(() => {
    if (!editorRef.current || isComposingRef.current) return;
    
    const html = block.content ? inlineNodesToHTML(block.content) : '';
    
    // 포커스 중일 때: 커서 위치 저장 후 복원
    if (document.activeElement === editorRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // 현재 커서 위치 저장 (텍스트 오프셋)
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const caretOffset = preCaretRange.toString().length;

      // HTML 업데이트
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;

        // 커서 위치 복원
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
      // 포커스 없을 때: 그냥 업데이트
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [block.content]);

  const handleInput = (e: React.FormEvent<HTMLParagraphElement>) => {
    if (isReadOnly || isComposingRef.current) return;

    const newContent = domToInlineNodes(e.currentTarget);
    onUpdateContent(block.id, newContent);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLParagraphElement>) => {
    isComposingRef.current = false;
    handleInput(e);
  };

  return (
    <p
      ref={editorRef}
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
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};

