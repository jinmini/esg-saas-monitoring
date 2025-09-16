'use client';

import React from 'react';
import { ArticleCard } from './ArticleCard';
import { SkeletonCard, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useArticlesFeed } from '@/hooks/useArticles';
import { AlertCircle } from 'lucide-react';

interface ArticleListProps {
  pageSize?: number;
}

export function ArticleList({ pageSize = 10 }: ArticleListProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useArticlesFeed({ size: pageSize });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: pageSize }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          뉴스를 불러오는데 실패했습니다
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const articles = data?.pages.flatMap((page) => page.articles) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          등록된 뉴스가 없습니다
        </h3>
        <p className="text-gray-600">
          새로운 뉴스가 등록되면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span>개의 뉴스
        </p>
        {data?.pages[0]?.latest_crawl && (
          <p className="text-xs text-gray-500">
            마지막 업데이트: {new Date(data.pages[0].latest_crawl).toLocaleString('ko-KR')}
          </p>
        )}
      </div>

      {/* Article Cards */}
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            loading={isFetchingNextPage}
            variant="outline"
            size="lg"
          >
            {isFetchingNextPage ? '로딩 중...' : '더 보기'}
          </Button>
        </div>
      )}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={`loading-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
}
