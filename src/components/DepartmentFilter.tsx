"use client";

import { DEPARTMENT_GROUPS } from "@/lib/departments";

interface DepartmentFilterProps {
  value: string; // "" = 전체
  onChange: (value: string) => void;
}

export const ALL_DEPARTMENTS = "";

// 부서 필터 (DESIGN.md): 부서 종류가 많아 실/국 그룹 드롭다운으로 처리.
export default function DepartmentFilter({
  value,
  onChange,
}: DepartmentFilterProps) {
  const active = value !== ALL_DEPARTMENTS;
  return (
    <label className="relative block">
      <span className="sr-only">부서 선택</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full appearance-none rounded-input border bg-pure-white py-4 pl-5 pr-11 text-[15px] tracking-[-0.009em] outline-none transition-colors focus:border-ink sm:w-auto sm:min-w-[200px]",
          active ? "border-ink text-ink" : "border-dove text-graphite",
        ].join(" ")}
      >
        <option value={ALL_DEPARTMENTS}>전체 부서</option>
        {DEPARTMENT_GROUPS.map((g) => (
          <optgroup key={g.group} label={g.group}>
            {g.items.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-graphite"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}
