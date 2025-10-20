'use client';

import React, { useState } from 'react';
import { Building2, Users, Globe, TrendingUp } from 'lucide-react';
import type { CustomerProfile, Industry, CompanySize } from '@/types/analysis';
import { INDUSTRY_LABELS, SIZE_LABELS } from '@/lib/analysis-engine';

interface CustomerProfileFormProps {
  onAnalyze: (profile: CustomerProfile) => void;
  isLoading?: boolean;
}

export function CustomerProfileForm({
  onAnalyze,
  isLoading = false,
}: CustomerProfileFormProps) {
  const [profile, setProfile] = useState<CustomerProfile>({
    industry: 'manufacturing',
    size: 'medium',
    exportToEU: false,
    listed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 산업 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 size={16} />
            산업 분류
          </label>
          <select
            value={profile.industry}
            onChange={(e) =>
              setProfile({ ...profile, industry: e.target.value as Industry })
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 기업 규모 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users size={16} />
            기업 규모
          </label>
          <select
            value={profile.size}
            onChange={(e) =>
              setProfile({ ...profile, size: e.target.value as CompanySize })
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            {Object.entries(SIZE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 체크박스 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={profile.exportToEU}
            onChange={(e) =>
              setProfile({ ...profile, exportToEU: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-500 group-hover:text-gray-700" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              EU 수출 기업
            </span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={profile.listed}
            onChange={(e) =>
              setProfile({ ...profile, listed: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500 group-hover:text-gray-700" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              상장 기업
            </span>
          </div>
        </label>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '분석 중...' : '분석하기'}
      </button>
    </form>
  );
}

