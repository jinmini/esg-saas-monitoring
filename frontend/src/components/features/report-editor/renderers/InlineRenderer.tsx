import React from 'react';
import { InlineNode } from '@/types/editor/inline';

interface InlineRendererProps {
  content: InlineNode[];
  className?: string;
}

/**
 * 인라인 텍스트 렌더러
 * marks 배열에 따라 bold, italic 등의 스타일을 적용
 */
export const InlineRenderer: React.FC<InlineRendererProps> = ({ content, className = '' }) => {
  return (
    <>
      {content.map((inline, index) => {
        let text: React.ReactNode = inline.text;
        const marks = inline.marks || [];

        // marks에 따라 중첩된 스타일 적용
        if (marks.includes('code')) {
          text = (
            <code className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">
              {text}
            </code>
          );
        }

        if (marks.includes('bold')) {
          text = <strong className="font-bold">{text}</strong>;
        }

        if (marks.includes('italic')) {
          text = <em className="italic">{text}</em>;
        }

        if (marks.includes('underline')) {
          text = <u className="underline">{text}</u>;
        }

        if (marks.includes('strike')) {
          text = <s className="line-through">{text}</s>;
        }

        if (marks.includes('highlight')) {
          text = (
            <mark className="bg-yellow-200 px-1 rounded">{text}</mark>
          );
        }

        // 링크 처리
        if (inline.link) {
          text = (
            <a
              href={inline.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {text}
            </a>
          );
        }

        return (
          <span key={`inline-${index}`} className={className}>
            {text}
          </span>
        );
      })}
    </>
  );
};

