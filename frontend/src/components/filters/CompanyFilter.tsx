'use client';

import React from 'react';
import { ChevronDown, Building2, X } from 'lucide-react';
import { useCompanies } from '@/hooks/useArticles';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface CompanyFilterProps {
  selectedCompanyId: number | null;
  onCompanyChange: (companyId: number | null) => void;
  className?: string;
}

export function CompanyFilter({ selectedCompanyId, onCompanyChange, className }: CompanyFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: companiesData, isLoading, isError } = useCompanies();
  
  const selectedCompany = companiesData?.companies.find(c => c.id === selectedCompanyId);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanySelect = (companyId: number | null) => {
    onCompanyChange(companyId);
    setIsOpen(false);
  };

  if (isError) {
    return (
      <div className={cn('text-sm text-red-600', className)}>
        회사 목록을 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">회사:</span>
        
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm transition-colors min-w-[140px]',
            isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-gray-400',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="flex-1 text-left truncate">
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : selectedCompany ? (
              selectedCompany.company_name
            ) : (
              '전체 회사'
            )}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 text-gray-500 transition-transform',
            isOpen && 'transform rotate-180'
          )} />
        </button>

        {/* Clear Filter Button */}
        {selectedCompanyId && (
          <button
            onClick={() => handleCompanySelect(null)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="필터 초기화"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* All Companies Option */}
          <button
            onClick={() => handleCompanySelect(null)}
            className={cn(
              'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100',
              !selectedCompanyId && 'bg-blue-50 text-blue-700'
            )}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="font-medium">전체 회사</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              모든 ESG SaaS 기업의 뉴스 표시
            </div>
          </button>

          {/* Company List */}
          {companiesData?.companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={cn(
                'w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                selectedCompanyId === company.id && 'bg-blue-50 text-blue-700'
              )}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{company.company_name}</span>
                {company.company_name_en && (
                  <span className="text-xs text-gray-500">({company.company_name_en})</span>
                )}
              </div>
              {company.description && (
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {company.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
