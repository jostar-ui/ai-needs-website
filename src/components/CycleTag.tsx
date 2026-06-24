import type { Cycle } from "@/lib/types";

// 담당주기 태그 (pill). 단색 유지 — 채도 높은 색 금지(DESIGN.md).
export default function CycleTag({ cycle }: { cycle: Cycle }) {
  return (
    <span className="inline-flex items-center rounded-pill border border-dove/70 bg-fog px-3 py-1 text-[13px] font-[450] tracking-[-0.009em] text-ash">
      {cycle}
    </span>
  );
}
