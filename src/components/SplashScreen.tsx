"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "splash_shown";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    const fadeOut = setTimeout(() => setHiding(true), 1800);
    const remove  = setTimeout(() => setVisible(false), 2400);
    return () => { clearTimeout(fadeOut); clearTimeout(remove); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-pure-white",
        "transition-opacity duration-500",
        hiding ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      {/* 배경 glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,225,209,0.55) 0%, transparent 70%)" }}
      />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 아이콘 */}
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-ink"
          style={{ animation: "fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 8h16M6 14h10M6 20h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M20 17l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 타이틀 */}
        <h1
          className="font-signifier text-[46px] tracking-[-0.9px] text-ink sm:text-[58px]"
          style={{ animation: "fadeSlideUp 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          모두의 업무위키
        </h1>

        {/* 부제 */}
        <p
          className="mt-3 text-[15px] text-graphite"
          style={{ animation: "fadeSlideUp 0.55s 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          공무원 업무 지식 공유 플랫폼
        </p>

        {/* 진행 바 */}
        <div
          className="mt-10 h-[2px] w-36 overflow-hidden rounded-full bg-fog"
          style={{ animation: "fadeSlideUp 0.55s 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div className="splash-progress h-full rounded-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
