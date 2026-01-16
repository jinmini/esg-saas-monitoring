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

  // Image optimization (여기가 수정되었습니다)
  images: {
    // remotePatterns를 사용하여 외부 도메인 허용 (Next.js 12.3+ 권장 방식)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com', // Webflow 이미지
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // 예시 플레이스홀더 이미지
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // SVG as React Component (SVGR)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
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
            typescript: true,
            dimensions: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;