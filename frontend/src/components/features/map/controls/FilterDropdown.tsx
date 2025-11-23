/**
 * FilterDropdown
 * 필터 칩 클릭 시 나타나는 드롭다운 팝오버
 * 
 * 기능:
 * - 절대 위치로 표시 (칩 바로 아래)
 * - Click Outside 감지하여 닫기
 * - 내부 컨텐츠 스크롤 지원
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Z_INDEX } from '@/constants/esg-map';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  children,
  width = 300,
  className = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click Outside 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden ${className}`}
          style={{ 
            width, 
            zIndex: Z_INDEX.DROPDOWN, // 상수 사용 (esg-map.ts에 추가 필요)
            maxHeight: '60vh',
          }}
        >
          <div className="overflow-y-auto max-h-[60vh] p-4 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

