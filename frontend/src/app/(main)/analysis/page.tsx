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
              <p className="text-sm text-gray-600">
                유럽 중심 ESG SaaS 생태계 분석 (53개 기업, 14개국)
              </p>
            </div>

            {/* 개발 모드 토글 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  showGrid
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 size={16} />
                {showGrid ? 'Grid ON' : 'Grid OFF'}
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <Layers size={16} />
                Phase 3-2 완료
              </div>
            </div>
          </div>
        </header>

        {/* 지도 컨테이너 */}
        <div className="flex-1 relative">
          <WorldMapContainer showGrid={showGrid} />

          {/* 인포 패널 (우측 상단) */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg max-w-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              🎯 테스트 시나리오
            </h3>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>세계 지도 → 6개 대륙 마커 표시</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>유럽 마커 클릭 → 자동 확대</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>14개 국가 마커 표시</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <span>Hover → 국가 정보 패널</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">5.</span>
                <span>ESC 키 → 세계 지도 복귀</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Grid 토글로 좌표 디버깅 가능
              </p>
            </div>
          </div>

          {/* 범례 (좌측 하단) */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📊 마커 범례
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Core ESG Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">Operational ESG Enabler</span>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200 text-gray-600">
                마커 크기 = 기업 수 (18~45px)
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
