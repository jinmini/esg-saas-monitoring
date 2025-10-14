import React from 'react';
import { BlockComponentProps } from './types';

/**
 * 차트 블록 컴포넌트
 * 향후 차트 렌더링을 위한 플레이스홀더입니다.
 */
export const ChartBlock: React.FC<BlockComponentProps> = ({
  isFocused,
  isReadOnly,
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
    <div className={baseClasses}>
      <div className="text-gray-500 text-sm py-4">
        📈 Chart Block (구현 예정)
      </div>
    </div>
  );
};

