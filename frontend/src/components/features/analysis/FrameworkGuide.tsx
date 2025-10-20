'use client';

import React, { useState } from 'react';
import { BookOpen, Target, CheckSquare } from 'lucide-react';

type TabType = 'comparison' | 'metrics' | 'checklist';

export function FrameworkGuide() {
  const [activeTab, setActiveTab] = useState<TabType>('comparison');

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'comparison'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          프레임워크 비교
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'metrics'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          산업별 핵심 지표
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'checklist'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          온보딩 체크리스트
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        {activeTab === 'comparison' && <ComparisonTab />}
        {activeTab === 'metrics' && <MetricsTab />}
        {activeTab === 'checklist' && <ChecklistTab />}
      </div>
    </div>
  );
}

// 프레임워크 비교 탭
function ComparisonTab() {
  const frameworks = [
    {
      name: 'GRI Standards',
      purpose: '지속가능성 보고',
      keyPoints: [
        'GRI 2: 일반 공시 (조직 정보, 거버넌스 등)',
        'GRI 3: 중요 주제 (더블 머터리얼리티)',
        '주제별 Standards (GRI 200/300/400 시리즈)',
      ],
      suitable: ['모든 기업', '이해관계자 중심 보고'],
      mandatory: [],
    },
    {
      name: 'TCFD',
      purpose: '기후 관련 재무정보 공시',
      keyPoints: [
        '지배구조 (Governance)',
        '전략 (Strategy)',
        '리스크 관리 (Risk Management)',
        '지표 및 목표 (Metrics & Targets)',
      ],
      suitable: ['금융권', '투자자 대상 기업'],
      mandatory: ['상장사 (일부 국가)'],
    },
    {
      name: 'ISSB (IFRS S1/S2)',
      purpose: '지속가능성 재무 공시',
      keyPoints: [
        'S1: 일반 요구사항',
        'S2: 기후 관련 공시',
        'TCFD 권고안 포함',
      ],
      suitable: ['상장사', '국제 투자자 대상'],
      mandatory: ['K-IFRS 전환 예정 (2025년~)'],
    },
    {
      name: 'SASB',
      purpose: '산업별 재무적 중요 지표',
      keyPoints: [
        '77개 산업별 맞춤 지표',
        '재무적 영향 중심',
        'ESG 위험/기회 평가',
      ],
      suitable: ['산업 특화 보고', '투자자 중심'],
      mandatory: [],
    },
    {
      name: 'K-ESG',
      purpose: '한국형 ESG 평가',
      keyPoints: [
        '환경(E): 탄소배출, 에너지, 폐기물',
        '사회(S): 인권, 안전, 공급망',
        '지배구조(G): 이사회, 윤리, 감사',
      ],
      suitable: ['국내 기업', '상장사'],
      mandatory: ['코스피/코스닥 일정 규모 이상'],
    },
  ];

  return (
    <div className="space-y-4">
      {frameworks.map((fw, idx) => (
        <div
          key={idx}
          className="p-5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <BookOpen size={20} className="text-green-600 mt-1" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {fw.name}
                </h3>
                <p className="text-sm text-gray-600">{fw.purpose}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  핵심 요소:
                </p>
                <ul className="space-y-1">
                  {fw.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-600">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {fw.suitable.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {s}
                  </span>
                ))}
                {fw.mandatory.map((m, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                  >
                    필수: {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 산업별 핵심 지표 탭
function MetricsTab() {
  const [selectedIndustry, setSelectedIndustry] = useState('manufacturing');

  const industryMetrics: Record<
    string,
    { essential: string[]; sasb: string[] }
  > = {
    manufacturing: {
      essential: [
        '온실가스 배출량 (Scope 1, 2, 3)',
        '에너지 사용량 및 재생에너지 비율',
        '물 사용량 및 재활용률',
        '폐기물 발생량 및 재활용률',
        '산업재해율 (LTIR)',
      ],
      sasb: ['제품 에너지 효율', '재활용 원자재 비율', '유해물질 관리'],
    },
    it: {
      essential: [
        '데이터센터 에너지 효율 (PUE)',
        '온실가스 배출량 (Scope 2 중심)',
        '전자폐기물 관리',
        '데이터 프라이버시 및 보안',
        '다양성 및 포용성 지표',
      ],
      sasb: ['재생에너지 사용률', '서비스 가용성', '고객 데이터 보호'],
    },
    finance: {
      essential: [
        '투자 포트폴리오 탄소배출량 (Scope 3 Cat.15)',
        '온실가스 배출량 (Scope 1, 2)',
        'ESG 통합 투자 비율',
        '녹색금융 상품 비중',
        '기후 리스크 평가',
      ],
      sasb: ['지속가능금융', '기후변화 물리적 리스크', 'ESG 대출'],
    },
  };

  const industries = [
    { value: 'manufacturing', label: '제조업' },
    { value: 'it', label: 'IT/소프트웨어' },
    { value: 'finance', label: '금융' },
  ];

  const metrics = industryMetrics[selectedIndustry];

  return (
    <div className="space-y-6">
      {/* 산업 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          산업 선택
        </label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {industries.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* 필수 공시 지표 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-green-600" />
          <h3 className="font-semibold text-gray-900">필수 공시 지표</h3>
        </div>
        <ul className="space-y-2">
          {metrics.essential.map((metric, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-green-600">✓</span>
              <span className="text-sm text-gray-700">{metric}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SASB 추가 권장 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">SASB 추가 권장 지표</h3>
        </div>
        <ul className="space-y-2">
          {metrics.sasb.map((metric, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg"
            >
              <span className="text-blue-600">+</span>
              <span className="text-sm text-blue-700">{metric}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 온보딩 체크리스트 탭
function ChecklistTab() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const checklistSteps = [
    {
      phase: '1단계: 준비',
      items: [
        '조직 경계 설정 (재무 통제 vs 운영 통제)',
        '보고 기간 결정 (회계연도 기준)',
        '담당자 및 팀 구성',
        '예산 및 일정 수립',
      ],
    },
    {
      phase: '2단계: 배출원 식별',
      items: [
        'Scope 1: 직접 배출원 목록 (보일러, 차량 등)',
        'Scope 2: 전기/스팀 구매 내역',
        'Scope 3: 가치사슬 배출원 우선순위 결정',
        '데이터 수집 담당자 지정',
      ],
    },
    {
      phase: '3단계: 데이터 수집',
      items: [
        '활동 데이터 수집 (연료 사용량, 전기 사용량 등)',
        '배출계수 선택 (IPCC, 환경부 등)',
        '데이터 품질 평가',
        '증빙 자료 보관',
      ],
    },
    {
      phase: '4단계: 계산 및 검증',
      items: [
        '배출량 계산 (활동데이터 × 배출계수)',
        '불확실성 평가',
        '내부 검토',
        '외부 검증 준비 (선택)',
      ],
    },
    {
      phase: '5단계: 보고 및 공시',
      items: [
        '보고서 작성 (GRI/TCFD 등 프레임워크 준수)',
        '경영진 승인',
        '공시 채널 결정 (웹사이트, CDP, ESG 보고서)',
        '이해관계자 소통',
      ],
    },
  ];

  const toggleItem = (phaseIdx: number, itemIdx: number) => {
    const id = phaseIdx * 100 + itemIdx;
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalItems = checklistSteps.reduce(
    (sum, phase) => sum + phase.items.length,
    0
  );
  const progress = (checkedItems.length / totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* 진행도 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            진행도: {checkedItems.length} / {totalItems}
          </p>
          <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-600 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="space-y-6">
        {checklistSteps.map((phase, phaseIdx) => (
          <div key={phaseIdx}>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare size={18} className="text-green-600" />
              <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
            </div>
            <div className="space-y-2">
              {phase.items.map((item, itemIdx) => {
                const id = phaseIdx * 100 + itemIdx;
                const isChecked = checkedItems.includes(id);
                return (
                  <label
                    key={itemIdx}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(phaseIdx, itemIdx)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'text-gray-500 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

