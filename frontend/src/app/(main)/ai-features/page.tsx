'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AIFeaturesGrid } from '@/components/features/ai-features/AIFeaturesGrid';

/**
 * AI Features Use Cases 페이지
 */
export default function AIFeaturesPage() {
  return (
    <DashboardLayout>
      {/* 
         [레이아웃 수정] 
         max-w-7xl mx-auto: 전체 페이지 중앙 정렬 및 너비 제한
      */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Features</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base max-w-2xl">
            ESG SaaS 플랫폼에서 활용 가능한 다양한 AI 기능을 탐색하세요. 
            자동화된 리포팅부터 리스크 분석까지 비즈니스 효율을 높여줍니다.
          </p>
        </div>

        {/* AI Features 그리드 */}
        <AIFeaturesGrid />
      </div>
    </DashboardLayout>
  );
}