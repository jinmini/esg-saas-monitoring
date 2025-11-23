/**
 * RegionCountrySelector
 * Region 및 Country를 태그 형태로 선택하는 UI 컴포넌트
 * 
 * 기능:
 * - 다중 선택 지원
 * - 태그 형태의 버튼 UI
 * - 선택된 항목 하이라이트
 */

'use client';

import React from 'react';
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
  const filters = useESGMapStore((state) => state.filters);
  const setRegionFilter = useESGMapStore((state) => state.setRegionFilter);
  const setCountryFilter = useESGMapStore((state) => state.setCountryFilter);

  const selectedRegions = filters.regions;
  const selectedCountries = filters.countries;

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
    const activeRegions = Object.values(REGION_INFO).filter((r) => r.isActive);

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
  const activeCountries = Object.values(COUNTRY_INFO).filter((c) => c.isActive);

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
            <span className="text-slate-200">({country.count})</span>
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

