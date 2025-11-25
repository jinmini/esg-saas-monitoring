'use client';

import React from 'react';
import Link from 'next/link';
import { Play, PanelLeftOpen } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';

/**
 * Global Header
 * 
 * 미니멀 디자인:
 * - 경계선 없음
 * - 흰 배경
 * - 좌측: 사이드바 열기 버튼 (닫혔을 때)
 * - 우측: 액션 버튼들
 */
export function GlobalHeader() {
  const { isGlobalSidebarOpen, toggleGlobalSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6">
      {/* 좌측: 사이드바 토글 버튼 */}
      {!isGlobalSidebarOpen && (
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={toggleGlobalSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="사이드바 열기"
        >
          <PanelLeftOpen size={20} className="text-gray-600" />
        </motion.button>
      )}

      {/* 좌측 빈 공간 (사이드바 열렸을 때) */}
      {isGlobalSidebarOpen && <div />}

      {/* 우측: 액션 버튼들 */}
      <div className="flex items-center gap-4">
        {/* 사용법 보기 */}
        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <Play size={16} />
          <span>사용법 보기</span>
        </button>

        {/* 로그인 */}
        <Link 
          href="/login"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          로그인
        </Link>

        {/* 회원가입 (강조) */}
        <Link 
          href="/signup"
          className="px-5 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
        >
          회원가입
        </Link>
      </div>
    </header>
  );
}

