import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import type { APIDocumentCreateRequest } from '@/types/api';

/**
 * 새 문서를 생성하는 React Query Mutation Hook
 * 
 * @returns mutation 객체 (mutate, isPending, error 등)
 */
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { document: APIDocumentCreateRequest; userId?: number }) => {
      return documentsApi.create(data.document, data.userId);
    },
    onSuccess: () => {
      // 문서 목록 캐시 무효화 (재fetch 트리거)
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useCreateDocument] Document created successfully');
      }
    },
    onError: (error: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useCreateDocument] Failed to create document:', error);
      }
    },
  });
};

/**
 * 템플릿에서 문서를 생성하는 React Query Mutation Hook
 * 
 * @returns mutation 객체 (mutate, isPending, error 등)
 */
export const useCreateDocumentFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { templateId: number; title: string; userId?: number }) => {
      return documentsApi.createFromTemplate(data.templateId, data.title, data.userId);
    },
    onSuccess: () => {
      // 문서 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useCreateDocumentFromTemplate] Document created from template');
      }
    },
    onError: (error: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useCreateDocumentFromTemplate] Failed to create from template:', error);
      }
    },
  });
};

