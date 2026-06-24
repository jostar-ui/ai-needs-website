"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import DepartmentFilter, { ALL_DEPARTMENTS } from "@/components/DepartmentFilter";
import HandoverCard from "@/components/HandoverCard";
import EmptyState from "@/components/EmptyState";
import { useHandovers } from "@/lib/useHandovers";
import type { Handover } from "@/lib/types";

const PRIORITY_FILTER_OPTIONS: Array<Handover["priority"] | "전체"> = [
  "전체", "높음", "보통", "낮음",
];

type SortKey = "newest" | "oldest" | "priority" | "department";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "최근 등록순" },
  { value: "oldest", label: "오래된순" },
  { value: "priority", label: "중요도순" },
  { value: "department", label: "부서명순" },
];

const PRIORITY_ORDER: Record<Handover["priority"], number> = { 높음: 0, 보통: 1, 낮음: 2 };
const MEDALS = ["🥇", "🥈", "🥉"];

function DeptRanking({ items, onDeptClick }: { items: Handover[]; onDeptClick: (dept: string) => void }) {
  const [open, setOpen] = useState(false);

  const ranking = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of items) {
      counts[h.department] = (counts[h.department] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [items]);

  const max = ranking[0]?.[1] ?? 1;
  const total = items.length;

  return (
    <div className="mb-10 overflow-hidden rounded-card bg-pure-white shadow-card">
      {/* 헤더 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-[18px]">🏆</span>
          <div className="min-w-0">
            <p className="text-[15px] font-[480] text-ink">부서별 인수인계 현황</p>
            <p className="text-[12px] text-graphite">총 {total}건 등록됨 · 클릭하면 해당 부서 목록으로 이동</p>
          </div>
        </div>
        <span className="shrink-0 whitespace-nowrap text-[12px] text-graphite">{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>

      {open && (
        <div className="border-t border-fog px-6 pb-5 pt-4">
          <div className="space-y-3">
            {ranking.map(([dept, count], i) => {
              const pct = Math.round((count / max) * 100);
              return (
                <button
                  key={dept}
                  onClick={() => onDeptClick(dept)}
                  className="group flex w-full items-center gap-3 text-left"
                >
                  {/* 순위 */}
                  <span className="w-7 shrink-0 text-center text-[14px]">
                    {MEDALS[i] ?? (
                      <span className="text-[12px] font-[450] text-graphite">{i + 1}</span>
                    )}
                  </span>
                  {/* 부서명 */}
                  <span className="w-24 shrink-0 truncate text-[13px] font-[450] text-ink group-hover:text-rust group-hover:underline sm:w-36">
                    {dept}
                  </span>
                  {/* 바 */}
                  <div className="h-5 flex-1 overflow-hidden rounded-pill bg-fog">
                    <div
                      className="flex h-full items-center justify-end rounded-pill bg-ink/80 pr-2 transition-all duration-500 group-hover:bg-rust"
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 20 && (
                        <span className="text-[11px] font-[450] text-pure-white">{count}건</span>
                      )}
                    </div>
                  </div>
                  {/* 건수 (바가 작을 때) */}
                  {pct <= 20 && (
                    <span className="w-8 shrink-0 text-[12px] text-graphite">{count}건</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between border-t border-fog pt-4">
            <p className="text-[13px] text-graphite">우리 부서가 없다면 첫 번째로 등록해보세요</p>
            <Link
              href="/new"
              className="rounded-pill bg-ink px-4 py-1.5 text-[13px] font-[450] text-pure-white hover:opacity-85"
            >
              등록하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState(ALL_DEPARTMENTS);
  const [priorityFilter, setPriorityFilter] = useState<Handover["priority"] | "전체">("전체");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // 전체 목록 (랭킹용)
  const { items: allItems } = useHandovers({ query: "", department: "" });

  // 검색/필터 적용 목록
  const { items, loading, error } = useHandovers({
    query,
    department: dept === ALL_DEPARTMENTS ? "" : dept,
  });

  const filtered = useMemo(() => {
    let result = priorityFilter === "전체" ? items : items.filter((h) => h.priority === priorityFilter);
    switch (sortKey) {
      case "oldest":
        result = [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "priority":
        result = [...result].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
      case "department":
        result = [...result].sort((a, b) => a.department.localeCompare(b.department, "ko"));
        break;
      default:
        break;
    }
    return result;
  }, [items, priorityFilter, sortKey]);

  const isSearching = !!(query || dept !== ALL_DEPARTMENTS || priorityFilter !== "전체");

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-page px-5 pb-24 sm:px-8">
        {/* 검색 + 부서 필터 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <DepartmentFilter value={dept} onChange={setDept} />
        </div>

        {/* 중요도 필터 + 정렬 */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {PRIORITY_FILTER_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={[
                  "rounded-pill border px-4 py-1.5 text-[13px] font-[450] transition-colors",
                  priorityFilter === p
                    ? "border-ink bg-ink text-pure-white"
                    : "border-dove bg-pure-white text-ash hover:border-ink",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="shrink-0">
            <div className="relative">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none rounded-pill border border-dove bg-pure-white py-1.5 pl-4 pr-8 text-[13px] text-ash outline-none hover:border-ink focus:border-ink"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-graphite">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </div>
          </div>
        </div>

        {/* 부서 랭킹 — 검색 중이 아닐 때만 표시 */}
        {!isSearching && !loading && allItems.length > 0 && (
          <div className="mt-10">
            <DeptRanking
              items={allItems}
              onDeptClick={(d) => { setDept(d); setPriorityFilter("전체"); }}
            />
          </div>
        )}

        {/* 목록 헤더 */}
        <div className="mb-5 flex items-baseline justify-between" style={{ marginTop: isSearching ? "40px" : "0" }}>
          <h2 className="text-[22px] font-medium tracking-[-0.02em] text-ink">
            {isSearching ? "검색 결과" : "최근 등록된 인수인계"}
          </h2>
          {!loading && (
            <span className="text-[14px] text-graphite">{filtered.length}건</span>
          )}
        </div>

        {error ? (
          <EmptyState title="데이터를 불러오지 못했습니다" description={error} />
        ) : loading ? (
          <p className="py-16 text-center text-[15px] text-graphite">불러오는 중…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={isSearching ? "조건에 맞는 인수인계가 없어요" : "아직 등록된 인수인계가 없어요"}
            description={isSearching ? "검색어나 필터를 바꿔보세요." : "우측 상단의 '새 인수인계 등록'으로 첫 업무를 남겨보세요."}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <li key={item.id}>
                <HandoverCard item={item} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
