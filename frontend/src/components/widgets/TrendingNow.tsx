'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus, Building2, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCompanyTrends } from '@/hooks/useArticles';
import { cn } from '@/lib/utils';

interface TrendingNowProps {
  selectedPeriod: number;
}

export function TrendingNow({ selectedPeriod }: TrendingNowProps) {
  const { data, isLoading, isError } = useCompanyTrends({ period: selectedPeriod, enabled: true });
  // 변화 아이콘 렌더링 함수
  const renderChangeIcon = (changeType: string, changeRate: number) => {
    const iconClass = "w-3 h-3";
    
    switch (changeType) {
      case 'up':
        return <TrendingUp className={cn(iconClass, "text-green-600")} />;
      case 'down':
        return <TrendingDown className={cn(iconClass, "text-red-600")} />;
      default:
        return <Minus className={cn(iconClass, "text-gray-500")} />;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm text-red-600 mb-1">데이터를 불러올 수 없습니다</p>
            <p className="text-xs text-gray-500">백엔드 서버를 확인해주세요</p>
          </div>
        )}

        {data && data.trends && (
          <div className="space-y-3">
            {data.trends.slice(0, 10).map((trend) => (
              <div key={trend.rank} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {trend.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {trend.company_name}
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderChangeIcon(trend.change_type, trend.change_rate)}
                      <span className={cn(
                        "text-xs font-medium",
                        trend.change_type === 'up' ? "text-green-600" :
                        trend.change_type === 'down' ? "text-red-600" : "text-gray-500"
                      )}>
                        {trend.change_rate > 0 ? '+' : ''}{trend.change_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    언급 {trend.current_mentions}회 · {trend.company_type}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 분석 정보 */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {data.period_days}일간 분석 · 총 {data.total_companies}개 기업
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
