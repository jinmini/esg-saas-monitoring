'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RightSidebar } from '@/components/features/market-insight/RightSidebar';
import { ArticleFeed } from '@/components/features/market-insight/ArticleFeed';
import { PeriodFilter } from '@/components/features/market-insight/PeriodFilter';
import { CompanyFilter } from '@/components/features/market-insight/CompanyFilter';
import { useArticlesFeed, useCompanyArticles } from '@/hooks/useArticles';
import type { ArticleListResponse, CompanyArticlesResponse } from '@/types/api';

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const isCompanyFiltered = Boolean(selectedCompanyId);

  const feedQuery = useArticlesFeed({
    size: 10,
    period: selectedPeriod,
    enabled: !isCompanyFiltered,
  });

  const companyQuery = useCompanyArticles(selectedCompanyId!, {
    page: 1,
    size: 10,
    period: selectedPeriod,
    enabled: isCompanyFiltered,
  });

  if (isCompanyFiltered) {
    const articles =
      companyQuery.data?.pages.flatMap(
        (page: CompanyArticlesResponse) => page.articles
      ) ?? [];
    const totalCount = companyQuery.data?.pages[0]?.total ?? 0;

    return (
      <DashboardLayout
        rightSidebar={<RightSidebar selectedPeriod={selectedPeriod} />}
      >
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Market Insight
                </h1>
                <p className="text-gray-600">
                  ESG SaaS 기업들의 최신 뉴스와 시장 동향을 분석합니다
                </p>
              </div>

              <div className="flex items-center space-x-4">
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

            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>ESG Service</strong> 또는{' '}
                <strong>기업별 category</strong> 필터링, 정렬 기능
              </p>
              <p className="text-blue-600 text-xs mt-1">
                향후 고급 필터링 및 카테고리별 분류 기능이 추가될 예정입니다.
              </p>
            </div> */}
          </div>

          <div>
            <ArticleFeed
              articles={articles}
              totalCount={totalCount}
              isLoading={companyQuery.isLoading}
              isError={companyQuery.isError}
              error={companyQuery.error}
              hasNextPage={companyQuery.hasNextPage}
              isFetchingNextPage={companyQuery.isFetchingNextPage}
              fetchNextPage={() => companyQuery.fetchNextPage()}
              layout="grid"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  } else {
    const articles =
      feedQuery.data?.pages.flatMap(
        (page: ArticleListResponse) => page.articles
      ) ?? [];
    const totalCount = feedQuery.data?.pages[0]?.total ?? 0;
    const latestCrawl = feedQuery.data?.pages[0]?.latest_crawl;

    return (
      <DashboardLayout
        rightSidebar={<RightSidebar selectedPeriod={selectedPeriod} />}
      >
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Market Insight
                </h1>
                <p className="text-gray-600">
                  ESG SaaS 기업들의 최신 뉴스와 시장 동향을 분석합니다
                </p>
              </div>

              <div className="flex items-center space-x-4">
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

            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>ESG Service</strong> 또는{' '}
                <strong>기업별 category</strong> 필터링, 정렬 기능
              </p>
              <p className="text-blue-600 text-xs mt-1">
                향후 고급 필터링 및 카테고리별 분류 기능이 추가될 예정입니다.
              </p>
            </div> */}
          </div>

          <div>
            <ArticleFeed
              articles={articles}
              totalCount={totalCount}
              latestCrawl={latestCrawl}
              isLoading={feedQuery.isLoading}
              isError={feedQuery.isError}
              error={feedQuery.error}
              hasNextPage={feedQuery.hasNextPage}
              isFetchingNextPage={feedQuery.isFetchingNextPage}
              fetchNextPage={() => feedQuery.fetchNextPage()}
              layout="grid"
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }
}