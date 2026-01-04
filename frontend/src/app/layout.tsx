import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Toaster } from "sonner";
import ServerWarmup from "@/components/ServerWarmup";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ESG SIP | SaaS Intelligence Platform",
  description: "글로벌 ESG SaaS 시장 인텔리전스 플랫폼 - 인터랙티브 지도, 실시간 뉴스 모니터링, AI 보고서 작성",
  keywords: ["ESG", "SaaS", "Intelligence", "Map", "News", "AI", "지속가능성", "뉴스", "모니터링", "보고서"],
  authors: [{ name: "Kim Jinmin" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/icon-512x512.png", color: "#2c5282" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "ESG SIP",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://jinmini.com",
    siteName: "ESG SIP",
    title: "ESG SIP | 글로벌 ESG SaaS Market Intelligence Platform",
    description: "106개 글로벌 ESG SaaS 기업을 인터랙티브 지도로 탐색하세요",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "ESG SIP Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ESG SIP | 글로벌 ESG SaaS Market Intelligence Platform",
    description: "106개 글로벌 ESG SaaS 기업을 인터랙티브 지도로 탐색하세요",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2c5282",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <ServerWarmup />
        <ReactQueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
