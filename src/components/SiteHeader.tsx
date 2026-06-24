import Link from "next/link";

// Top Navigation Bar (DESIGN.md): 흰 배경, 좌측 Ink 로고, 우측 단일 Filled CTA.
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-dove/60 bg-pure-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-[17px] font-medium tracking-[-0.01em] text-ink"
        >
          모두의 업무위키
        </Link>

        <Link
          href="/new"
          className="rounded-pill bg-ink px-5 py-2 text-[15px] font-[450] tracking-[-0.009em] text-pure-white transition-opacity hover:opacity-90"
        >
          새 업무 등록
        </Link>
      </div>
    </header>
  );
}
