'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RightSidebar } from '@/components/features/market-insight/RightSidebar';
import { ArticleFeed } from '@/components/features/market-insight/ArticleFeed';
import { PeriodFilter } from '@/components/features/market-insight/PeriodFilter';
import { CompanyFilter } from '@/components/features/market-insight/CompanyFilter';
import { useArticlesFeed, useCompanyArticles } from '@/hooks/useArticles';

export default function MarketInsightPage() {
  // 1. 상태 관리
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // 2. 파생 상태 (Derived State)
  const isCompanyFiltered = Boolean(selectedCompanyId);

  // 3. 데이터 페칭 (React Query)
  // 조건부 실행(enabled)을 통해 필요한 쿼리만 실행합니다.
  const feedQuery = useArticlesFeed({
    size: 12,
    period: selectedPeriod,
    enabled: !isCompanyFiltered,
  });

  const companyQuery = useCompanyArticles(selectedCompanyId!, {
    page: 1,
    size: 12,
    period: selectedPeriod,
    enabled: isCompanyFiltered,
  });

  // 4. 데이터 정규화 (Normalization)
  // 두 쿼리 중 현재 활성화된 쿼리를 선택하여 데이터를 통일된 변수에 담습니다.
  const activeQuery = isCompanyFiltered ? companyQuery : feedQuery;
  
  const articles = activeQuery.data?.pages.flatMap((page) => page.articles) ?? [];
  const totalCount = activeQuery.data?.pages[0]?.total ?? 0;
  
  // latest_crawl은 전체 피드일 때만 존재하므로 조건부 할당
  const latestCrawl = !isCompanyFiltered 
    ? (feedQuery.data?.pages[0] as any)?.latest_crawl // 타입 단언이 필요할 수 있습니다 (API 타입에 따라)
    : undefined;

  // 5. 렌더링 (단 하나의 return 문)
  return (
    <DashboardLayout
      rightSidebar={<RightSidebar selectedPeriod={selectedPeriod} />}
    >
      <div className="p-6">
        {/* 상단 헤더 & 필터 영역 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Market Insight
              </h1>
              <p className="text-gray-600">
                ESG SaaS 기업들의 최신 뉴스와 시장 동향을 분석합니다
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <PeriodFilter
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
              <CompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
            </div>
          </div>
        </div>

        {/* 메인 피드 영역 */}
        <div>
          <ArticleFeed
            articles={articles}
            totalCount={totalCount}
            latestCrawl={latestCrawl}
            isLoading={activeQuery.isLoading}
            isError={activeQuery.isError}
            error={activeQuery.error}
            hasNextPage={activeQuery.hasNextPage}
            isFetchingNextPage={activeQuery.isFetchingNextPage}
            fetchNextPage={() => activeQuery.fetchNextPage()}
            layout="grid"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}