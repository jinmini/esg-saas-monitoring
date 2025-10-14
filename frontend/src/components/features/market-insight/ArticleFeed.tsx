'use client';

import React from 'react';
import { ArticleCard } from './ArticleCard';
import { Button } from '@/components/ui/Button';
import { FeedWrapper } from './FeedWrapper'; // 1단계에서 만든 래퍼 임포트
import type { Article } from '@/types/api';

interface ArticleFeedProps {
  // 데이터 fetching 관련 props
  articles: Article[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  totalCount: number;
  latestCrawl?: string;

  // 페이지네이션 관련 props
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;

  // 레이아웃 제어 prop
  layout?: 'grid' | 'list';
}

export function ArticleFeed({
  articles,
  isLoading,
  isError,
  error,
  totalCount,
  latestCrawl,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  layout = 'grid', // 기본값은 그리드
}: ArticleFeedProps) {
  const layoutClasses = {
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    list: 'space-y-6',
  };

  return (
    <FeedWrapper
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={articles}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>개의 뉴스</p>
            {latestCrawl && <p className="text-xs text-gray-500">마지막 업데이트: {new Date(latestCrawl).toLocaleString('ko-KR')}</p>}
        </div>

        {/* Article Cards */}
        <div className={layoutClasses[layout]}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Load More Button */}
        {hasNextPage && fetchNextPage && (
          <div className="flex justify-center pt-8">
            <Button
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              loading={isFetchingNextPage}
              variant="outline"
              size="lg"
            >
              {isFetchingNextPage ? '로딩 중...' : '더 보기'}
            </Button>
          </div>
        )}
      </div>
    </FeedWrapper>
  );
}