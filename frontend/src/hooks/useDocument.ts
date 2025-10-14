/**
 * useDocument Hook
 * 
 * React Query 기반 문서 조회 hook
 * - 문서 불러오기
 * - 캐싱 및 자동 리패칭
 * - API Document → DocumentNode 자동 변환
 */

import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import { apiDocumentToDocumentNode } from '@/lib/documentConverter';
import { DocumentNode } from '@/types/editor/document';

interface UseDocumentOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export function useDocument(documentId: number | null, options?: UseDocumentOptions) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async (): Promise<DocumentNode> => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }

      // API 호출
      const apiDoc = await documentsApi.getById(documentId);

      // Frontend 타입으로 변환
      const documentNode = apiDocumentToDocumentNode(apiDoc);

      return documentNode;
    },
    enabled: !!documentId && (options?.enabled ?? true),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5분
    retry: 2,
  });
}

