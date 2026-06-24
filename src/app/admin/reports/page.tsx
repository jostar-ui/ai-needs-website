"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { reportRepository } from "@/lib/repository";
import { formatDate } from "@/lib/format";
import type { HandoverReport } from "@/lib/types";

const STATUS_LABEL: Record<HandoverReport["status"], string> = {
  pending: "검토 대기",
  resolved: "처리 완료",
  dismissed: "반려",
};
const STATUS_STYLE: Record<HandoverReport["status"], string> = {
  pending: "bg-apricot-wash text-rust",
  resolved: "bg-sky-wash text-ink",
  dismissed: "bg-fog text-ash",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<HandoverReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<HandoverReport["status"] | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await reportRepository.listAll();
    setReports(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  // handoverId별 신고 수 (3건 이상 강조)
  const countByHandover: Record<string, number> = {};
  for (const r of reports) {
    countByHandover[r.handoverId] = (countByHandover[r.handoverId] ?? 0) + 1;
  }

  async function handleStatus(id: string, status: HandoverReport["status"]) {
    setUpdating(id);
    await reportRepository.updateStatus(id, status);
    await load();
    setUpdating(null);
  }

  return (
    <div className="mx-auto max-w-page px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          관리자
        </Link>
        <h1 className="font-signifier text-[40px] leading-[1.12] tracking-[-0.8px] text-ink">
          신고 목록
        </h1>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "resolved", "dismissed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={[
              "rounded-pill border px-4 py-1.5 text-[13px] font-[450] transition-colors",
              statusFilter === s
                ? "border-ink bg-ink text-pure-white"
                : "border-dove bg-pure-white text-ash hover:border-ink",
            ].join(" ")}
          >
            {s === "all" ? "전체" : STATUS_LABEL[s]}
          </button>
        ))}
        <span className="ml-auto text-[14px] text-graphite self-center">{filtered.length}건</span>
      </div>

      {loading ? (
        <p className="py-16 text-center text-[15px] text-graphite">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-graphite">신고가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const isHighAlert = countByHandover[r.handoverId] >= 3;
            return (
              <div
                key={r.id}
                className={[
                  "rounded-card bg-pure-white p-5 shadow-card",
                  isHighAlert ? "ring-2 ring-rust/40" : "",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`rounded-pill px-2.5 py-0.5 text-[12px] font-[450] ${STATUS_STYLE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                    <span className="rounded-[6px] border border-dove bg-fog px-2.5 py-0.5 text-[12px] text-ash">
                      {r.reason}
                    </span>
                    {isHighAlert && (
                      <span className="rounded-pill bg-apricot-wash px-2.5 py-0.5 text-[12px] font-[450] text-rust">
                        ⚠ 다수 신고 ({countByHandover[r.handoverId]}건)
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-graphite">{formatDate(r.createdAt)}</span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[13px] text-graphite">신고자</p>
                    <p className="text-[14px] text-ink">{r.reporterName}</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-graphite">대상 인수인계</p>
                    <Link
                      href={`/handover/${r.handoverId}`}
                      className="text-[14px] text-ink underline hover:text-ash"
                    >
                      {r.handoverId.slice(0, 8)}…
                    </Link>
                  </div>
                </div>

                {r.detail && (
                  <p className="mt-3 rounded-[10px] bg-fog px-4 py-3 text-[14px] leading-[1.6] text-ash">
                    {r.detail}
                  </p>
                )}

                {r.status === "pending" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleStatus(r.id, "resolved")}
                      disabled={updating === r.id}
                      className="rounded-pill bg-ink px-4 py-1.5 text-[13px] font-[450] text-pure-white hover:opacity-90 disabled:opacity-50"
                    >
                      처리 완료
                    </button>
                    <button
                      onClick={() => handleStatus(r.id, "dismissed")}
                      disabled={updating === r.id}
                      className="rounded-pill border border-dove px-4 py-1.5 text-[13px] text-ash hover:border-ink"
                    >
                      반려
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
