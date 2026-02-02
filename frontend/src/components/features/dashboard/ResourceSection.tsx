'use client';

import { ResourceCard } from '@/components/features/dashboard/ResourceCard';
import { ResourceMetadata } from '@/types/resource';

interface ResourceSectionProps {
  initialResources: ResourceMetadata[];
}

export function ResourceSection({ initialResources }: ResourceSectionProps) {
  return (
    <section className="pt-16 pb-12 border-t border-gray-100">

      {/* 1. 섹션 헤더 (Clean Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Research Reports
          </h2>
          <p className="text-gray-500 text-lg">
            ESG SaaS 솔루션에 대한 분석 리포트를 확인하세요.
          </p>
        </div>
      </div>

      {/* 2. 메인 리소스 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {initialResources.map((resource) => (
          <div key={resource.slug} className="h-full">
            <ResourceCard data={resource} />
          </div>
        ))}
      </div>

    </section>
  );
}
