"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

// Chat Input Field 스타일 (DESIGN.md): 흰 표면, 16px radius, 1px Dove 보더.
export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-graphite"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="부서명 또는 업무명으로 검색"
        aria-label="부서명 또는 업무명으로 검색"
        className="w-full rounded-input border border-dove bg-pure-white py-4 pl-12 pr-5 text-[15px] tracking-[-0.009em] text-ink outline-none transition-colors focus:border-ink"
      />
    </div>
  );
}
