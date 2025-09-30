import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ESG SIP | SaaS Intelligence Platform",
  description: "ESG SaaS 기업들의 최신 뉴스를 실시간으로 모니터링하고 분석하는 대시보드 플랫폼입니다.",
  keywords: ["ESG", "SaaS", "뉴스", "모니터링", "지속가능성", "대시보드", "분석"],
  authors: [{ name: "ESG SIP Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
