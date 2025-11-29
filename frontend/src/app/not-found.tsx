'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Home } from 'lucide-react';

/**
 * 404 Not Found 페이지
 */
export default function NotFound() {
  const [splineLoading, setSplineLoading] = useState(true);
  const [splineError, setSplineError] = useState(false);

  // 타임아웃 안전장치: 5초 후 강제로 로딩 완료 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (splineLoading) {
        console.log('[404 Page] ✅ 3D 모델 로드 완료');
        setSplineLoading(false);
      }
    }, 3000); 
  
    return () => clearTimeout(timer);
  }, [splineLoading]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 py-12">
        {/* 메인 컨텐츠 */}
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* 좌측: 3D 모델 */}
          <div className="w-full md:w-1/2 h-[350px] md:h-[450px] relative">
            {!splineError ? (
              <>
                {/* 로딩 상태 */}
                {splineLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl z-10">
                    <div className="text-center">
                      <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-gray-600 text-sm font-medium">3D 모델 로딩 중...</p>
                    </div>
                  </div>
                )}

                {/* Spline 공식 Embed iframe */}
                <iframe
                  src="https://my.spline.design/genkubgreetingrobot-c0VaMBTukZQ7Siz2FXMw6gYu/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media; fullscreen"
                  className="w-full h-full rounded-2xl"
                  style={{ border: 'none' }}
                  onLoad={() => {
                    console.log('[404 Page] ✅ Spline 3D model loaded successfully');
                    setSplineLoading(false);
                  }}
                  onError={(e) => {
                    console.error('[404 Page] ❌ Spline loading error:', e);
                    setSplineError(true);
                    setSplineLoading(false);
                  }}
                  title="3D Robot Animation"
                />
              </>
            ) : (
              // Fallback: 에러 시 아이콘 표시
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400 p-8">
                  <svg 
                    className="w-24 h-24 mx-auto mb-4 opacity-50" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  >
                    <path d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">3D 모델을 불러올 수 없습니다</p>
                  <p className="text-xs text-gray-400 mt-2">네트워크 연결을 확인해주세요</p>
                </div>
              </div>
            )}
          </div>

          {/* 우측: 텍스트 & 버튼 */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                잘못된 페이지에요!
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                요청하신 페이지를 찾을 수 없습니다.<br />
                URL을 다시 확인하시거나 처음으로 돌아가주세요.
              </p>
            </div>

            {/* 처음으로 돌아가기 버튼 (Primary CTA) */}
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
              >
                <Home size={20} />
                <span>처음으로 돌아가기</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

