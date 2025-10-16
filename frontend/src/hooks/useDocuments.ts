import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import type { APIDocumentListParams, APIDocumentListResponse } from '@/types/api';

/**
 * 문서 목록을 가져오는 React Query Hook
 * 
 * @param params - 검색, 필터, 정렬 옵션
 * @returns 문서 목록 데이터, 로딩 상태, 에러
 */
export const useDocuments = (params?: APIDocumentListParams) => {
  return useQuery<APIDocumentListResponse, Error>({
    queryKey: ['documents', params],
    queryFn: async () => {
      return documentsApi.getList(params);
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

