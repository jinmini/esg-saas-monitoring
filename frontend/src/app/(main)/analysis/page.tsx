'use client';

import React, { useState } from 'react';
import { Search, BookOpen, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CustomerProfileForm } from '@/components/features/analysis/CustomerProfileForm';
import { AnalysisResultCard } from '@/components/features/analysis/AnalysisResultCard';
import { FrameworkGuide } from '@/components/features/analysis/FrameworkGuide';
import { RegulatoryTimeline } from '@/components/features/analysis/RegulatoryTimeline';
import type { CustomerProfile, AnalysisResult } from '@/types/analysis';
import { analyzeCustomer } from '@/lib/analysis-engine';

type Section = 'quick-analysis' | 'framework-guide' | 'timeline';

export default function AnalysisPage() {
  const [activeSection, setActiveSection] = useState<Section>('quick-analysis');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (profile: CustomerProfile) => {
    setIsAnalyzing(true);
    try {
      // 분석 실행
      const result = await analyzeCustomer(profile);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 헤더 */}
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              고객사 분석 도구
            </h1>
            <p className="text-gray-600">
              고객사 프로필 기반 ESG 규제, 프레임워크, 인벤토리 범위를 빠르게
              분석합니다
            </p>
          </header>

          {/* 섹션 네비게이션 */}
          <nav className="flex gap-3 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveSection('quick-analysis')}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeSection === 'quick-analysis'
                  ? 'bg-white border border-b-0 border-gray-200 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search size={16} />
              Quick Analysis
            </button>
            <button
              onClick={() => setActiveSection('framework-guide')}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeSection === 'framework-guide'
                  ? 'bg-white border border-b-0 border-gray-200 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen size={16} />
              프레임워크 가이드
            </button>
            <button
              onClick={() => setActiveSection('timeline')}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeSection === 'timeline'
                  ? 'bg-white border border-b-0 border-gray-200 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              규제 타임라인
            </button>
          </nav>

          {/* 섹션 컨텐츠 */}
          <div className="space-y-8">
            {/* Quick Analysis */}
            {activeSection === 'quick-analysis' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 입력 폼 */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="p-6 bg-white border border-gray-200 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        고객사 정보 입력
                      </h2>
                      <CustomerProfileForm
                        onAnalyze={handleAnalyze}
                        isLoading={isAnalyzing}
                      />
                      {analysisResult && (
                        <button
                          onClick={handleReset}
                          className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 분석 결과 */}
                <div className="lg:col-span-2">
                  {analysisResult ? (
                    <AnalysisResultCard result={analysisResult} />
                  ) : (
                    <div className="p-12 bg-white border border-gray-200 rounded-lg text-center">
                      <Search size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        고객사 정보를 입력하고 분석하기 버튼을 눌러주세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 프레임워크 가이드 */}
            {activeSection === 'framework-guide' && <FrameworkGuide />}

            {/* 규제 타임라인 */}
            {activeSection === 'timeline' && <RegulatoryTimeline />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
