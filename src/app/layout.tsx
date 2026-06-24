import type { Metadata } from "next";
import { Inter, Source_Serif_4, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SplashScreen from "@/components/SplashScreen";

const sans = Inter({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif-var",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const kr = Noto_Sans_KR({
  variable: "--font-kr-var",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "모두의 업무위키 · 공무원 업무 지식 공유 플랫폼",
  description:
    "공무원이 자리를 옮길 때 업무 지식이 사라지지 않도록. 부서·업무명으로 빠르게 등록하고 빠르게 찾는 업무 지식 공유 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} ${serif.variable} ${kr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pure-white text-ink">
        <SplashScreen />
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
