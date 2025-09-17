'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RightSidebar } from '@/components/widgets/RightSidebar';
import { ArticleList } from '@/components/feed/ArticleList';
import { PeriodFilter } from '@/components/filters/PeriodFilter';

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30); // Default: 1개월
  return (
    <DashboardLayout rightSidebar={<RightSidebar selectedPeriod={selectedPeriod} />}>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Market Insight
              </h1>
              <p className="text-gray-600">
                ESG SaaS 기업들의 최신 뉴스와 시장 동향을 분석합니다
              </p>
            </div>
            
            {/* 기간 선택 필터 */}
            <PeriodFilter 
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          </div>

          {/* ESG Service 카테고리 설명 영역 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>ESG Service</strong> 또는 <strong>기업별 category</strong> 필터링, 정렬 기능
            </p>
            <p className="text-blue-600 text-xs mt-1">
              향후 고급 필터링 및 카테고리별 분류 기능이 추가될 예정입니다.
            </p>
          </div>
        </div>

        {/* Main Content - 뉴스 리스트 */}
        <div>
          <ArticleList pageSize={10} />
        </div>
      </div>
    </DashboardLayout>
  );
}
