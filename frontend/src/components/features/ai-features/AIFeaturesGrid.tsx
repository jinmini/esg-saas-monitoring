'use client';

import React from 'react';
import { AIFeatureCard } from './AIFeatureCard';
import { AI_FEATURES } from '@/data/ai-features';

/**
 * AI Features Grid 컴포넌트
 * - AI 기능 카드들을 그리드로 표시
 * - 필터 제거 (심플한 디자인)
 */
export const AIFeaturesGrid: React.FC = () => {
  return (
    <div>
      {/* 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_FEATURES.map((feature) => (
          <AIFeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
};
