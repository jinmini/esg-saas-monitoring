import { useEffect } from 'react';
import { useESGMapStore } from '@/store/esgMapStore';
import type { ESGMapData } from '@/types/esg-map';

export function useMapData() {
  // Store 구독 (필요한 상태와 액션만 가져옵니다)
  const isLoading = useESGMapStore((state) => state.isLoading);
  const error = useESGMapStore((state) => state.error);
  const companies = useESGMapStore((state) => state.companies);
  const setCompanies = useESGMapStore((state) => state.setCompanies);
  const setLoading = useESGMapStore((state) => state.setLoading);
  const setError = useESGMapStore((state) => state.setError);

  useEffect(() => {
    const loadData = async () => {
      // 이미 데이터가 로드되어 있다면 API 호출 스킵 (캐싱 효과)
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

  // 컴포넌트에서 필요한 값만 리턴
  return { isLoading, error, companies };
}