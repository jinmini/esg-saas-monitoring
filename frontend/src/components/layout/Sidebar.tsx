'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText,
  PanelLeftClose 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  className?: string;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  external?: boolean; // 외부 링크 여부
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'market-insight',
    label: 'Market Insight',
    href: '/market-insight',
    icon: TrendingUp,
    subItems: [
      {
        id: 'kr-saas',
        label: 'KR SaaS',
        href: 'https://petalite-tuna-6c9.notion.site/Carbon-SaaS-253394aaa2f48027980efdc021952484',
        external: true,
      }, 
      {
        id: 'global-saas',
        label: 'Global SaaS',
        href: 'https://petalite-tuna-6c9.notion.site/World_ESG_SaaS-294394aaa2f4803f83c8dc9f8cb481b6',
        external: true,
      },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    href: '/analysis',
    icon: BarChart3,
    subItems: [
      {
        id: 'esg-calendar',
        label: 'ESG Calendar',
        href: 'https://www.notion.so', // 실제 Notion Calendar URL로 교체 필요
        external: true,
      },
    ],
  },
  {
    id: 'editor',
    label : 'Report Editor',
    href: '/report/dashboard',
    icon: FileText,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isGlobalSidebarOpen, toggleGlobalSidebar } = useUIStore();

  return (
    <AnimatePresence>
      {isGlobalSidebarOpen && (
        <motion.aside
          initial={{ x: -240, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -240, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={cn('w-60 bg-white flex flex-col relative', className)}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={toggleGlobalSidebar}
            className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded transition-colors z-10"
            title="사이드바 닫기"
          >
            <PanelLeftClose size={18} className="text-gray-500" />
          </button>

          {/* ESG SIP 브랜딩 영역 - 미니멀 */}
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  ESG SIP
                </h1>
                <p className="text-xs text-gray-500">Intelligence Platform</p>
              </div>
            </Link>
          </div>

          {/* 네비게이션 메뉴 - 미니멀 */}
          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const hasSubItems = item.subItems && item.subItems.length > 0;
                
                return (
                  <li key={item.id}>
                    {/* 메인 메뉴 */}
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group',
                        isActive 
                          ? 'bg-green-50 text-green-700' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon 
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
                        )} 
                      />
                      <span className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-green-700' : 'text-gray-700'
                      )}>
                        {item.label}
                      </span>
                    </Link>

                    {/* 하위 메뉴 */}
                    {hasSubItems && item.subItems && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          
                          // 외부 링크인 경우
                          if (subItem.external) {
                            return (
                              <li key={subItem.id}>
                                <a
                                  href={subItem.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                >
                                  <span>{subItem.label}</span>
                                  <svg 
                                    className="w-3.5 h-3.5 opacity-50" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </li>
                            );
                          }
                          
                          // 내부 링크인 경우
                          return (
                            <li key={subItem.id}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  'flex items-center px-3 py-2 rounded-lg transition-all text-sm',
                                  isSubActive
                                    ? 'bg-green-50 text-green-700 font-medium'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                )}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 하단 정보 - 미니멀 */}
          <div className="p-4">
            <div className="text-xs text-gray-400 text-center">
              v1.0.0
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
