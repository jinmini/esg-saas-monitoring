/**
 * SearchInput
 * 상단 필터 바의 검색창 (자동완성 지원)
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Building2, Tag, BookOpen } from 'lucide-react';
import { useESGMapStore } from '@/store/esgMapStore';

interface Suggestion {
  type: 'company' | 'feature' | 'framework';
  text: string;
  id?: string; // 기업 ID (포커스용)
  subText?: string;
}

export const SearchInput: React.FC = () => {
  // Store 상태
  const companies = useESGMapStore((state) => state.companies);
  const searchQuery = useESGMapStore((state) => state.filters.searchQuery);
  const setSearchQuery = useESGMapStore((state) => state.setSearchQuery);
  const focusCompany = useESGMapStore((state) => state.focusCompany);
  
  // 로컬 상태
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색어 업데이트 (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  // Store 상태와 동기화
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // 추천 검색어 계산
  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const query = inputValue.toLowerCase();
    const results: Suggestion[] = [];
    const seen = new Set<string>();

    // 1. 기업명 검색
    companies.forEach((company) => {
      if (
        company.name.toLowerCase().includes(query) ||
        company.nameLocal.toLowerCase().includes(query)
      ) {
        if (!seen.has(`c:${company.name}`)) {
          results.push({
            type: 'company',
            text: company.name,
            id: company.id,
            subText: company.nameLocal !== company.name ? company.nameLocal : undefined,
          });
          seen.add(`c:${company.name}`);
        }
      }
    });

    // 2. Features 검색 (상위 5개)
    companies.forEach((company) => {
      company.features.forEach((feature) => {
        if (feature.toLowerCase().includes(query) && !seen.has(`f:${feature}`)) {
          results.push({ type: 'feature', text: feature });
          seen.add(`f:${feature}`);
        }
      });
    });

    // 3. Frameworks 검색 (상위 5개)
    companies.forEach((company) => {
      company.frameworks.forEach((fw) => {
        if (fw.toLowerCase().includes(query) && !seen.has(`fw:${fw}`)) {
          results.push({ type: 'framework', text: fw });
          seen.add(`fw:${fw}`);
        }
      });
    });

    // 우선순위 정렬 및 개수 제한
    return results.slice(0, 10);
  }, [inputValue, companies]);

  const handleSelect = (item: Suggestion) => {
    setInputValue(item.text);
    setSearchQuery(item.text);
    setIsOpen(false);

    // 기업 선택 시 지도 줌인
    if (item.type === 'company' && item.id) {
      focusCompany(item.id);
    }
  };

  return (
    <div ref={containerRef} className="relative w-72">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="기업, 기능, 프레임워크 검색..."
          className="w-full pl-9 pr-8 py-2.5 bg-slate-800/90 border border-slate-700 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-sm hover:bg-slate-800"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 추천 검색어 드롭다운 */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-[2000]">
          <div className="max-h-[300px] overflow-y-auto py-1">
            {suggestions.map((item, index) => (
              <button
                key={`${item.type}-${item.text}-${index}`}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 text-left transition-colors group"
              >
                <span className="flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                  {item.type === 'company' && <Building2 size={14} />}
                  {item.type === 'feature' && <Tag size={14} />}
                  {item.type === 'framework' && <BookOpen size={14} />}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-200 group-hover:text-white font-medium">
                    {item.text}
                  </span>
                  {item.subText && (
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">
                      {item.subText}
                    </span>
                  )}
                </div>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
