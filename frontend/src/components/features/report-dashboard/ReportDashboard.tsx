'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments, useCreateDocument, useCreateDocumentFromTemplate } from '@/hooks';
import { ReportGrid } from './ReportGrid';
import { TemplateSelectModal, TEMPLATES } from './TemplateSelectModal';
import type { APIDocumentCreateRequest } from '@/types/api';

/**
 * 보고서 대시보드 메인 컨테이너
 * - 문서 목록 표시
 * - 새 문서 생성 (빈 문서 또는 템플릿)
 * - 검색 및 필터링
 */
export const ReportDashboard: React.FC = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 문서 목록 fetch
  const { data, isLoading, isError, error } = useDocuments({
    is_template: false, // 템플릿 제외
    sort_by: 'updated_at',
    sort_order: 'desc',
  });

  // 빈 문서 생성 mutation
  const createMutation = useCreateDocument();

  // 템플릿에서 생성 mutation
  const createFromTemplateMutation = useCreateDocumentFromTemplate();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectTemplate = async (templateId: string, title: string) => {
    if (templateId === 'blank') {
      // 빈 문서 생성
      const newDocument: APIDocumentCreateRequest = {
        title,
        description: '',
        is_public: false,
        is_template: false,
        sections: [
          {
            title: '섹션 1',
            description: '',
            order: 0,
            blocks: [],
          },
        ],
      };

      createMutation.mutate(
        { document: newDocument },
        {
          onSuccess: (createdDoc) => {
            setIsModalOpen(false);
            router.push(`/report/${createdDoc.id}`);
          },
        }
      );
    } else {
      // 템플릿에서 생성 (추후 템플릿 ID로 교체)
      // 현재는 mock이므로 빈 문서로 생성
      const newDocument: APIDocumentCreateRequest = {
        title: `${title} (${TEMPLATES.find((t) => t.id === templateId)?.name})`,
        description: TEMPLATES.find((t) => t.id === templateId)?.description || '',
        is_public: false,
        is_template: false,
        sections: [
          {
            title: '소개',
            description: '',
            order: 0,
            blocks: [],
          },
          {
            title: 'ESG 성과',
            description: '',
            order: 1,
            blocks: [],
          },
        ],
      };

      createMutation.mutate(
        { document: newDocument },
        {
          onSuccess: (createdDoc) => {
            setIsModalOpen(false);
            router.push(`/report/${createdDoc.id}`);
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || createFromTemplateMutation.isPending;

  return (
    <div className="p-6 md:p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">보고서 관리</h1>
        <p className="text-gray-600 mt-2">
          ESG 보고서를 작성하고 관리하세요.
        </p>
      </div>

      {/* 보고서 그리드 */}
      <ReportGrid
        documents={data?.documents || []}
        isLoading={isLoading}
        isError={isError}
        error={error || null}
        onCreateNew={handleOpenModal}
      />

      {/* 템플릿 선택 모달 */}
      <TemplateSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSelectTemplate}
        isPending={isPending}
      />
    </div>
  );
};

