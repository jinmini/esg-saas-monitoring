/**
 * RegionGlowLayer Component
 * viewMode에 따라 Region 또는 Country 마커를 조건부 렌더링
 */

'use client';

import { useMemo } from 'react';
import { useESGMapStore, useFilteredCompanies } from '@/store/esgMapStore';
import { 
  REGION_COORDS,
  REGION_HUB_MAP,
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

  // ========================================
  // viewMode별 렌더링 분기
  // ========================================
  
  // World View: Region Markers (대륙 마커)
  if (viewMode === 'world') {
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

  // ========================================
  // Detail Views: Country Markers (통합!)
  // ========================================
  
  // 현재 viewMode에 해당하는 Country Hubs 가져오기
  const currentHubs = REGION_HUB_MAP[viewMode];
  
  // 정의되지 않은 viewMode 또는 world view인 경우
  if (!currentHubs) return null;

  // Z-Index 관리: Hover된 마커를 마지막에 렌더링 (Bring to Front)
  const sortedHubs = Object.entries(currentHubs).sort(([codeA], [codeB]) => {
    if (codeA === hoveredCountry) return 1;
    if (codeB === hoveredCountry) return -1;
    return 0;
  });

  return (
    <g id={`country-markers-${viewMode}`}>
      {sortedHubs.map(([countryCode, coords]) => {
        const companies = companiesByCountry[countryCode] || [];
        
        return (
          <CountryMarker
            key={countryCode}
            countryCode={countryCode as CountryCode}
            coords={coords}
            companies={companies}
            isSelected={selectedCountry === countryCode}
            isHovered={hoveredCountry === countryCode}
            isAnyHovered={!!hoveredCountry}
            onClick={() => handleCountryClick(countryCode as CountryCode)}
            onMouseEnter={() => setHoveredCountry(countryCode as CountryCode)}
            onMouseLeave={() => setHoveredCountry(null)}
          />
        );
      })}
    </g>
  );
};
