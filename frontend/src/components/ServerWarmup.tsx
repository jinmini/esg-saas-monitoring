'use client';

import { useEffect } from 'react';

/**
 * Render Free Plan 콜드스타트 대응을 위한 서버 워밍업 컴포넌트
 * 
 * - Render Free Plan은 15분간 트래픽 없으면 Sleep
 * - 첫 요청 시 15~30초 부팅 시간 소요
 * - UptimeRobot이 5분마다 깨우지만, 사용자 접속 직전엔 보장 못함
 * - 따라서 페이지 로드 시 미리 서버를 깨워서 실제 API 요청 전 준비
 * 
 * @see https://docs.render.com/free#free-web-services
 */
export default function ServerWarmup() {
  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!API_BASE_URL) {
      console.warn('[Server Warmup] API_BASE_URL not configured');
      return;
    }

    // 헬스체크 엔드포인트로 서버 깨우기
    const warmupUrl = `${API_BASE_URL}/health`;
    
    console.log('[Server Warmup] Starting server warmup...', warmupUrl);

    fetch(warmupUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(25000), // 25초 timeout (콜드스타트 여유)
    })
      .then((response) => {
        if (response.ok) {
          console.log('[Server Warmup] ✅ Server is ready');
        } else {
          console.warn('[Server Warmup] ⚠️ Server responded but not healthy', response.status);
        }
      })
      .catch((error) => {
        // 타임아웃이나 네트워크 에러는 무시 (백그라운드 작업)
        if (error.name === 'TimeoutError') {
          console.log('[Server Warmup] ⏱️ Server is waking up (timeout, but that\'s ok)');
        } else if (error.name === 'AbortError') {
          console.log('[Server Warmup] ⏱️ Request aborted (server might be starting)');
        } else {
          console.warn('[Server Warmup] ❌ Warmup failed:', error.message);
        }
      });
  }, []); // 컴포넌트 마운트 시 1회만 실행

  // UI를 렌더링하지 않음 (백그라운드 작업만)
  return null;
}

