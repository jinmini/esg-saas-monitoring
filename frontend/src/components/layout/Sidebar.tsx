'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  FileText,
  ChevronLeft,
  ChevronRight,
  LucideIcon // 아이콘 타입 정의용
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- [Type Definitions] ---
interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon; // React.ComponentType 대신 LucideIcon 사용 권장
  subItems?: SubMenuItem[];
}

// --- [Menu Data] ---
// 여기에 ': MenuItem[]' 타입을 명시해야 합니다.
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

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { 
    isGlobalSidebarOpen, 
    isGlobalSidebarCollapsed, 
    toggleGlobalSidebarCollapse 
  } = useUIStore();

  return (
    <AnimatePresence mode="wait">
      {isGlobalSidebarOpen && (
        <motion.aside
          initial={{ width: isGlobalSidebarCollapsed ? 64 : 240, opacity: 0 }}
          animate={{ 
            width: isGlobalSidebarCollapsed ? 64 : 240, 
            opacity: 1
          }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={cn(
            'flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden',
            className
          )}
        >
          {/* 1. Header (Logo & Toggle) */}
          <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-gray-100/50">
            {isGlobalSidebarCollapsed ? (
              <div className="flex flex-col items-center w-full gap-2 pt-2">
                 <Link href="/dashboard" className="hover:opacity-80">
                   <img src="/logo-icon.svg" alt="Logo" width={24} height={24} />
                 </Link>
              </div>
            ) : (
              <Link href="/dashboard" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
                <img src="/logo-icon.svg" alt="Logo" width={24} height={24} />
                <span className="font-bold text-lg text-gray-900 tracking-tight">ESG SIP</span>
              </Link>
            )}
            
            {!isGlobalSidebarCollapsed && (
              <button
                onClick={toggleGlobalSidebarCollapse}
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>
          
          {isGlobalSidebarCollapsed && (
            <div className="flex justify-center py-2 border-b border-gray-100/50">
               <button
                onClick={toggleGlobalSidebarCollapse}
                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* 2. Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
             {menuItems.map((item) => (
                <SidebarMenuItem 
                   key={item.id} 
                   item={item} 
                   isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                   isCollapsed={isGlobalSidebarCollapsed}
                />
             ))}
          </nav>

          {/* 3. Footer (Profile) */}
          {!isGlobalSidebarCollapsed && (
            <div className="p-4 border-t border-gray-100">
               <div className="flex items-center gap-3 px-2">
                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                   JK
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-medium text-gray-900">Jinmin Kim</span>
                   <span className="text-xs text-gray-500">Free Plan</span>
                 </div>
               </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// 하위 컴포넌트 타입 정의 추가
interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function SidebarMenuItem({ item, isActive, isCollapsed }: SidebarMenuItemProps) {
  const Icon = item.icon;
  
  if (isCollapsed) {
    return (
      <div className="group relative flex justify-center py-2">
        <Link
          href={item.href}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isActive ? "bg-green-50 text-green-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Icon size={20} />
        </Link>
        {/* Tooltip */}
        <div className="absolute left-full top-2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
          {item.label}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
          isActive 
            ? "bg-green-50 text-green-700" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon size={18} className={isActive ? "text-green-600" : "text-gray-400"} />
        {item.label}
      </Link>
      
      {item.subItems && isActive && (
        <div className="ml-9 space-y-1 mb-2">
          {item.subItems.map((sub) => (
             <Link 
               key={sub.id} 
               href={sub.href}
               target={sub.external ? "_blank" : undefined}
               className="block text-xs text-gray-500 hover:text-gray-900 py-1 transition-colors"
             >
               {sub.label}
             </Link>
          ))}
        </div>
      )}
    </div>
  );
}