/**
 * FilterChip
 * 필터 바의 각 항목을 나타내는 칩 버튼
 * 
 * 기능:
 * - 클릭 시 드롭다운 토글
 * - 활성 상태 (필터 적용 중) 스타일링
 * - 카운트 배지 표시
 */

'use client';

import React from 'react';
import { ChevronDown, X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  icon?: string; // 이모지 또는 아이콘
  isActive?: boolean;
  count?: number; // 선택된 항목 수
  isOpen?: boolean;
  onClick: () => void;
  onClear?: (e: React.MouseEvent) => void; // 개별 필터 초기화
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  isActive = false,
  count = 0,
  isOpen = false,
  onClick,
  onClear,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border
        ${
          isActive || isOpen
            ? 'bg-slate-700 text-white border-slate-600 shadow-md'
            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
        }
        ${isActive ? 'ring-1 ring-green-500/50 border-green-500/50' : ''}
      `}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      
      {count > 0 && (
        <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-green-500 text-white rounded-full ml-1">
          {count}
        </span>
      )}

      {/* Dropdown Indicator */}
      {!onClear || !isActive ? (
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      ) : (
        // Clear Button (only when active and onClear provided)
        <div
          role="button"
          onClick={onClear}
          className="p-0.5 hover:bg-slate-600 rounded-full transition-colors"
        >
          <X size={14} />
        </div>
      )}
    </button>
  );
};

