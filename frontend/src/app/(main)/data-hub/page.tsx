'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArticleFeed } from '@/components/features/market-insight/ArticleFeed';
import { TrendingNow } from '@/components/features/market-insight/TrendingNow'; 
import { PeriodFilter } from '@/components/features/market-insight/PeriodFilter';
import { CompanyFilter } from '@/components/features/market-insight/CompanyFilter';
import { useArticlesFeed, useCompanyArticles } from '@/hooks/useArticles';

export default function MarketInsightPage() {
  // --- State ---
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const isCompanyFiltered = Boolean(selectedCompanyId);

  // --- Queries ---
  const feedQuery = useArticlesFeed({
    size: 10, // 사이드바가 생기므로 한 페이지 당 아이템 수를 조금 줄임 (선택 사항)
    period: selectedPeriod,
    enabled: !isCompanyFiltered,
  });

  const companyQuery = useCompanyArticles(selectedCompanyId!, {
    page: 1,
    size: 10,
    period: selectedPeriod,
    enabled: isCompanyFiltered,
  });

  // --- Data Logic ---
  const currentQuery = isCompanyFiltered ? companyQuery : feedQuery;
  
  const articles = useMemo(() => {
    return currentQuery.data?.pages.flatMap((page) => page.articles) ?? [];
  }, [currentQuery.data]);

  const totalCount = currentQuery.data?.pages[0]?.total ?? 0;
  
  const latestCrawl = !isCompanyFiltered 
    // @ts-ignore
    ? feedQuery.data?.pages[0]?.latest_crawl 
    : undefined;

  // --- Render ---
  return (
    <DashboardLayout>
      {/* 
        [Layout] 
        max-w-7xl: 전체 너비를 넓게 씀 (사이드바 공간 확보)
        mx-auto: 중앙 정렬
      */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Market Insight
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              ESG SaaS 기업들의 최신 뉴스와 시장 동향을 분석합니다
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
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

        {/* 2. Content Grid (Main Feed + Side Widget) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Article Feed (Occupies 8/12 columns on large screens) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="min-h-[400px]">
              <ArticleFeed
                articles={articles}
                totalCount={totalCount}
                latestCrawl={latestCrawl}
                isLoading={currentQuery.isLoading}
                isError={currentQuery.isError}
                error={currentQuery.error}
                hasNextPage={currentQuery.hasNextPage}
                isFetchingNextPage={currentQuery.isFetchingNextPage}
                fetchNextPage={() => currentQuery.fetchNextPage()}
                layout="grid" // or 'list'
              />
            </div>
          </div>

          {/* Right Column: Trending Widget (Occupies 4/12 columns on large screens) */}
          {/* 모바일에서는 하단으로 내려감 */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-20"> {/* 스크롤 시 따라오도록 sticky 설정 */}
              <TrendingNow selectedPeriod={selectedPeriod} />
              
              {/* 추가 공간: 추후 배너나 다른 위젯이 들어갈 자리 */}
              {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
                 Ad Space or Notice
              </div> */}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}