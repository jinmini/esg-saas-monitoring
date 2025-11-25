'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AIFeaturesGrid } from '@/components/features/ai-features/AIFeaturesGrid';

/**
 * AI Features Use Cases 페이지
 * - 경로: /ai-features
 * - ESG SaaS에서 활용 가능한 다양한 AI 기능 소개
 * - Report Editor는 Beta 기능으로 포함
 */
export default function AIFeaturesPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Features</h1>
          <p className="text-gray-600 mt-2 text-sm">
            ESG SaaS 플랫폼에서 활용 가능한 다양한 AI 기능을 탐색하세요
          </p>
        </div>

        {/* AI Features 그리드 */}
        <AIFeaturesGrid />
      </div>
    </DashboardLayout>
  );
}
