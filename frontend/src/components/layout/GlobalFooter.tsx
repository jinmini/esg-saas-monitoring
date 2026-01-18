'use client';

import React from 'react';
import Link from 'next/link';

export function GlobalFooter() {
  return (
    // 배경 투명, 상단 경계선 추가
    <footer className="w-full py-8 px-6 mt-12 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <div className="text-xs text-gray-400">
          © 2026 ESG SIP. All rights reserved.
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-gray-900 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </footer>
  );
}