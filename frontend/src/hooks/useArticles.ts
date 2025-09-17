import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { articlesApi, trendsApi } from '@/lib/api';
import type { ArticleListParams, TrendParams } from '@/types/api';

// Query Keys
export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: ArticleListParams) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: number) => [...articleKeys.details(), id] as const,
  feed: (params?: Pick<ArticleListParams, 'page' | 'size'>) => [...articleKeys.all, 'feed', params] as const,
  companies: () => ['companies'] as const,
};

export const trendKeys = {
  all: ['trends'] as const,
  companies: (params?: TrendParams) => [...trendKeys.all, 'companies', params] as const,
  categories: (params?: TrendParams) => [...trendKeys.all, 'categories', params] as const,
};

// Hook for getting articles feed with infinite scroll
export function useArticlesFeed(params?: Pick<ArticleListParams, 'size'>) {
  return useInfiniteQuery({
    queryKey: articleKeys.feed(params),
    queryFn: ({ pageParam = 1 }) =>
      articlesApi.getFeed({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

// Hook for getting articles list with filters
export function useArticlesList(params?: ArticleListParams) {
  return useQuery({
    queryKey: articleKeys.list(params || {}),
    queryFn: () => articlesApi.getList(params),
    enabled: true,
  });
}

// Hook for getting single article
export function useArticle(id: number) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articlesApi.getById(id),
    enabled: !!id,
  });
}

// Hook for getting companies list
export function useCompanies() {
  return useQuery({
    queryKey: articleKeys.companies(),
    queryFn: () => articlesApi.getCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes - companies don't change often
  });
}

// Trend Hooks
export function useCompanyTrends(params?: TrendParams) {
  return useQuery({
    queryKey: trendKeys.companies(params),
    queryFn: () => trendsApi.getCompanyTrends(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - trends update daily
    retry: 1, // MVP: simple retry logic
  });
}

export function useCategoryTrends(params?: TrendParams) {
  return useQuery({
    queryKey: trendKeys.categories(params),
    queryFn: () => trendsApi.getCategoryTrends(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - trends update daily
    retry: 1, // MVP: simple retry logic
  });
}
