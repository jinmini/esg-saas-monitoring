/**
 * FilterSection
 * Collapsible 필터 섹션 컴포넌트
 * 
 * 기능:
 * - 제목 클릭 시 접기/펼치기
 * - 애니메이션 효과
 * - 체크박스, 라디오 버튼 등 다양한 입력 타입 지원
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Props
 */
interface FilterSectionProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number; // 활성 필터 개수 표시
}

/**
 * FilterSection Component
 */
export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  defaultOpen = false,
  children,
  count,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700 last:border-0">
      {/* Header (Clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-white">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-400" />
        )}
      </button>

      {/* Content (Collapsible) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-slate-800/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Display Name (for React DevTools)
 */
FilterSection.displayName = 'FilterSection';

