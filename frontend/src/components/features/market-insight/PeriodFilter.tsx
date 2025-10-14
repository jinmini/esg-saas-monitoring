'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PeriodFilterProps {
  selectedPeriod: number;
  onPeriodChange: (period: number) => void;
  className?: string;
}

const periodOptions = [
  { label: '1개월', value: 30 },
  { label: '3개월', value: 90 },
  { label: '6개월', value: 180 },
  { label: '12개월', value: 365 },
];

export function PeriodFilter({ selectedPeriod, onPeriodChange, className }: PeriodFilterProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-sm text-gray-500">기간:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              selectedPeriod === option.value
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
