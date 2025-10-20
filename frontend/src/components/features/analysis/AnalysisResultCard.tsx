'use client';

import React from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Award,
  FileText,
} from 'lucide-react';
import type { AnalysisResult } from '@/types/analysis';
import { INDUSTRY_LABELS, SIZE_LABELS } from '@/lib/analysis-engine';

interface AnalysisResultCardProps {
  result: AnalysisResult;
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  return (
    <div className="space-y-6">
      {/* 고객사 정보 요약 */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 bg-white rounded-full border border-gray-200">
            🏢 {INDUSTRY_LABELS[result.profile.industry]}
          </span>
          <span className="px-3 py-1 bg-white rounded-full border border-gray-200">
            👥 {SIZE_LABELS[result.profile.size]}
          </span>
          {result.profile.exportToEU && (
            <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-200 text-blue-700">
              🌍 EU 수출
            </span>
          )}
          {result.profile.listed && (
            <span className="px-3 py-1 bg-purple-50 rounded-full border border-purple-200 text-purple-700">
              📈 상장사
            </span>
          )}
        </div>
      </div>

      {/* 1. 규제 영향도 */}
      <section className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">적용 규제</h3>
        </div>
        <div className="space-y-3">
          {result.regulatoryImpacts.map((impact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {impact.status === 'required' && (
                    <CheckCircle size={18} className="text-red-500" />
                  )}
                  {impact.status === 'upcoming' && (
                    <Clock size={18} className="text-orange-500" />
                  )}
                  {impact.status === 'recommended' && (
                    <Target size={18} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{impact.name}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        impact.status === 'required'
                          ? 'bg-red-100 text-red-700'
                          : impact.status === 'upcoming'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {impact.status === 'required'
                        ? '필수'
                        : impact.status === 'upcoming'
                          ? '예정'
                          : '권장'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {impact.description}
                  </p>
                  {impact.effectiveDate && (
                    <p className="text-xs text-gray-500">
                      시행: {impact.effectiveDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. 프레임워크 추천 */}
      <section className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">권장 프레임워크</h3>
        </div>
        <div className="space-y-3">
          {result.frameworks.map((fw, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold text-sm rounded-full">
                  {fw.priority}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {fw.framework}
                  </h4>
                  <p className="text-sm text-gray-600">{fw.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 온실가스 인벤토리 범위 */}
      <section className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            온실가스 인벤토리 권장 범위
          </h3>
        </div>
        <div className="space-y-4">
          {/* Scope 1 & 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium text-gray-900">Scope 1:</span>
              <span className="text-gray-600">직접 배출 (필수)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium text-gray-900">Scope 2:</span>
              <span className="text-gray-600">간접 배출 - 전기/스팀 (필수)</span>
            </div>
          </div>

          {/* Scope 3 */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">
              🔍 Scope 3 핵심 카테고리:
            </p>
            <div className="space-y-2">
              {result.inventoryScope.scope3Categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        cat.relevance === 'high'
                          ? 'bg-red-100 text-red-700'
                          : cat.relevance === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.relevance === 'high'
                        ? '높음'
                        : cat.relevance === 'medium'
                          ? '중간'
                          : '낮음'}
                    </span>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        Category {cat.id}: {cat.name}
                      </h5>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 벤치마크 */}
      <section className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">산업 벤치마크</h3>
        </div>
        <div className="space-y-4">
          {/* 산업 평균 */}
          <div>
            <p className="text-sm text-gray-600 mb-2">산업 평균 공시율</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-600 h-full transition-all"
                  style={{ width: `${result.benchmark.industryAverage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {result.benchmark.industryAverage}%
              </span>
            </div>
          </div>

          {/* 선도 기업 */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">
              🏆 선도 기업:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.benchmark.topPerformers.map((company, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>

          {/* 차별화 포인트 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              💡 차별화 포인트
            </p>
            <p className="text-sm text-blue-700">
              {result.benchmark.differentiationPoint}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

