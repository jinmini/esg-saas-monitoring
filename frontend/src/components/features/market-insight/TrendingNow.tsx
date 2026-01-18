'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCompanyTrends } from '@/hooks/useArticles';
import { cn } from '@/lib/utils';

interface TrendingNowProps {
  selectedPeriod: number;
}

export function TrendingNow({ selectedPeriod }: TrendingNowProps) {
  const { data, isLoading, isError } = useCompanyTrends({ period: selectedPeriod, enabled: true });

  // 트렌드 뱃지 렌더링 (심플 & 모던)
  const renderTrendBadge = (changeType: string, changeRate: number) => {
    // 변화가 없거나 0%인 경우
    if (changeType === 'same' || changeRate === 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
          <Minus size={10} />
          <span>-</span>
        </div>
      );
    }

    const isUp = changeType === 'up';
    const Icon = isUp ? TrendingUp : TrendingDown;
    
    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border",
        isUp 
          ? "bg-green-50 text-green-600 border-green-100" 
          : "bg-red-50 text-red-600 border-red-100"
      )}>
        <Icon size={10} strokeWidth={3} />
        <span>{Math.abs(changeRate).toFixed(0)}%</span>
      </div>
    );
  };

  return (
    <Card className="h-fit border-none shadow-sm bg-white/80 backdrop-blur-sm ring-1 ring-gray-200/50">
      {/* Header: Minimal & Live feel */}
      <CardHeader className="pb-2 pt-4 px-5 border-b border-gray-100/50">
        <CardTitle className="flex items-center justify-between text-base font-bold text-gray-900">
          <span>Trending Companies</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Live</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 pt-2 pb-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" className="text-gray-300" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
            <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
            <p className="text-xs">데이터 로드 실패</p>
          </div>
        )}

        {data && data.trends && (
          <div className="flex flex-col">
            {data.trends.slice(0, 10).map((trend, index) => (
              <div 
                key={trend.rank} 
                className="group flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-lg transition-colors cursor-default"
              >
                {/* Left: Rank & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank: Stylized Typography */}
                  <span className={cn(
                    "text-lg font-black italic w-5 text-center leading-none",
                    index === 0 ? "text-indigo-600" :
                    index === 1 ? "text-indigo-500" :
                    index === 2 ? "text-indigo-400" :
                    "text-gray-300 font-bold not-italic text-sm"
                  )}>
                    {trend.rank}
                  </span>
                  
                  {/* Name & Sub-info */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                      {trend.company_name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {trend.current_mentions} mentions
                    </span>
                  </div>
                </div>

                {/* Right: Trend Badge */}
                <div className="shrink-0 ml-2">
                  {renderTrendBadge(trend.change_type, trend.change_rate)}
                </div>
              </div>
            ))}
            
            {/* Footer Info */}
            <div className="mt-3 text-[10px] text-gray-300 text-center font-medium">
              Based on last {data.period_days} days analysis
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}