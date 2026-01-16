'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText,
  ChevronLeft,
  ChevronRight
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
    id: 'landscape',
    label: 'Landscape',
    href: '/landscape',
    icon: BarChart3,
    subItems: [
      {
        id: 'esg-calendar',
        label: 'ESG Calendar',
        href: 'https://petalite-tuna-6c9.notion.site/ESG-Calendar-2b6394aaa2f480c59b56c08bffc4c22f', 
        external: true,
      },
    ],
  },
  {
    id: 'ai-features',
    label : 'AI Features',
    href: '/ai-features',
    icon: FileText,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { 
    isGlobalSidebarOpen, 
    isGlobalSidebarCollapsed, 
    toggleGlobalSidebarCollapse 
  } = useUIStore();
  
  // 하위 메뉴 확장 상태 (축소 모드에서 호버 시 사용)
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isGlobalSidebarOpen && (
        <motion.aside
          initial={{ x: isGlobalSidebarCollapsed ? -64 : -240, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: isGlobalSidebarCollapsed ? 64 : 240 
          }}
          exit={{ x: isGlobalSidebarCollapsed ? -64 : -240, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={cn(
            'bg-white flex flex-col relative border-r border-gray-200',
            isGlobalSidebarCollapsed ? 'w-16' : 'w-60',
            className
          )}
        >
          {/* 상단 버튼 영역 */}
          {!isGlobalSidebarCollapsed && (
            <div className="absolute top-4 right-2 z-10">
              {/* 축소 버튼 */}
              <button
                onClick={toggleGlobalSidebarCollapse}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="사이드바 축소"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* ESG SIP 브랜딩 영역 - Liner 스타일 */}
          <div className={cn(
            'flex items-center transition-all duration-300',
            isGlobalSidebarCollapsed ? 'p-3 justify-center' : 'px-6 py-4'
          )}>
            {isGlobalSidebarCollapsed ? (
              // 축소 모드: 아이콘만 + 확장 버튼
              <div className="flex flex-col items-center gap-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center justify-center hover:opacity-80 transition-opacity"
                  title="ESG SIP - Intelligence Platform"
                >
                  <img 
                    src="/logo-icon.svg" 
                    alt="ESG SIP" 
                    width={24} 
                    height={24}
                    className="flex-shrink-0"
                  />
                </Link>
                <button
                  onClick={toggleGlobalSidebarCollapse}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title="사이드바 확장"
                >
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>
            ) : (
              // 확장 모드: 아이콘 + 텍스트 가로 배치 (Liner 스타일)
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
              >
                <img 
                  src="/logo-icon.svg" 
                  alt="ESG SIP Logo" 
                  width={24} 
                  height={24}
                  className="flex-shrink-0"
                />
                <span className="font-bold text-lg leading-none whitespace-nowrap">
                  <span className="text-[#1F3556]">ESG</span>
                  <span className="text-[#65A66A]"> SIP</span>
                </span>
              </Link>
            )}
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className={cn(
            'flex-1 py-2',
            isGlobalSidebarCollapsed ? 'px-2' : 'px-3'
          )}>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const hasSubItems = item.subItems && item.subItems.length > 0;
                
                return (
                  <li key={item.id} className="relative">
                    {isGlobalSidebarCollapsed ? (
                      // 축소 모드: 아이콘만
                      <div className="group/item">
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center justify-center w-full h-12 rounded-lg transition-all relative',
                            isActive 
                              ? 'bg-green-50 text-green-700' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                          title={item.label}
                        >
                          <Icon 
                            className={cn(
                              'w-5 h-5 transition-colors',
                              isActive ? 'text-green-600' : 'text-gray-400 group-hover/item:text-gray-600'
                            )} 
                          />
                        </Link>
                        
                        {/* 툴팁 (호버 시 표시) */}
                        <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                        
                        {/* 하위 메뉴 (호버 시 표시) */}
                        {hasSubItems && item.subItems && (
                          <div className="absolute left-full top-0 ml-2 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 py-1">
                            {item.subItems.map((subItem) => (
                              <div key={subItem.id}>
                                {subItem.external ? (
                                  <a
                                    href={subItem.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                                ) : (
                                  <Link
                                    href={subItem.href}
                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    {subItem.label}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // 확장 모드: 전체 메뉴
                      <>
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
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 하단 정보 */}
          {!isGlobalSidebarCollapsed && (
            <div className="p-4">
              <div className="text-xs text-gray-400 text-center">
                v1.0.0
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
