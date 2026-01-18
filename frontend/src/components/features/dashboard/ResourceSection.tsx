'use client';

import { ResourceCard } from '@/components/features/dashboard/ResourceCard';
import { ResourceMetadata } from '@/types/resource';
import { useState } from 'react';

// 카테고리 정의
const CATEGORIES = [
  { name: 'All', href: '/resources' },
  { name: 'Regulation', href: '/resources/regulation' },
  { name: 'Insights', href: '/resources/insights' },
  { name: 'Tech', href: '/resources/tech' },
];

interface ResourceSectionProps {
  initialResources: ResourceMetadata[];
}

export function ResourceSection({ initialResources }: ResourceSectionProps) {
  const [activeTab, setActiveTab] = useState('All');

  const filteredResources = activeTab === 'All'
    ? initialResources
    : initialResources.filter(r => r.category === activeTab);

  return (
    <section className="pt-16 pb-12 border-t border-gray-100">

      {/* 1. 섹션 헤더 (Clean Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Knowledge Base
          </h2>
          <p className="text-gray-500">
            ESG 전문가를 위한 최신 가이드와 인사이트를 확인하세요.
          </p>
        </div>

        {/* 카테고리 탭 (Minimal Pill Style) */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveTab(category.name)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${activeTab === category.name
                  ? 'bg-gray-900 text-white shadow-md' // Active: Black Pill
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900' // Inactive: Outline
                }
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 메인 리소스 그리드 (유지하되 간격 조정) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {filteredResources.slice(0, 3).map((resource) => (
          <div key={resource.slug} className="h-full">
            <ResourceCard data={resource} />
          </div>
        ))}
      </div>

    </section>
  );
}
