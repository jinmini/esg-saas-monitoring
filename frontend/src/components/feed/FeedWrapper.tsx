import React from 'react';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeedWrapperProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: any[] | undefined;
  skeletonCount?: number;
  children: React.ReactNode;
}

export function FeedWrapper({
  isLoading,
  isError,
  error,
  data,
  skeletonCount = 6,
  children,
}: FeedWrapperProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
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

  if (!data || data.length === 0) {
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

  return <>{children}</>;
}