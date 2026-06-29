"use client";
export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { repository } from "@/lib/repository";
import { formatDate } from "@/lib/format";
import { seedSupabase } from "@/lib/seedSupabase";
import type { Handover } from "@/lib/types";

const PRIORITY_STYLE: Record<Handover["priority"], string> = {
  높음: "bg-red-50 text-red-700",
  보통: "bg-sky-wash text-ink",
  낮음: "bg-fog text-ash",
};

function exportCsv(items: Handover[]) {
  const headers = ["부서", "업무명", "중요도", "상태", "담당자", "등록일", "최종수정일", "업무설명", "주의사항", "노하우"];
  const rows = items.map((h) => [
    h.department,
    h.taskName,
    h.priority,
    h.status === "active" ? "활성" : "비활성",
    h.isAccepted ? (h.acceptedBy ?? "지정됨") : "미지정",
    formatDate(h.createdAt),
    formatDate(h.updatedAt),
    h.description.replace(/\n/g, " "),
    h.cautions.replace(/\n/g, " "),
    h.knowhow.replace(/\n/g, " "),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `업무위키_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-right text-[13px] text-graphite">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-pill bg-fog">
        <div className={`h-full rounded-pill transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-[13px] font-[450] text-ink">{count}</span>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "deleted">("all");
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deactivating, setDeactivating] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorInput, setAuthorInput] = useState("");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const load = useCallback(async () => {
    setLoading(true);
    const data = await repository.listAll();
    setItems(data);
    setLoading(false);
    setSelected(new Set());
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() =>
    filter === "all" ? items
      : filter === "active" ? items.filter((i) => i.status === "active")
      : items.filter((i) => i.status === "deleted"),
    [items, filter],
  );

  const activeItems = useMemo(() => items.filter((i) => i.status === "active"), [items]);
  const activeFiltered = filtered.filter((i) => i.status === "active");
  const selectedActive = [...selected].filter((id) => activeFiltered.some((i) => i.id === id));
  const allActiveSelected = activeFiltered.length > 0 && activeFiltered.every((i) => selected.has(i.id));

  // 통계 계산
  const stats = useMemo(() => {
    const deptCount: Record<string, number> = {};
    const priorityCount = { 높음: 0, 보통: 0, 낮음: 0 };
    let acceptedCount = 0;
    for (const h of activeItems) {
      deptCount[h.department] = (deptCount[h.department] ?? 0) + 1;
      priorityCount[h.priority]++;
      if (h.isAccepted) acceptedCount++;
    }
    const topDepts = Object.entries(deptCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const maxDept = topDepts[0]?.[1] ?? 1;
    return { topDepts, maxDept, priorityCount, acceptedCount, total: activeItems.length };
  }, [activeItems]);

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }
  function toggleAllActive() {
    setSelected(allActiveSelected ? new Set() : new Set(activeFiltered.map((i) => i.id)));
  }

  async function handleDeactivate() {
    if (selectedActive.length === 0) return;
    const confirmed = window.confirm(`선택한 ${selectedActive.length}건을 비활성화할까요?\n관리자 페이지에서 복구할 수 있습니다.`);
    if (!confirmed) return;
    setDeactivating(true);
    for (const id of selectedActive) await repository.remove(id, "관리자");
    await load();
    setDeactivating(false);
  }

  async function handleRestore(id: string) {
    setRestoring(id);
    await repository.restore(id, "관리자");
    await load();
    setRestoring(null);
  }

  async function handleAuthorSave(id: string) {
    await repository.updateAuthor(id, authorInput.trim() || "익명");
    await load();
    setEditingAuthorId(null);
    setAuthorInput("");
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("");
    try {
      const count = await seedSupabase();
      setSeedMsg(`샘플 데이터 ${count}건이 추가되었습니다.`);
      await load();
    } catch (e) {
      setSeedMsg(e instanceof Error ? e.message : "초기화 실패");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="mx-auto max-w-page px-5 py-12 sm:px-8 sm:py-16">
      {/* 헤더 */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-signifier text-[40px] leading-[1.12] tracking-[-0.8px] text-ink">관리자</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/reports" className="rounded-pill border border-dove px-5 py-2 text-[14px] text-ash hover:border-ink">
            신고 목록
          </Link>
          <button onClick={() => exportCsv(items)} className="rounded-pill border border-dove px-5 py-2 text-[14px] text-ash hover:border-ink">
            CSV 내보내기
          </button>
          <button onClick={handleSeed} disabled={seeding} className="rounded-pill border border-dove px-5 py-2 text-[14px] text-ash hover:border-ink disabled:opacity-50">
            {seeding ? "초기화 중…" : "샘플 데이터 초기화"}
          </button>
          <button onClick={handleLogout} className="rounded-pill border border-dove px-5 py-2 text-[14px] text-ash hover:border-rust hover:text-rust">
            로그아웃
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="mb-6 rounded-[12px] bg-sky-wash px-4 py-3 text-[14px] text-ink">{seedMsg}</div>
      )}

      {/* 통계 패널 */}
      <div className="mb-6 rounded-card bg-pure-white p-5 shadow-card">
        <button
          onClick={() => setShowStats((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[28px] font-[480] text-ink">{stats.total}</p>
              <p className="text-[12px] text-graphite">활성 업무</p>
            </div>
            <div className="text-center">
              <p className="text-[28px] font-[480] text-ink">{stats.acceptedCount}</p>
              <p className="text-[12px] text-graphite">담당자 지정</p>
            </div>
            <div className="text-center">
              <p className="text-[28px] font-[480] text-red-600">{stats.priorityCount["높음"]}</p>
              <p className="text-[12px] text-graphite">높음 우선순위</p>
            </div>
          </div>
          <span className="text-[13px] text-graphite">{showStats ? "접기 ▲" : "통계 보기 ▼"}</span>
        </button>

        {showStats && (
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {/* 중요도 분포 */}
            <div>
              <p className="mb-3 text-[13px] font-[450] text-graphite">중요도 분포</p>
              <div className="space-y-2">
                <StatBar label="높음" count={stats.priorityCount["높음"]} max={stats.total} color="bg-red-400" />
                <StatBar label="보통" count={stats.priorityCount["보통"]} max={stats.total} color="bg-sky-400" />
                <StatBar label="낮음" count={stats.priorityCount["낮음"]} max={stats.total} color="bg-dove" />
              </div>
            </div>
            {/* 부서별 */}
            <div>
              <p className="mb-3 text-[13px] font-[450] text-graphite">부서별 등록 현황 (상위 8)</p>
              <div className="space-y-2">
                {stats.topDepts.map(([dept, count]) => (
                  <StatBar key={dept} label={dept} count={count} max={stats.maxDept} color="bg-ink/70" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 필터 + 선택 액션 바 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["all", "active", "deleted"] as const).map((f) => (
            <button key={f} onClick={() => { setFilter(f); setSelected(new Set()); }}
              className={["rounded-pill border px-4 py-1.5 text-[13px] font-[450] transition-colors",
                filter === f ? "border-ink bg-ink text-pure-white" : "border-dove bg-pure-white text-ash hover:border-ink"].join(" ")}>
              {f === "all" ? "전체" : f === "active" ? "활성" : "삭제됨"}
            </button>
          ))}
        </div>
        <span className="text-[14px] text-graphite">{filtered.length}건</span>
        {selectedActive.length > 0 && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[14px] text-graphite">{selectedActive.length}건 선택됨</span>
            <button onClick={handleDeactivate} disabled={deactivating}
              className="rounded-pill bg-rust px-5 py-2 text-[14px] font-[450] text-pure-white hover:opacity-90 disabled:opacity-50">
              {deactivating ? "처리 중…" : "선택 비활성화"}
            </button>
          </div>
        )}
      </div>

      {/* 전체 선택 */}
      {!loading && activeFiltered.length > 0 && (
        <div className="mb-3 flex items-center gap-2 px-1">
          <input type="checkbox" id="select-all" checked={allActiveSelected} onChange={toggleAllActive}
            className="h-4 w-4 cursor-pointer accent-ink" />
          <label htmlFor="select-all" className="cursor-pointer text-[13px] text-graphite">
            활성 항목 전체 선택 ({activeFiltered.length}건)
          </label>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-[15px] text-graphite">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-graphite">항목이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isDeleted = item.status === "deleted";
            const isSelected = selected.has(item.id);
            return (
              <div key={item.id}
                className={["flex flex-wrap items-center gap-4 rounded-card bg-pure-white p-5 shadow-card transition-colors",
                  isDeleted ? "opacity-50" : "",
                  isSelected ? "ring-2 ring-ink/30" : ""].join(" ")}>
                <div className="shrink-0">
                  {!isDeleted ? (
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 cursor-pointer accent-ink" aria-label={`${item.taskName} 선택`} />
                  ) : <div className="h-4 w-4" />}
                </div>
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <span className={`rounded-pill px-2.5 py-0.5 text-[12px] font-[450] ${PRIORITY_STYLE[item.priority]}`}>
                    {item.priority}
                  </span>
                  {isDeleted && (
                    <span className="rounded-pill bg-red-50 px-2.5 py-0.5 text-[12px] font-[450] text-red-700">비활성</span>
                  )}
                  {item.isAccepted && (
                    <span className="rounded-pill border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[12px] font-[450] text-emerald-700">담당자 지정</span>
                  )}
                  <span className="text-[13px] text-graphite">{item.department}</span>
                  <Link href={`/handover/${item.id}`} className="text-[15px] font-[450] text-ink hover:underline">
                    {item.taskName}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* 작성자 편집 */}
                  {editingAuthorId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={authorInput}
                        onChange={(e) => setAuthorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAuthorSave(item.id);
                          if (e.key === "Escape") { setEditingAuthorId(null); setAuthorInput(""); }
                        }}
                        placeholder="작성자명"
                        className="w-28 rounded-[8px] border border-dove px-3 py-1 text-[13px] outline-none focus:border-ink"
                      />
                      <button onClick={() => handleAuthorSave(item.id)}
                        className="rounded-pill bg-ink px-3 py-1 text-[12px] text-pure-white hover:opacity-90">
                        저장
                      </button>
                      <button onClick={() => { setEditingAuthorId(null); setAuthorInput(""); }}
                        className="text-[12px] text-graphite hover:text-ink">
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingAuthorId(item.id); setAuthorInput(item.createdBy ?? ""); }}
                      className="flex items-center gap-1 text-[13px] text-graphite hover:text-ink"
                      title="작성자 변경"
                    >
                      <span>{item.createdBy || "익명"}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dove"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                    </button>
                  )}
                  <span className="text-[13px] text-graphite">{formatDate(item.createdAt)}</span>
                  {isDeleted && (
                    <button onClick={() => handleRestore(item.id)} disabled={restoring === item.id}
                      className="rounded-pill bg-ink px-4 py-1.5 text-[13px] font-[450] text-pure-white hover:opacity-90 disabled:opacity-50">
                      {restoring === item.id ? "복구 중…" : "복구"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
