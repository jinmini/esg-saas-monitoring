import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { articlesApi, trendsApi } from '@/lib/api';
import type { ArticleListParams, TrendParams, ArticleListResponse, CompanyArticlesResponse } from '@/types/api';

export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: ArticleListParams) => [...articleKeys.lists(), params] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: number) => [...articleKeys.details(), id] as const,
  feed: (params?: Pick<ArticleListParams, 'size' | 'period'>) => [...articleKeys.all, 'feed', params] as const,
  companies: () => ['companies'] as const,
};

export const trendKeys = {
  all: ['trends'] as const,
  companies: (params?: TrendParams) => [...trendKeys.all, 'companies', params] as const,
  categories: (params?: TrendParams) => [...trendKeys.all, 'categories', params] as const,
};

export const companyKeys = {
  all: ['company'] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyKeys.details(), id] as const,
  stats: (id: number) => [...companyKeys.detail(id), 'stats'] as const,
  articles: (id: number, params?: Pick<ArticleListParams, 'page' | 'size' | 'period'>) => [...companyKeys.detail(id), 'articles', params] as const,
};

type InfiniteFeedParams = Pick<ArticleListParams, 'size' | 'period'> & { enabled?: boolean };
type CompanyArticlesParams = Pick<ArticleListParams, 'page' | 'size' | 'period'> & { enabled?: boolean };
type ArticlesListParamsWithEnabled = ArticleListParams & { enabled?: boolean };
type TrendHookParams = TrendParams & { enabled?: boolean };

export function useArticlesFeed(params: InfiniteFeedParams) {
  const { enabled = true, ...apiParams } = params;

  return useInfiniteQuery({
    queryKey: articleKeys.feed(apiParams),
    queryFn: ({ pageParam = 1 }) =>
      articlesApi.getFeed({ ...apiParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled,
  });
}

export function useArticlesList(params: ArticlesListParamsWithEnabled) {
  const { enabled = true, ...apiParams } = params;

  return useQuery({
    queryKey: articleKeys.list(apiParams),
    queryFn: () => articlesApi.getList(apiParams),
    enabled: enabled,
  });
}

export function useArticle(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articlesApi.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCompanyTrends(params: TrendHookParams) {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: trendKeys.companies(apiParams),
    queryFn: () => trendsApi.getCompanyTrends(apiParams),
    staleTime: 5 * 60 * 1000, // 5 minutes for period-filtered data
    retry: 1,
    enabled: enabled,
  });
}

export function useCategoryTrends(params: TrendHookParams) {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: trendKeys.categories(apiParams),
    queryFn: () => trendsApi.getCategoryTrends(apiParams),
    staleTime: 5 * 60 * 1000, // 5 minutes for period-filtered data
    retry: 1,
    enabled: enabled,
  });
}

export function useCompanyStats(companyId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: companyKeys.stats(companyId),
    queryFn: () => articlesApi.getCompanyStats(companyId),
    enabled: !!companyId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCompanyArticles(companyId: number, params: CompanyArticlesParams) {
  const { enabled = true, ...apiParams } = params;
  
  return useInfiniteQuery({
    queryKey: companyKeys.articles(companyId, apiParams),
    queryFn: ({ pageParam = 1 }) =>
      articlesApi.getCompanyArticles(companyId, { ...apiParams, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.has_next ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!companyId && enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useCompanies(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: articleKeys.companies(),
    queryFn: () => articlesApi.getCompanies(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}