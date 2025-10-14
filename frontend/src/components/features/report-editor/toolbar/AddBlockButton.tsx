'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddBlockButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * 블록 추가 버튼
 * 섹션 끝이나 빈 영역에 표시
 */
export const AddBlockButton: React.FC<AddBlockButtonProps> = ({
  onClick,
  label = '블록 추가하려면 클릭하거나 / 입력',
}) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="
        group
        w-full 
        flex 
        items-center 
        gap-2 
        px-4 
        py-3 
        text-sm 
        text-gray-400 
        hover:text-gray-700
        hover:bg-gray-50 
        rounded-lg 
        border-2 
        border-dashed 
        border-gray-200
        hover:border-gray-300
        transition-all
      "
    >
      <div className="p-1 bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 rounded transition-colors">
        <Plus size={14} />
      </div>
      <span>{label}</span>
    </motion.button>
  );
};

