/**
 * RegionGlowLayer Component
 * viewMode에 따라 Region 또는 Country 마커를 조건부 렌더링
 */

'use client';

import { useMemo } from 'react';
import { useESGMapStore, useFilteredCompanies } from '@/store/esgMapStore';
import { 
  REGION_COORDS, 
  EUROPE_HUBS, 
  ASIA_HUBS, 
  OCEANIA_HUBS, 
  NORTH_AMERICA_HUBS,
  MIDDLE_EAST_HUBS,
  SOUTH_AMERICA_HUBS
} from '@/constants/esg-map';
import { RegionMarker } from '../markers/RegionMarker';
import { CountryMarker } from '../markers/CountryMarker';
import type { Region, CountryCode } from '@/types/esg-map';

export const RegionGlowLayer = () => {
  // Store 구독 (상태 변경 감지)
  const filteredCompanies = useFilteredCompanies();
  
  const viewMode = useESGMapStore((state) => state.mapState.viewMode);
  const selectedRegion = useESGMapStore((state) => state.mapState.selectedRegion);
  const selectedCountry = useESGMapStore((state) => state.mapState.selectedCountry);
  const hoveredRegion = useESGMapStore((state) => state.mapState.hoveredRegion);
  const hoveredCountry = useESGMapStore((state) => state.mapState.hoveredCountry);
  
  const zoomToRegion = useESGMapStore((state) => state.zoomToRegion);
  const setSelectedCountry = useESGMapStore((state) => state.setSelectedCountry);
  const setHoveredRegion = useESGMapStore((state) => state.setHoveredRegion);
  const setHoveredCountry = useESGMapStore((state) => state.setHoveredCountry);
  const openRightPanel = useESGMapStore((state) => state.openRightPanel);

  // 국가 마커 클릭 핸들러 (패널 열기)
  const handleCountryClick = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode); // 1. 국가 선택 상태 업데이트 (지도 Focus 등)
    openRightPanel('list', countryCode); // 2. 우측 패널을 List Mode로 열기
  };

  // 필터링된 기업들을 지역별/국가별로 그룹화 (Memoization)
  const companiesByRegion = useMemo(() => {
    const groups: Record<string, typeof filteredCompanies> = {};
    filteredCompanies.forEach(company => {
      if (!groups[company.region]) groups[company.region] = [];
      groups[company.region].push(company);
    });
    return groups;
  }, [filteredCompanies]);

  const companiesByCountry = useMemo(() => {
    const groups: Record<string, typeof filteredCompanies> = {};
    filteredCompanies.forEach(company => {
      if (!groups[company.countryCode]) groups[company.countryCode] = [];
      groups[company.countryCode].push(company);
    });
    return groups;
  }, [filteredCompanies]);

  // viewMode별 렌더링 분기
  if (viewMode === 'world') {
    // ========================================
    // World View: Region Markers (대륙 마커)
    // ========================================
    return (
      <g id="region-markers">
        {(Object.entries(REGION_COORDS) as [Region, typeof REGION_COORDS[Region]][]).map(([region, coords]) => {
          const companies = companiesByRegion[region] || [];
          
          return (
            <RegionMarker
              key={region}
              region={region}
              coords={coords}
              companies={companies}
              isSelected={selectedRegion === region}
              isHovered={hoveredRegion === region}
              onClick={() => zoomToRegion(region)}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'europe_detail') {
    // ========================================
    // Europe Detail View: Country Markers (유럽 국가 마커)
    // ========================================
    
    // Z-Index 관리: Hover된 마커를 가장 마지막에 렌더링 (Bring to Front)
    const sortedHubs = Object.entries(EUROPE_HUBS).sort(([codeA], [codeB]) => {
        if (codeA === hoveredCountry) return 1;
        if (codeB === hoveredCountry) return -1;
        return 0;
    });

    return (
      <g id="country-markers-europe">
        {(sortedHubs as [CountryCode, typeof EUROPE_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              isAnyHovered={!!hoveredCountry} // 다른 마커가 호버되었는지 여부
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'asia_detail') {
    // ========================================
    // Asia Detail View: Country Markers (아시아 국가 마커)
    // ========================================
    return (
      <g id="country-markers-asia">
        {(Object.entries(ASIA_HUBS) as [CountryCode, typeof ASIA_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'oceania_detail') {
    // ========================================
    // Oceania Detail View: Country Markers (오세아니아 국가 마커)
    // ========================================
    return (
      <g id="country-markers-oceania">
        {(Object.entries(OCEANIA_HUBS) as [CountryCode, typeof OCEANIA_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'north_america_detail') {
    // ========================================
    // North America Detail View: Country Markers (북미 국가 마커)
    // ========================================
    return (
      <g id="country-markers-north-america">
        {(Object.entries(NORTH_AMERICA_HUBS) as [CountryCode, typeof NORTH_AMERICA_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'middle_east_detail') {
    // ========================================
    // Middle East Detail View: Country Markers (중동 국가 마커)
    // ========================================
    return (
      <g id="country-markers-middle-east">
        {(Object.entries(MIDDLE_EAST_HUBS) as [CountryCode, typeof MIDDLE_EAST_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  if (viewMode === 'south_america_detail') {
    // ========================================
    // South America Detail View: Country Markers (남미 국가 마커)
    // ========================================
    return (
      <g id="country-markers-south-america">
        {(Object.entries(SOUTH_AMERICA_HUBS) as [CountryCode, typeof SOUTH_AMERICA_HUBS[CountryCode]][]).map(([countryCode, coords]) => {
          const companies = companiesByCountry[countryCode] || [];
          
          return (
            <CountryMarker
              key={countryCode}
              countryCode={countryCode}
              coords={coords}
              companies={companies}
              isSelected={selectedCountry === countryCode}
              isHovered={hoveredCountry === countryCode}
              onClick={() => handleCountryClick(countryCode)}
              onMouseEnter={() => setHoveredCountry(countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
            />
          );
        })}
      </g>
    );
  }

  // 기본값: 아무것도 렌더링하지 않음
  return null;
};
