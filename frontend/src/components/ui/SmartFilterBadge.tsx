'use client';

import React from 'react';
import { CheckCircle, Filter, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartFilterBadgeProps {
  totalArticles: number;
  filteredArticles: number;
  companyName?: string;
  className?: string;
}

export function SmartFilterBadge({ 
  totalArticles, 
  filteredArticles, 
  companyName,
  className 
}: SmartFilterBadgeProps) {
  const filterRate = totalArticles > 0 ? ((totalArticles - filteredArticles) / totalArticles * 100) : 0;
  
  if (filterRate < 10) {
    // 필터링률이 낮으면 표시하지 않음
    return null;
  }

  return (
    <div className={cn(
      'inline-flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm',
      className
    )}>
      <CheckCircle className="w-4 h-4 text-green-600" />
      <div className="flex items-center space-x-1">
        <Filter className="w-3 h-3 text-green-600" />
        <span className="text-green-800 font-medium">스마트 필터링 적용됨</span>
      </div>
      <div className="text-green-700">
        {companyName && (
          <span>
            <strong>{companyName}</strong> 관련 기사만 표시 ·
          </span>
        )}
        <span className="ml-1">
          {totalArticles}개 → {filteredArticles}개 ({filterRate.toFixed(0)}% 노이즈 제거)
        </span>
      </div>
      <div className="group relative">
        <Info className="w-3 h-3 text-green-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          기사 제목과 본문에 실제로 회사명이 포함된 기사만 표시합니다
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
