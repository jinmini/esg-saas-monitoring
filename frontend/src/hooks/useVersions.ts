/**
 * useVersions Hook
 * 
 * React Query 기반 버전 목록 조회 hook
 * - 문서의 버전 타임라인 조회
 * - 자동 저장 버전 필터링 옵션
 * - 페이지네이션 지원 (skip/limit)
 */

import { useQuery } from '@tanstack/react-query';
import { versionsApi } from '@/lib/api';
import type { VersionListParams, VersionListResponse } from '@/types/api';

interface UseVersionsOptions {
  /** 자동 저장 버전 포함 여부 (기본: true) */
  includeAutoSaved?: boolean;
  /** skip (offset) */
  skip?: number;
  /** limit (페이지 크기) */
  limit?: number;
  /** Query 활성화 여부 */
  enabled?: boolean;
  /** Window focus 시 refetch 여부 */
  refetchOnWindowFocus?: boolean;
  /** Stale time (ms) */
  staleTime?: number;
}

/**
 * 문서의 버전 목록을 조회하는 hook
 * 
 * @param documentId - 대상 문서 ID
 * @param options - 필터 및 페이지네이션 옵션
 * @returns React Query result with VersionListResponse
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useVersions(documentId, {
 *   includeAutoSaved: false, // 수동 저장 버전만
 *   limit: 20
 * });
 * ```
 */
export function useVersions(
  documentId: number | null,
  options?: UseVersionsOptions
) {
  const {
    includeAutoSaved = true,
    skip = 0,
    limit = 50,
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 2 * 60 * 1000, // 2분
  } = options || {};

  return useQuery({
    // 페이지네이션 캐싱 최적화: queryKey는 documentId만 포함
    // params는 queryFn 내부에서 처리
    queryKey: ['versions', documentId],
    queryFn: async (): Promise<VersionListResponse> => {
      // documentId는 enabled 조건으로 검증됨
      const params: VersionListParams = {
        skip,
        limit,
        include_auto_saved: includeAutoSaved,
      };

      return await versionsApi.list(documentId!, params);
    },
    enabled: Boolean(documentId && enabled),
    refetchOnWindowFocus,
    staleTime,
    retry: 2,
    // 페이지 전환 시 이전 데이터 유지 (부드러운 UX)
    placeholderData: (previousData) => previousData,
  });
}

