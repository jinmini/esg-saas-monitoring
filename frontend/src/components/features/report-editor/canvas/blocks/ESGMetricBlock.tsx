import React from 'react';
import { BlockComponentProps } from './types';

/**
 * ESG 지표 블록 컴포넌트
 * ESG 특화 지표를 렌더링하기 위한 플레이스홀더입니다.
 */
export const ESGMetricBlock: React.FC<BlockComponentProps> = ({
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
    <div className={`${baseClasses} bg-green-50`}>
      <div className="text-green-700 text-sm py-4">
        🌱 ESG Metric Block (구현 예정)
      </div>
    </div>
  );
};

