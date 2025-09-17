'use client';

import React from 'react';
import { TrendingNow } from './TrendingNow';
import { WordCloudWidget } from './WordCloudWidget';

interface RightSidebarProps {
  selectedPeriod: number;
}

export function RightSidebar({ selectedPeriod }: RightSidebarProps) {
  return (
    <div className="p-6 space-y-6">
      <TrendingNow selectedPeriod={selectedPeriod} />
      <WordCloudWidget />
    </div>
  );
}
