'use client';

import React from 'react';
import { Check, Filter } from 'lucide-react';
import type { EventCategory } from '@/types/api';
import { EVENT_CATEGORY_COLORS } from '@/types/api';

interface CategoryFilterProps {
  selectedCategory?: EventCategory;
  onCategoryChange: (category?: EventCategory) => void;
  className?: string;
  compact?: boolean;
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className = '',
  compact = false
}: CategoryFilterProps) {
  
  const categories: EventCategory[] = ['지원사업', '정책발표', '컨퍼런스', '공시마감'];

  // 카테고리 설명 매핑
  const categoryDescriptions: Record<EventCategory, string> = {
    '지원사업': 'R&D 지원, 창업 프로그램 등',
    '공시마감': 'ESG 보고서, 탄소 공시 등',
    '정책발표': '정부 정책, 법령 개정 등',
    '컨퍼런스': '세미나, 워크숍, 전시회 등'
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Filter className="w-4 h-4 text-gray-500" />
        <div className="flex space-x-1">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {categories.map((category) => {
            const colors = EVENT_CATEGORY_COLORS[category];
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(isSelected ? undefined : category)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  isSelected
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">카테고리 필터</h3>
      </div>
      
      <div className="space-y-3">
        {/* 전체 옵션 */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="radio"
              name="category-filter"
              checked={!selectedCategory}
              onChange={() => onCategoryChange(undefined)}
              className="sr-only"
            />
            <div className={`w-5 h-5 border-2 rounded-full transition-colors ${
              !selectedCategory
                ? 'border-gray-900 bg-gray-900'
                : 'border-gray-300 group-hover:border-gray-400'
            }`}>
              {!selectedCategory && (
                <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">전체 카테고리</div>
            <div className="text-sm text-gray-500">모든 ESG 일정 표시</div>
          </div>
        </label>

        {/* 카테고리별 옵션 */}
        {categories.map((category) => {
          const colors = EVENT_CATEGORY_COLORS[category];
          const isSelected = selectedCategory === category;
          
          return (
            <label key={category} className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="category-filter"
                  checked={isSelected}
                  onChange={() => onCategoryChange(category)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded-full transition-colors ${
                  isSelected
                    ? `${colors.border.replace('border-', 'border-')} ${colors.dot.replace('bg-', 'bg-')}`
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {isSelected && (
                    <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                <div>
                  <div className="font-medium text-gray-900">{category}</div>
                  <div className="text-sm text-gray-500">{categoryDescriptions[category]}</div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onCategoryChange(undefined)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
