"use client";

import { useRouter } from "next/navigation";
import type { Handover } from "@/lib/types";
import { formatDate, maskName, timeAgo } from "@/lib/format";

const PRIORITY_STYLE: Record<Handover["priority"], string> = {
  높음: "bg-red-50 text-red-700 border-red-200",
  보통: "bg-sky-wash text-ink border-dove/50",
  낮음: "bg-fog text-ash border-dove/40",
};

function isStale(updatedAt: string): boolean {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return new Date(updatedAt) < oneYearAgo;
}

function AuthorLabel({ createdBy, updatedBy }: { createdBy: string | null; updatedBy: string | null }) {
  if (!createdBy) return null;
  const showArrow = updatedBy && updatedBy !== createdBy;
  return (
    <span className="text-[12px] text-graphite/80">
      {showArrow
        ? <>{maskName(createdBy)} <span className="text-dove">→</span> {maskName(updatedBy)}</>
        : maskName(createdBy)}
    </span>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lower = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark key={i} className="rounded-[2px] bg-yellow-200 text-ink">{part}</mark>
        ) : part
      )}
    </>
  );
}

export default function HandoverCard({ item, index = 0, query = "" }: { item: Handover; index?: number; query?: string }) {
  const router = useRouter();
  const uniqueCycles = [...new Set(item.schedules.map((s) => s.cycle))];
  const stale = isStale(item.updatedAt);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const shimmer = document.createElement("span");
    shimmer.className = "card-shimmer";
    el.appendChild(shimmer);
    shimmer.addEventListener("animationend", () => shimmer.remove());
    router.push(`/handover/${item.id}`);
  }

  return (
    <div
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/handover/${item.id}`)}
      className="card-enter group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-card bg-pure-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.11)] active:scale-[0.97]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* 부서 + 작성자 + 중요도 */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-[13px] tracking-[-0.01em] text-graphite">{item.department}</span>
          {item.createdBy && (
            <>
              <span className="text-[11px] text-dove">·</span>
              <AuthorLabel createdBy={item.createdBy} updatedBy={item.updatedBy} />
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.isAccepted && (
            <span className="inline-flex items-center gap-1 rounded-pill border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-[450] text-emerald-700">
              담당 {item.acceptedBy && maskName(item.acceptedBy)}
            </span>
          )}
          <span className={`inline-flex items-center rounded-pill border px-2.5 py-0.5 text-[12px] font-[450] ${PRIORITY_STYLE[item.priority]}`}>
            {item.priority}
          </span>
        </div>
      </div>

      {/* 업무명 */}
      <h3 className="text-[20px] font-[480] leading-[1.2] tracking-[-0.02em] text-ink transition-colors group-hover:text-rust">
        <Highlight text={item.taskName} query={query} />
      </h3>

      {/* 주기 칩들 */}
      {uniqueCycles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uniqueCycles.map((c) => (
            <span key={c} className="inline-flex items-center rounded-pill border border-dove/70 bg-fog px-2.5 py-0.5 text-[12px] font-[450] text-ash">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* 업무 설명 2줄 클램프 */}
      {item.description && (
        <p className="mt-3 line-clamp-2 text-[14px] leading-[1.5] text-ash">
          <Highlight text={item.description} query={query} />
        </p>
      )}

      {/* 시스템 태그 */}
      {item.systems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.systems.slice(0, 3).map((s) => (
            <span key={s} className="rounded-[6px] bg-fog px-2 py-0.5 text-[11px] text-graphite">{s}</span>
          ))}
          {item.systems.length > 3 && (
            <span className="text-[11px] text-graphite">+{item.systems.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] tracking-[-0.01em] text-graphite">
            등록 {formatDate(item.createdAt)}
          </span>
          {item.updatedAt !== item.createdAt && (
            <span className="text-[12px] text-graphite/60">· 수정 {timeAgo(item.updatedAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.helpfulCount > 0 && (
            <span className="text-[12px] text-graphite/60">👍 {item.helpfulCount}</span>
          )}
          {stale && (
            <span className="rounded-pill bg-apricot-wash px-2 py-0.5 text-[11px] font-[450] text-rust">
              검토 필요
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
