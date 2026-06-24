"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { historyRepository } from "@/lib/repository";
import { formatDate } from "@/lib/format";
import type { HandoverHistory } from "@/lib/types";

const CHANGE_TYPE_LABEL: Record<HandoverHistory["changeType"], string> = {
  create: "등록",
  update: "수정",
  delete: "삭제",
  restore: "복구",
};
const CHANGE_TYPE_STYLE: Record<HandoverHistory["changeType"], string> = {
  create: "bg-sky-wash text-ink",
  update: "bg-fog text-ash",
  delete: "bg-red-50 text-red-700",
  restore: "bg-apricot-wash text-rust",
};

const FIELD_LABEL: Record<string, string> = {
  department: "부서명",
  taskName: "업무명",
  description: "업무 설명",
  priority: "중요도",
  schedules: "업무 일정",
  checklist: "체크리스트",
  systems: "관련 시스템",
  laws: "법령·지침",
  cautions: "주의사항",
  knowhow: "노하우",
  attachments: "관련 파일",
  status: "상태",
};

function DiffRow({ label, before, after }: { label: string; before: unknown; after: unknown }) {
  const fmt = (v: unknown): string => {
    if (v === null || v === undefined) return "(없음)";
    if (Array.isArray(v)) return v.length === 0 ? "(없음)" : JSON.stringify(v);
    return String(v);
  };
  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-3 py-2 text-[13px]">
      <span className="font-[450] text-graphite">{label}</span>
      <span className="rounded-[6px] bg-red-50 px-2 py-1 text-red-700 line-through">{fmt(before)}</span>
      <span className="rounded-[6px] bg-sky-wash px-2 py-1 text-ink">{fmt(after)}</span>
    </div>
  );
}

export default function HistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [histories, setHistories] = useState<HandoverHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    historyRepository.listByHandover(id).then((data) => {
      setHistories(data);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={`/handover/${id}`}
          className="inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          상세로 돌아가기
        </Link>
      </div>

      <h1 className="mb-8 font-signifier text-[40px] leading-[1.12] tracking-[-0.8px] text-ink">
        수정 이력
      </h1>

      {loading ? (
        <p className="py-16 text-center text-[15px] text-graphite">불러오는 중…</p>
      ) : histories.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-graphite">아직 이력이 없습니다.</p>
      ) : (
        <div className="relative pl-5">
          {/* 타임라인 선 */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-dove" />

          <div className="space-y-4">
            {histories.map((h) => {
              const isExpanded = expanded === h.id;
              const hasChanges = h.changedFields.length > 0 && h.beforeData && h.afterData;
              return (
                <div key={h.id} className="relative">
                  {/* 타임라인 점 */}
                  <div className="absolute -left-5 top-4 h-3 w-3 rounded-full border-2 border-pure-white bg-dove" />

                  <div className="rounded-card bg-pure-white p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`rounded-pill px-2.5 py-0.5 text-[12px] font-[450] ${CHANGE_TYPE_STYLE[h.changeType]}`}>
                          {CHANGE_TYPE_LABEL[h.changeType]}
                        </span>
                        <span className="text-[14px] font-[450] text-ink">{h.editorName}</span>
                      </div>
                      <span className="text-[13px] text-graphite">{formatDate(h.createdAt)}</span>
                    </div>

                    {h.changedFields.length > 0 && (
                      <p className="mt-2 text-[13px] text-graphite">
                        변경 필드: {h.changedFields.map((f) => FIELD_LABEL[f] ?? f).join(", ")}
                      </p>
                    )}

                    {hasChanges && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : h.id)}
                        className="mt-3 text-[13px] font-[450] text-ink hover:text-ash"
                      >
                        {isExpanded ? "변경 내용 접기" : "변경 내용 보기"}
                      </button>
                    )}

                    {isExpanded && h.beforeData && h.afterData && (
                      <div className="mt-4 overflow-x-auto rounded-[12px] border border-dove/70 p-3">
                        <div className="mb-2 grid grid-cols-[140px_1fr_1fr] gap-3">
                          <span className="text-[12px] text-graphite" />
                          <span className="text-[12px] font-[450] text-graphite">변경 전</span>
                          <span className="text-[12px] font-[450] text-graphite">변경 후</span>
                        </div>
                        <div className="divide-y divide-dove/50">
                          {h.changedFields.map((f) => (
                            <DiffRow
                              key={f}
                              label={FIELD_LABEL[f] ?? f}
                              before={(h.beforeData as Record<string, unknown>)[f]}
                              after={(h.afterData as Record<string, unknown>)[f]}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
