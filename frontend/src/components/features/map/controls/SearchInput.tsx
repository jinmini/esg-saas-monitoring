/**
 * SearchInput
 * 상단 필터 바의 검색창
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useESGMapStore } from '@/store/esgMapStore';
import { useDebounce } from '@/hooks/useDebounce'; // Hook이 없으면 직접 구현

export const SearchInput: React.FC = () => {
  const searchQuery = useESGMapStore((state) => state.filters.searchQuery);
  const setSearchQuery = useESGMapStore((state) => state.setSearchQuery);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce 처리 (성능 최적화)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  // Store 상태 변경 시 Input 동기화 (초기화 버튼 등 외부 요인)
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <div className="relative w-64">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="기업, 국가, 기술 검색..."
        className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-sm hover:bg-slate-800"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

