'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '대시보드'
  },
  {
    id: 'market-insight',
    label: 'Market Insight',
    href: '/',
    icon: TrendingUp,
    description: '시장 인사이트 및 뉴스피드 분석'
  },
  {
    id: 'analysis',
    label: 'Analysis',
    href: '/analysis',
    icon: BarChart3,
    description: 'ESG 액션 캘린더 및 중요 일정'
  },
  {
    id: 'editor',
    label : 'Report Editor',
    href: '/report/[documentId]',
    icon: FileText,
    description: '현재 작업 중인 보고서 편집'
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-60 bg-gray-50 border-r border-gray-200 flex flex-col', className)}>
      {/* ESG SIP 브랜딩 영역 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ESG SIP</h1>
            <p className="text-xs text-gray-600">SaaS Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group',
                    isActive 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-700'
                    )} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium truncate',
                      isActive ? 'text-green-700' : 'text-gray-900'
                    )}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Sprint 7 - Editor PoC
        </div>
      </div>
    </aside>
  );
}
