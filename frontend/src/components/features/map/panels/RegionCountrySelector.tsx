/**
 * RegionCountrySelector
 * Region 및 Country를 태그 형태로 선택하는 UI 컴포넌트
 * 
 * 기능:
 * - 다중 선택 지원
 * - 태그 형태의 버튼 UI
 * - 선택된 항목 하이라이트
 * - 실제 데이터 기반으로 기업 수 카운트 및 표시 여부 결정
 */

'use client';

import React, { useMemo } from 'react';
import { useESGMapStore } from '@/store/esgMapStore';
import { REGION_INFO, COUNTRY_INFO } from '@/constants/esg-map';
import type { Region, CountryCode } from '@/types/esg-map';

/**
 * Props
 */
interface RegionCountrySelectorProps {
  mode: 'region' | 'country';
}

/**
 * RegionCountrySelector Component
 */
export const RegionCountrySelector: React.FC<RegionCountrySelectorProps> = ({ mode }) => {
  // Store 구독
  const filters = useESGMapStore((state) => state.filters);
  const companies = useESGMapStore((state) => state.companies);
  const setRegionFilter = useESGMapStore((state) => state.setRegionFilter);
  const setCountryFilter = useESGMapStore((state) => state.setCountryFilter);

  const selectedRegions = filters.regions;
  const selectedCountries = filters.countries;

  /**
   * 활성 Region 목록 계산 (기업이 1개 이상 있는 곳만)
   */
  const activeRegions = useMemo(() => {
    return Object.entries(REGION_INFO)
      .map(([name, info]) => {
        const count = companies.filter((c) => c.region === name).length;
        return {
          name: name as Region,
          ...info,
          count,
        };
      })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count); // 많은 순 정렬
  }, [companies]);

  /**
   * 활성 Country 목록 계산 (기업이 1개 이상 있는 곳만)
   */
  const activeCountries = useMemo(() => {
    return Object.entries(COUNTRY_INFO)
      .map(([code, info]) => {
        const count = companies.filter((c) => c.countryCode === code).length;
        return {
          code: code as CountryCode,
          ...info,
          count,
        };
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count); // 많은 순 정렬
  }, [companies]);

  /**
   * Region 선택 토글
   */
  const toggleRegion = (region: Region) => {
    if (selectedRegions.includes(region)) {
      setRegionFilter(selectedRegions.filter((r) => r !== region));
    } else {
      setRegionFilter([...selectedRegions, region]);
    }
  };

  /**
   * Country 선택 토글
   */
  const toggleCountry = (country: CountryCode) => {
    if (selectedCountries.includes(country)) {
      setCountryFilter(selectedCountries.filter((c) => c !== country));
    } else {
      setCountryFilter([...selectedCountries, country]);
    }
  };

  if (mode === 'region') {
    if (activeRegions.length === 0) {
      return <div className="text-xs text-slate-500 p-2">데이터 로딩 중이거나 결과가 없습니다.</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {activeRegions.map((region) => {
          const isSelected = selectedRegions.includes(region.name);
          return (
            <button
              key={region.name}
              onClick={() => toggleRegion(region.name)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {region.nameLocal} ({region.count})
            </button>
          );
        })}
      </div>
    );
  }

  // mode === 'country'
  if (activeCountries.length === 0) {
    return <div className="text-xs text-slate-500 p-2">데이터 로딩 중이거나 결과가 없습니다.</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {activeCountries.map((country) => {
        const isSelected = selectedCountries.includes(country.code);
        return (
          <button
            key={country.code}
            onClick={() => toggleCountry(country.code)}
            className={`
              px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1
              ${
                isSelected
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
          >
            <span>{country.emoji}</span>
            <span>{country.nameLocal}</span>
            <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>({country.count})</span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * Display Name (for React DevTools)
 */
RegionCountrySelector.displayName = 'RegionCountrySelector';
