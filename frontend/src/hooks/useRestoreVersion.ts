/**
 * useRestoreVersion Hook
 * 
 * React Query 기반 버전 복원 mutation
 * - 선택한 버전으로 문서 복원
 * - 현재 상태 자동 백업 (새 버전 생성)
 * - Optimistic Update로 즉시 UI 반영
 * - 문서 캐시 자동 갱신
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsApi } from '@/lib/api';
import { apiDocumentToDocumentNode } from '@/lib/documentConverter';
import type { VersionRestoreResponse } from '@/types/api';
import type { DocumentNode } from '@/types/editor/document';
import { useEditorStore } from '@/store/editorStore';

interface RestoreVersionParams {
  documentId: number;
  versionId: number;
}

interface UseRestoreVersionOptions {
  /** 성공 시 콜백 */
  onSuccess?: (result: VersionRestoreResponse) => void;
  /** 에러 시 콜백 (AxiosError 등 다양한 타입 대응) */
  onError?: (error: unknown) => void;
}

/**
 * 버전을 복원하는 mutation hook
 * 
 * @param options - 성공/에러 콜백
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const { mutate: restore, isPending } = useRestoreVersion({
 *   onSuccess: (result) => {
 *     toast.success(
 *       `버전 ${result.restored_version_number} 복원 완료\n` +
 *       `현재 상태는 버전 ${result.backup_version_number}에 백업됨`
 *     );
 *   }
 * });
 * 
 * restore({ documentId: 1, versionId: 5 });
 * ```
 */
export function useRestoreVersion(options?: UseRestoreVersionOptions) {
  const queryClient = useQueryClient();
  const { setDocument } = useEditorStore();

  return useMutation({
    mutationFn: async ({
      documentId,
      versionId,
    }: RestoreVersionParams): Promise<VersionRestoreResponse> => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [useRestoreVersion] Restoring version...', { documentId, versionId });
      }

      const result = await versionsApi.restore(documentId, versionId);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [useRestoreVersion] Version restored:', result);
      }
      return result;
    },

    onSuccess: (result, { documentId }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `💾 Version ${result.restored_version_number} restored for document ${documentId}`,
          `(backup: v${result.backup_version_number})`
        );
      }

      // 방어 코드: 백엔드 응답 검증
      if (!result.document) {
        console.warn('⚠️ Restore result missing document payload');
        options?.onError?.(new Error('복원된 문서 데이터가 없습니다.'));
        return;
      }

      // 1. 복원된 문서를 DocumentNode로 변환
      const restoredDocument = apiDocumentToDocumentNode(result.document);

      // 2. Zustand store에 복원된 문서 설정
      setDocument(restoredDocument);

      // 3. React Query 캐시 무효화 (setQueryData 대신 invalidate 사용)
      // → 다중 컴포넌트 구독 시 불일치 방지
      queryClient.invalidateQueries({
        queryKey: ['document', documentId],
      });

      // 4. 버전 목록 캐시 무효화 (백업 버전이 추가되었으므로)
      queryClient.invalidateQueries({
        queryKey: ['versions', documentId],
      });

      // 5. 사용자 정의 콜백 실행
      options?.onSuccess?.(result);
    },

    onError: (error: unknown, { documentId, versionId }) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `❌ [useRestoreVersion] Failed to restore version ${versionId} for document ${documentId}:`,
          error
        );
      }

      // 사용자 정의 콜백 실행
      options?.onError?.(error);
    },
  });
}

