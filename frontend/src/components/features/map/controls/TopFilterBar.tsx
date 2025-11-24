/**
 * TopFilterBar
 * 지도 상단에 떠 있는 메인 필터 바
 * 
 * 기능:
 * - 검색창 및 주요 필터 칩 배치
 * - 각 필터의 드롭다운 컨텐츠 관리
 * - 필터 초기화 버튼
 */

'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useESGMapStore } from '@/store/esgMapStore';
import { 
  FEATURE_GROUPS, 
  FRAMEWORK_GROUPS, 
  AI_MATURITY_LEVELS 
} from '@/constants/esg-map';
import type { FeatureGroup, FrameworkGroup, CompanyType, AIMaturityLevel } from '@/types/esg-map';

// Components
import { SearchInput } from './SearchInput';
import { FilterChip } from './FilterChip';
import { FilterDropdown } from './FilterDropdown';
import { RegionCountrySelector } from '../panels/RegionCountrySelector';

export const TopFilterBar: React.FC = () => {
  const filters = useESGMapStore((state) => state.filters);
  const activeFilterCount = 
    filters.regions.length +
    filters.countries.length +
    filters.companyTypes.length +
    filters.featureGroups.length +
    filters.frameworkGroups.length +
    (filters.aiMaturity ? 1 : 0);

  const resetFilters = useESGMapStore((state) => state.resetFilters);
  const setCompanyTypeFilter = useESGMapStore((state) => state.setCompanyTypeFilter);
  const setFeatureGroupFilter = useESGMapStore((state) => state.setFeatureGroupFilter);
  const setFrameworkGroupFilter = useESGMapStore((state) => state.setFrameworkGroupFilter);
  const setAIMaturityFilter = useESGMapStore((state) => state.setAIMaturityFilter);

  // 드롭다운 상태 관리 (하나만 열리도록)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // 기타/통합 플랫폼 타입 목록
  const OTHER_TYPES = [
    'INTEGRATED_GRC_ESG_PLATFORM',
    'INTEGRATED_EHS_ESG_PLATFORM',
    'INTEGRATED_REPORTING_PLATFORM',
    'INTEGRATED_CLOUD_ESG_PLATFORM',
    'INTEGRATED_ENTERPRISE_PLATFORM',
    'INTEGRATED_GRC_PLATFORM',
    'INTEGRATED_TRUST_PLATFORM',
    'VERTICAL_ESG_PLATFORM',
    'SCIENCE_ADVISORY_PLATFORM',
    'SUPPLY_CHAIN_COMPLIANCE_PLATFORM',
    'CARBON_OFFSET_API_PLATFORM',
    'CARBON_MARKET_PLATFORM',
    'SUPPLY_CHAIN_ESG_PLATFORM',
    'ENVIRONMENTAL_LIABILITY_MANAGEMENT_PLATFORM',
    'BLOCKCHAIN_SUPPLY_CHAIN_PLATFORM',
    'ENVIRONMENTAL_COMPLIANCE_PLATFORM',
    'CARBON_CREDIT_PLATFORM',
    'ASSET_MANAGEMENT_ESG_INTEGRATION',
  ] as CompanyType[];

  // --- Handlers ---

  const toggleCompanyType = (type: CompanyType) => {
    if (filters.companyTypes.includes(type)) {
      setCompanyTypeFilter(filters.companyTypes.filter((t) => t !== type));
    } else {
      setCompanyTypeFilter([...filters.companyTypes, type]);
    }
  };

  const toggleOtherTypes = () => {
    // 하나라도 포함되어 있으면 -> 전체 제거 (Uncheck)
    const hasAnyOther = OTHER_TYPES.some(t => filters.companyTypes.includes(t));
    
    if (hasAnyOther) {
      setCompanyTypeFilter(filters.companyTypes.filter(t => !OTHER_TYPES.includes(t)));
    } else {
      // 하나도 없으면 -> 전체 추가 (Check)
      setCompanyTypeFilter([...filters.companyTypes, ...OTHER_TYPES]);
    }
  };

  const isOtherTypesChecked = OTHER_TYPES.some(t => filters.companyTypes.includes(t));

  const toggleFeatureGroup = (id: FeatureGroup) => {
    if (filters.featureGroups.includes(id)) {
      setFeatureGroupFilter(filters.featureGroups.filter((g) => g !== id));
    } else {
      setFeatureGroupFilter([...filters.featureGroups, id]);
    }
  };

  const toggleFrameworkGroup = (id: FrameworkGroup) => {
    if (filters.frameworkGroups.includes(id)) {
      setFrameworkGroupFilter(filters.frameworkGroups.filter((g) => g !== id));
    } else {
      setFrameworkGroupFilter([...filters.frameworkGroups, id]);
    }
  };

  return (
    <div className="absolute top-14 left-4 z-[1000] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-5xl pointer-events-none">
      {/* 상단 Row: 검색창 + 필터 칩 */}
      <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
        {/* 1. 검색창 */}
        <SearchInput />

        <div className="h-6 w-px bg-slate-700 mx-1" />

        {/* 2. Region Filter */}
        <div className="relative">
          <FilterChip
            label="지역 & 국가"
            icon="🌍"
            isActive={filters.regions.length > 0 || filters.countries.length > 0}
            count={filters.regions.length + filters.countries.length}
            isOpen={activeDropdown === 'region'}
            onClick={() => toggleDropdown('region')}
            onClear={(e) => {
              e.stopPropagation();
              useESGMapStore.getState().setRegionFilter([]);
              useESGMapStore.getState().setCountryFilter([]);
            }}
          />
          <FilterDropdown
            isOpen={activeDropdown === 'region'}
            onClose={() => setActiveDropdown(null)}
            width={360}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 font-semibold">대륙 (Regions)</p>
                <RegionCountrySelector mode="region" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 font-semibold">국가 (Countries)</p>
                <RegionCountrySelector mode="country" />
              </div>
            </div>
          </FilterDropdown>
        </div>

        {/* 3. Company Type Filter */}
        <div className="relative">
          <FilterChip
            label="기업 유형"
            icon="🏢"
            isActive={filters.companyTypes.length > 0}
            count={filters.companyTypes.length}
            isOpen={activeDropdown === 'type'}
            onClick={() => toggleDropdown('type')}
            onClear={(e) => {
              e.stopPropagation();
              setCompanyTypeFilter([]);
            }}
          />
          <FilterDropdown
            isOpen={activeDropdown === 'type'}
            onClose={() => setActiveDropdown(null)}
            width={280}
          >
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.companyTypes.includes('CORE_ESG_PLATFORM')}
                  onChange={() => toggleCompanyType('CORE_ESG_PLATFORM')}
                  className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-sm text-white font-medium">Core ESG Platform</span>
                  <p className="text-xs text-slate-400">ESG 관리가 핵심 비즈니스</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.companyTypes.includes('OPERATIONAL_ESG_ENABLER')}
                  onChange={() => toggleCompanyType('OPERATIONAL_ESG_ENABLER')}
                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-white font-medium">Operational ESG Enabler</span>
                  <p className="text-xs text-slate-400">운영 효율화 중심</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isOtherTypesChecked}
                  onChange={toggleOtherTypes}
                  className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm text-white font-medium">Integrated / Others</span>
                  <p className="text-xs text-slate-400">통합 플랫폼 및 기타</p>
                </div>
              </label>
            </div>
          </FilterDropdown>
        </div>

        {/* 4. Primary Domain (Feature Groups) */}
        <div className="relative">
          <FilterChip
            label="도메인 (솔루션)"
            icon="🎯"
            isActive={filters.featureGroups.length > 0}
            count={filters.featureGroups.length}
            isOpen={activeDropdown === 'domain'}
            onClick={() => toggleDropdown('domain')}
            onClear={(e) => {
              e.stopPropagation();
              setFeatureGroupFilter([]);
            }}
          />
          <FilterDropdown
            isOpen={activeDropdown === 'domain'}
            onClose={() => setActiveDropdown(null)}
            width={400}
          >
            <div className="space-y-1">
              {FEATURE_GROUPS.map((group) => (
                <label
                  key={group.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.featureGroups.includes(group.id as FeatureGroup)}
                    onChange={() => toggleFeatureGroup(group.id as FeatureGroup)}
                    className="w-4 h-4 mt-1 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="text-sm text-white font-medium flex items-center gap-1.5">
                      <span>{group.icon}</span>
                      <span>{group.nameLocal}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {group.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </FilterDropdown>
        </div>

        {/* 5. Framework Group */}
        <div className="relative">
          <FilterChip
            label="규제 & 프레임워크"
            icon="📋"
            isActive={filters.frameworkGroups.length > 0}
            count={filters.frameworkGroups.length}
            isOpen={activeDropdown === 'framework'}
            onClick={() => toggleDropdown('framework')}
            onClear={(e) => {
              e.stopPropagation();
              setFrameworkGroupFilter([]);
            }}
          />
          <FilterDropdown
            isOpen={activeDropdown === 'framework'}
            onClose={() => setActiveDropdown(null)}
            width={320}
          >
            <div className="space-y-1">
              {FRAMEWORK_GROUPS.map((group) => (
                <label
                  key={group.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.frameworkGroups.includes(group.id as FrameworkGroup)}
                    onChange={() => toggleFrameworkGroup(group.id as FrameworkGroup)}
                    className="w-4 h-4 mt-1 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="text-sm text-white font-medium flex items-center gap-1.5">
                      <span>{group.icon}</span>
                      <span>{group.nameLocal}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {group.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </FilterDropdown>
        </div>

        {/* 6. AI Maturity (Radio) */}
        <div className="relative">
          <FilterChip
            label="AI 성숙도"
            icon="🤖"
            isActive={!!filters.aiMaturity}
            count={filters.aiMaturity ? 1 : 0}
            isOpen={activeDropdown === 'ai'}
            onClick={() => toggleDropdown('ai')}
            onClear={(e) => {
              e.stopPropagation();
              setAIMaturityFilter(null);
            }}
          />
          <FilterDropdown
            isOpen={activeDropdown === 'ai'}
            onClose={() => setActiveDropdown(null)}
            width={280}
          >
            <div className="space-y-1">
              {AI_MATURITY_LEVELS.map((level) => (
                <label
                  key={level.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="ai-maturity"
                    checked={filters.aiMaturity === level.id}
                    onChange={() => setAIMaturityFilter(level.id as AIMaturityLevel)}
                    className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="text-sm text-white font-medium flex items-center gap-1.5">
                      <span>{level.icon}</span>
                      <span>{level.nameLocal}</span>
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </FilterDropdown>
        </div>

        {/* 7. Reset Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <RotateCcw size={12} />
            <span>초기화</span>
          </button>
        )}
      </div>
    </div>
  );
};

