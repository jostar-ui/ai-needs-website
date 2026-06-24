// 홈 히어로 (DESIGN.md): 흰 캔버스 + Apricot Wash radial glow + Signifier 헤드라인.
// glow 는 이 히어로에서만 사용한다.
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* 따뜻한 radial glow — 히어로 전용 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[820px] max-w-[120vw] -translate-x-1/2 rounded-pill"
        style={{
          background:
            "radial-gradient(closest-side, rgba(251,225,209,0.55), rgba(251,225,209,0) 70%)",
        }}
      />
      <div className="relative mx-auto max-w-page px-5 pb-10 pt-16 text-center sm:px-8 sm:pt-24 sm:pb-14">
        <p className="mb-4 text-[14px] font-[450] tracking-[-0.01em] text-rust">
          공무원 업무 지식 공유 플랫폼
        </p>
        <h1 className="font-signifier text-[40px] leading-[1.1] tracking-[-1px] text-ink sm:text-[64px] sm:tracking-[-1.6px]">
          업무는 옮겨가도,
          <br /> 노하우는 남도록.
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.5] text-ash sm:text-[18px]">
          전임자의 업무 설명·주의사항·법령·노하우를 한 장의 카드로.
          <br className="hidden sm:block" />
          부서와 업무명으로 빠르게 등록하고, 빠르게 찾으세요.
        </p>
      </div>
    </section>
  );
}
