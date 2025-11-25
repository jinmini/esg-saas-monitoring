'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Grid3x3, Layers, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorldMapContainer } from '@/components/features/map';
import { useESGMapStore } from '@/store/esgMapStore';
import type { ESGMapData } from '@/types/esg-map';

export default function AnalysisPage() {
  const [showGrid, setShowGrid] = useState(false);
  
  // Store 구독
  const isLoading = useESGMapStore((state) => state.isLoading);
  const error = useESGMapStore((state) => state.error);
  const companies = useESGMapStore((state) => state.companies);
  const setCompanies = useESGMapStore((state) => state.setCompanies);
  const setLoading = useESGMapStore((state) => state.setLoading);
  const setError = useESGMapStore((state) => state.setError);

  // 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      // 이미 로드되었으면 스킵
      if (companies.length > 0) return;

      setLoading(true);
      try {
        const response = await fetch('/data/esg_companies_global.json');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        const data: ESGMapData = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Failed to load ESG companies data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadData();
  }, [companies.length, setCompanies, setLoading, setError]);

  // 로딩 상태
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
            <p className="text-gray-600">ESG 기업 데이터 로딩 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">데이터 로딩 실패</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative w-full h-full flex flex-col">
        {/* 헤더 */}
        <header className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="text-green-600" size={28} />
                ESG SaaS 글로벌 지도
              </h1>
            </div>

          </div>
        </header>

        {/* 지도 컨테이너 */}
        <div className="flex-1 relative">
          <WorldMapContainer showGrid={showGrid} />
        </div>
      </div>
    </DashboardLayout>
  );
}
