'use client';

import React from 'react';
import { AIFeatureCard } from './AIFeatureCard';
import { AI_FEATURES } from '@/data/ai-features';

export const AIFeaturesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* lg:grid-cols-3 -> xl:grid-cols-4로 확장하여 큰 화면에서 더 많이 보이게 함 */}
      {AI_FEATURES.map((feature) => (
        <AIFeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
};