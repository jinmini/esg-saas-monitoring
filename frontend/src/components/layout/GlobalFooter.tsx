'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Global Footer
 * 
 * 미니멀 디자인:
 * - 경계선 없음
 * - 흰 배경
 * - 중앙 정렬 텍스트 링크
 */
export function GlobalFooter() {
  return (
    <footer className="h-16 bg-white flex items-center justify-center px-6">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {/* 저작권 */}
        <span>© 2025 ESG SIP</span>

        {/* 구분선 */}
        <span className="text-gray-300">|</span>

        {/* 이용약관 */}
        <Link 
          href="/terms"
          className="hover:text-gray-900 transition-colors"
        >
          이용약관
        </Link>

        {/* 구분선 */}
        <span className="text-gray-300">|</span>

        {/* 개인정보처리방침 */}
        <Link 
          href="/privacy"
          className="hover:text-gray-900 transition-colors"
        >
          개인정보처리방침
        </Link>
      </div>
    </footer>
  );
}

