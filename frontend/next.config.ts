import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-select'],
  },
  
  // ESLint: 경고만 표시, 빌드 차단 안 함 (배포 최적화)
  eslint: {
    // Warning: 프로덕션 빌드 시 ESLint 에러를 무시합니다
    // 개발 중에는 `pnpm lint`로 별도 검사하세요
    ignoreDuringBuilds: true,
  },
  
  // TypeScript: 타입 에러도 경고만 (legacy 코드 존재)
  typescript: {
    // Warning: 프로덕션 빌드 시 타입 에러를 무시합니다
    ignoreBuildErrors: true,
  },
  
  // 빌드에서 제외할 경로 (legacy 코드)
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ESG News Monitor',
  },

  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // SVG as React Component (SVGR)
  webpack(config) {
    // SVG를 React 컴포넌트로 import 가능하게 설정
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            // SVG 최적화 옵션
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // viewBox 제거 방지 (뷰포트 제어에 필수)
                      removeViewBox: false,
                      // ID 중복 방지
                      cleanupIds: {
                        remove: true,
                        minify: true,
                        prefix: {
                          toString() {
                            return `svg-${Math.random().toString(36).substr(2, 9)}`;
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
            // TypeScript 지원
            typescript: true,
            // Props를 SVG element에 전달
            dimensions: false,
          },
        },
      ],
    });

    return config;
  },

  // PWA settings (for future implementation)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

export default nextConfig;
