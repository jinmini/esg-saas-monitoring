import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ESG News Monitor | SaaS 기업 ESG 뉴스 모니터링",
  description: "ESG SaaS 기업들의 최신 뉴스를 실시간으로 모니터링하고 분석하는 플랫폼입니다.",
  keywords: ["ESG", "SaaS", "뉴스", "모니터링", "지속가능성"],
  authors: [{ name: "ESG News Monitor Team" }],
  viewport: "width=device-width, initial-scale=1",
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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
