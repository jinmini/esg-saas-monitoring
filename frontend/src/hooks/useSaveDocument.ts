/**
 * useSaveDocument Hook
 * 
 * React Query 기반 문서 저장 mutation
 * - Bulk Update API 사용
 * - Optimistic Update 지원
 * - DocumentNode → API 형식 자동 변환
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import { documentNodeToApiBulkUpdate, apiDocumentToDocumentNode } from '@/lib/documentConverter';
import { DocumentNode } from '@/types/editor/document';
import { useUIStore } from '@/store/uiStore';

interface SaveDocumentParams {
  documentId: number;
  document: DocumentNode;
}

export function useSaveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, document }: SaveDocumentParams) => {
      console.log('🔄 [useSaveDocument] Starting save...', { documentId });
      console.log('📄 [useSaveDocument] Document to save:', document);
      
      // Frontend DocumentNode → Backend API 형식 변환
      const bulkUpdateRequest = documentNodeToApiBulkUpdate(document);
      console.log('📦 [useSaveDocument] Bulk update request:', bulkUpdateRequest);

      // API 호출
      const response = await documentsApi.bulkUpdate(documentId, bulkUpdateRequest);
      console.log('✅ [useSaveDocument] API response:', response);

      // Backend 응답 → Frontend DocumentNode 변환
      return apiDocumentToDocumentNode(response.document);
    },

    // Optimistic Update
    onMutate: async ({ documentId, document }) => {
      // 이전 데이터 취소 (경쟁 조건 방지)
      await queryClient.cancelQueries({ queryKey: ['document', documentId] });

      // 이전 데이터 스냅샷 저장
      const previousDocument = queryClient.getQueryData<DocumentNode>(['document', documentId]);

      // Optimistic Update 적용
      queryClient.setQueryData<DocumentNode>(['document', documentId], document);

      // 롤백용 컨텍스트 반환
      return { previousDocument };
    },

    // 에러 시 롤백
    onError: (error, { documentId }, context) => {
      if (context?.previousDocument) {
        queryClient.setQueryData(['document', documentId], context.previousDocument);
      }
      console.error('❌ Save failed:', error);
    },

    // ✅ 성공 시: 서버 응답으로 캐시를 덮어쓰지 않음 (Optimistic Update만 사용)
    // 이유: 사용자가 타이핑 중인데 서버 응답이 오면 입력 중인 내용이 덮어써질 수 있음
    onSuccess: (_savedDocument, { documentId }) => {
      console.log(`💾 Document ${documentId} saved successfully`);

      // ❌ setQueryData 호출 안 함 (이미 onMutate에서 Optimistic Update 완료)
      // queryClient.setQueryData(['document', documentId], savedDocument);

      const uiStore = useUIStore.getState();
      uiStore.setSaveStatus('saved');
      uiStore.setDirty(false);
    },
  });
}

