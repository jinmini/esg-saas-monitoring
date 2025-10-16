/**
 * useCreateVersion Hook
 * 
 * React Query 기반 버전 생성 mutation
 * - 수동 저장 버전 생성 (comment 포함)
 * - 자동 저장 버전 생성 (comment 없음)
 * - 생성 후 버전 목록 자동 갱신
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsApi } from '@/lib/api';
import type { VersionCreate, VersionResponse } from '@/types/api';

interface CreateVersionParams {
  documentId: number;
  data: VersionCreate;
}

interface UseCreateVersionOptions {
  /** 성공 시 콜백 */
  onSuccess?: (version: VersionResponse) => void;
  /** 에러 시 콜백 (AxiosError 등 다양한 타입 대응) */
  onError?: (error: unknown) => void;
}

/**
 * 버전을 생성하는 mutation hook
 * 
 * @param options - 성공/에러 콜백
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const { mutate: createVersion, isPending } = useCreateVersion({
 *   onSuccess: (version) => {
 *     toast.success(`버전 ${version.version_number} 저장 완료`);
 *   }
 * });
 * 
 * // 수동 저장
 * createVersion({
 *   documentId: 1,
 *   data: { comment: '초안 완성', is_auto_saved: false }
 * });
 * 
 * // 자동 저장
 * createVersion({
 *   documentId: 1,
 *   data: { is_auto_saved: true }
 * });
 * ```
 */
export function useCreateVersion(options?: UseCreateVersionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, data }: CreateVersionParams): Promise<VersionResponse> => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useCreateVersion] Creating version...', { documentId, data });
      }
      
      const version = await versionsApi.create(documentId, data);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [useCreateVersion] Version created:', version);
      }
      return version;
    },

    onSuccess: (version, { documentId }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Version ${version.version_number} created for document ${documentId}`);
      }

      // 버전 목록 캐시 무효화 → 자동 refetch
      queryClient.invalidateQueries({
        queryKey: ['versions', documentId],
      });

      // 사용자 정의 콜백 실행
      options?.onSuccess?.(version);
    },

    onError: (error: unknown, { documentId }) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [useCreateVersion] Failed for document ${documentId}:`, error);
      }
      
      // 사용자 정의 콜백 실행
      options?.onError?.(error);
    },
  });
}

