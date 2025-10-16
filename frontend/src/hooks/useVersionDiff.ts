import { useQuery } from '@tanstack/react-query';
import { versionsApi } from '@/lib/api';
import type { VersionDiffRequest, VersionDiffResponse } from '@/types/api';

interface UseVersionDiffParams {
  documentId: number | null;
  sourceVersionId: number | null;
  targetVersionId?: number | null;
  enabled?: boolean;
}

/**
 * 두 버전 간 차이점 조회 Hook
 * 
 * @param documentId - 문서 ID
 * @param sourceVersionId - 비교 기준 버전 ID
 * @param targetVersionId - 비교 대상 버전 ID (null이면 현재 문서와 비교)
 * @param enabled - 쿼리 활성화 여부
 * 
 * @returns React Query result with diff data
 * 
 * @example
 * ```tsx
 * const { data: diff, isLoading } = useVersionDiff({
 *   documentId: 1,
 *   sourceVersionId: 5,
 *   targetVersionId: 6,
 * });
 * ```
 */
export const useVersionDiff = ({
  documentId,
  sourceVersionId,
  targetVersionId,
  enabled = true,
}: UseVersionDiffParams) => {
  return useQuery<VersionDiffResponse, Error>({
    queryKey: [
      'version-diff',
      documentId,
      sourceVersionId,
      targetVersionId,
    ],
    queryFn: async () => {
      if (!documentId || !sourceVersionId) {
        throw new Error('Document ID and Source Version ID are required');
      }

      const request: VersionDiffRequest = {
        source_version_id: sourceVersionId,
        target_version_id: targetVersionId ?? undefined,
      };

      return versionsApi.compare(documentId, request);
    },
    enabled: Boolean(documentId && sourceVersionId && enabled),
    staleTime: 5 * 60 * 1000, // 5분 (Diff는 변하지 않음)
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1,
  });
};

