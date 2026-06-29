"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import DetailField from "@/components/DetailField";
import { useHandover } from "@/lib/useHandovers";
import { repository, reportRepository } from "@/lib/repository";
import { formatDate, maskName } from "@/lib/format";
import { REPORT_REASONS, type ReportReason, type Handover } from "@/lib/types";

const PRIORITY_STYLE: Record<string, string> = {
  높음: "bg-red-50 text-red-700 border-red-200",
  보통: "bg-sky-wash text-ink border-dove/50",
  낮음: "bg-fog text-ash border-dove/40",
};

export default function HandoverDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { item, loading, refresh } = useHandover(id);

  // 관련 업무위키
  const [relatedItems, setRelatedItems] = useState<Handover[]>([]);

  useEffect(() => {
    if (!item || item.relatedIds.length === 0) { setRelatedItems([]); return; }
    repository.getByIds(item.relatedIds).then(setRelatedItems);
  }, [item]);

  // 삭제 확인
  const [deleteEditor, setDeleteEditor] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 담당자
  const [acceptName, setAcceptName] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [changingAssignee, setChangingAssignee] = useState(false);

  // 신고 모달
  const [reportOpen, setReportOpen] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reportReason, setReportReason] = useState<ReportReason>("오류정보");
  const [reportDetail, setReportDetail] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  async function handleDelete() {
    await repository.remove(id, deleteEditor.trim() || "익명");
    router.push("/");
  }

  async function handleAccept() {
    setAcceptLoading(true);
    await repository.accept(id, acceptName.trim() || "익명");
    await refresh();
    setAcceptLoading(false);
  }

  async function handleUnaccept() {
    setAcceptLoading(true);
    await repository.unaccept(id);
    await refresh();
    setAcceptLoading(false);
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setReportSubmitting(true);
    await reportRepository.create({
      handoverId: id,
      reporterName: reporterName.trim() || "익명",
      reason: reportReason,
      detail: reportDetail.trim(),
    });
    setReportSubmitting(false);
    setReportDone(true);
  }

  async function handleCopy() {
    if (!item) return;
    const { id: _, createdAt: __, updatedAt: ___, isAccepted: ____, acceptedAt: _____, acceptedBy: ______, ...input } = item;
    const copy = await repository.create(
      { ...input, taskName: `${item.taskName} (복사본)` },
      "복사",
    );
    router.push(`/handover/${copy.id}/edit`);
  }

  if (loading) {
    return <p className="py-24 text-center text-[15px] text-graphite">불러오는 중…</p>;
  }
  if (!item) {
    return (
      <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-8">
        <EmptyState title="존재하지 않는 업무위키예요" description="삭제되었거나 잘못된 주소입니다." />
        <div className="mt-6 text-center">
          <Link href="/" className="text-[15px] font-[450] text-ink hover:text-ash">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16 print:py-6">
      {/* 상단 네비게이션 */}
      <div className="mb-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            목록으로
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <button onClick={() => window.print()} className="text-[14px] text-graphite hover:text-ink">인쇄</button>
              <button onClick={handleCopy} className="text-[14px] text-graphite hover:text-ink">업무 복사</button>
              <Link href={`/handover/${id}/history`} className="text-[14px] text-graphite hover:text-ink">수정 이력</Link>
              <button onClick={() => setReportOpen(true)} className="text-[14px] text-graphite hover:text-rust">신고</button>
            </div>
            <Link href={`/handover/${id}/edit`} className="rounded-pill bg-ink px-5 py-2 text-[14px] font-[450] text-pure-white hover:opacity-90">
              수정
            </Link>
          </div>
        </div>
        {/* 모바일 전용 보조 액션 */}
        <div className="mt-3 flex flex-wrap gap-4 sm:hidden">
          <button onClick={() => window.print()} className="text-[13px] text-graphite hover:text-ink">인쇄</button>
          <button onClick={handleCopy} className="text-[13px] text-graphite hover:text-ink">업무 복사</button>
          <Link href={`/handover/${id}/history`} className="text-[13px] text-graphite hover:text-ink">수정 이력</Link>
          <button onClick={() => setReportOpen(true)} className="text-[13px] text-graphite hover:text-rust">신고</button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="text-[15px] tracking-[-0.01em] text-graphite">{item.department}</span>
        <span className={`inline-flex items-center rounded-pill border px-3 py-0.5 text-[13px] font-[450] ${PRIORITY_STYLE[item.priority]}`}>
          {item.priority}
        </span>
        {item.isAccepted && (
          <span className="inline-flex items-center gap-1 rounded-pill border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[13px] font-[450] text-emerald-700">
            담당 {item.acceptedBy && maskName(item.acceptedBy)}
          </span>
        )}
      </div>
      <h1 className="font-signifier text-[28px] leading-[1.2] tracking-[-0.5px] text-ink sm:text-[40px] sm:leading-[1.12] sm:tracking-[-0.8px]">
        {item.taskName}
      </h1>
      <p className="mt-3 text-[13px] tracking-[-0.01em] text-graphite">
        등록일 {formatDate(item.createdAt)}
        {item.updatedAt !== item.createdAt && <> · 최종수정일 {formatDate(item.updatedAt)}</>}
        {item.isAccepted && item.acceptedAt && <> · 담당 지정 {formatDate(item.acceptedAt)}</>}
      </p>

      {/* 업무 설명 */}
      {item.description && (
        <div className="mt-8 rounded-card bg-pure-white p-6 shadow-card sm:p-8">
          <DetailField label="업무 설명" value={item.description} />
        </div>
      )}

      {/* 업무 일정 */}
      {item.schedules.length > 0 && (
        <div className="mt-5 rounded-card bg-pure-white p-6 shadow-card sm:p-8">
          <p className="mb-4 text-[13px] font-[450] tracking-[-0.01em] text-graphite">업무 일정</p>
          <div className="space-y-3">
            {item.schedules.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded-pill border border-dove/70 bg-fog px-2.5 py-0.5 text-[12px] font-[450] text-ash">
                  {s.cycle}
                </span>
                <span className="text-[15px] leading-[1.5] text-ink">{s.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전임자 노하우 */}
      {item.knowhow && (
        <div className="mt-5 rounded-card bg-apricot-wash p-6 sm:p-8">
          <p className="mb-3 text-[13px] font-[500] tracking-[-0.01em] text-rust">전임자 노하우</p>
          <p className="whitespace-pre-wrap text-[16px] leading-[1.6] text-ink">{item.knowhow}</p>
        </div>
      )}

      {/* 주의사항 + 법령 + 체크리스트 + 시스템 + 첨부 */}
      <dl className="mt-5 rounded-card bg-pure-white p-6 shadow-card sm:p-8">
        <DetailField label="주의사항" value={item.cautions} />
        <DetailField label="관련 법령·지침" value={item.laws} />

        {item.checklist.length > 0 && (
          <div className="border-t border-dove/50 py-5">
            <dt className="mb-3 text-[13px] font-[450] tracking-[-0.01em] text-graphite">업무 체크리스트</dt>
            <dd className="space-y-2">
              {item.checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[15px] text-ink">
                  <span className="text-graphite">☐</span>
                  <span>{c}</span>
                </div>
              ))}
            </dd>
          </div>
        )}

        {item.systems.length > 0 && (
          <div className="border-t border-dove/50 py-5">
            <dt className="mb-3 text-[13px] font-[450] tracking-[-0.01em] text-graphite">관련 시스템</dt>
            <dd className="flex flex-wrap gap-2">
              {item.systems.map((s) => (
                <span key={s} className="rounded-[8px] border border-dove/70 bg-fog px-3 py-1 text-[13px] text-ash">{s}</span>
              ))}
            </dd>
          </div>
        )}

        {item.attachments.length > 0 && (
          <div className="border-t border-dove/50 py-5">
            <dt className="mb-3 text-[13px] font-[450] tracking-[-0.01em] text-graphite">첨부 파일</dt>
            <dd className="space-y-2">
              {item.attachments.map((a, i) =>
                a.startsWith("https://") ? (
                  <a key={i} href={a} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-[10px] border border-dove/70 px-4 py-2.5 text-[14px] text-ink transition-colors hover:border-ink hover:bg-fog">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-graphite"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                    <span className="flex-1 truncate">{decodeURIComponent(a.split("/").pop()?.split("?")[0] ?? a)}</span>
                    <span className="shrink-0 text-[12px] text-graphite">다운로드</span>
                  </a>
                ) : (
                  <p key={i} className="text-[14px] leading-[1.6] text-ash">{a}</p>
                )
              )}
            </dd>
          </div>
        )}
      </dl>

      {/* 관련 업무위키 */}
      {relatedItems.length > 0 && (
        <div className="mt-5 rounded-card bg-pure-white p-6 shadow-card sm:p-8">
          <p className="mb-4 text-[13px] font-[450] tracking-[-0.01em] text-graphite">관련 업무위키</p>
          <div className="space-y-2">
            {relatedItems.map((r) => (
              <Link
                key={r.id}
                href={`/handover/${r.id}`}
                className="flex items-center gap-3 rounded-[12px] border border-dove/70 px-4 py-3 hover:border-ink"
              >
                <span className="text-[12px] text-graphite">{r.department}</span>
                <span className="text-[14px] font-[450] text-ink">{r.taskName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 현재 담당자 */}
      <div className="mt-8 rounded-card border border-dove/70 p-5 print:hidden">
        <p className="mb-3 text-[14px] font-[450] text-ink">현재 담당자</p>
        {item.isAccepted && !changingAssignee ? (
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[16px] font-[480] text-ink">{maskName(item.acceptedBy ?? "")}</span>
              {item.acceptedAt && (
                <span className="ml-2 text-[13px] text-graphite">{formatDate(item.acceptedAt)}부터</span>
              )}
            </div>
            <button
              onClick={() => { setChangingAssignee(true); setAcceptName(""); }}
              className="rounded-pill border border-dove px-4 py-1.5 text-[13px] text-graphite hover:border-ink hover:text-ink"
            >
              담당자 변경
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {item.isAccepted && (
              <p className="text-[13px] text-graphite">새 담당자 이름을 입력하면 기존 담당자가 교체됩니다.</p>
            )}
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={acceptName}
                onChange={(e) => setAcceptName(e.target.value)}
                placeholder="담당자 이름 입력"
                autoFocus={changingAssignee}
                className="min-w-0 flex-1 rounded-input border border-dove px-4 py-2.5 text-[14px] outline-none focus:border-ink sm:flex-none"
              />
              <button
                onClick={async () => { await handleAccept(); setChangingAssignee(false); }}
                disabled={acceptLoading}
                className="rounded-pill bg-ink px-5 py-2 text-[14px] font-[450] text-pure-white hover:opacity-90 disabled:opacity-50"
              >
                {acceptLoading ? "처리 중…" : item.isAccepted ? "변경 확인" : "담당자 지정"}
              </button>
              {changingAssignee && (
                <button
                  onClick={() => { setChangingAssignee(false); setAcceptName(""); }}
                  className="text-[14px] text-graphite hover:text-ink"
                >
                  취소
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 삭제 */}
      <div className="mt-6 print:hidden">
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="text-[14px] font-[450] text-graphite hover:text-rust">
            이 업무위키 삭제
          </button>
        ) : (
          <div className="rounded-card border border-dove/70 p-5">
            <p className="mb-3 text-[14px] text-ink">정말 삭제할까요? 관리자 페이지에서 복구할 수 있습니다.</p>
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] text-graphite">삭제자명 (이력 기록용)</label>
              <input type="text" value={deleteEditor} onChange={(e) => setDeleteEditor(e.target.value)}
                placeholder="홍길동 (미입력 시 익명)"
                className="w-full max-w-[280px] rounded-input border border-dove px-4 py-2.5 text-[14px] outline-none focus:border-ink" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="rounded-pill bg-rust px-5 py-2 text-[14px] font-[450] text-pure-white hover:opacity-80">
                삭제 확인
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-[14px] text-graphite hover:text-ink">취소</button>
            </div>
          </div>
        )}
      </div>

      {/* 신고 모달 */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-card bg-pure-white p-6 shadow-card sm:p-8">
            {reportDone ? (
              <div className="py-4 text-center">
                <p className="text-[17px] font-[480] text-ink">신고가 접수되었습니다.</p>
                <p className="mt-2 text-[14px] text-graphite">검토 후 처리하겠습니다.</p>
                <button onClick={() => { setReportOpen(false); setReportDone(false); setReportDetail(""); setReporterName(""); }}
                  className="mt-6 rounded-pill bg-ink px-6 py-2.5 text-[14px] text-pure-white">닫기</button>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-5">
                <h2 className="text-[20px] font-[480] text-ink">신고하기</h2>
                <div>
                  <label className="mb-1.5 block text-[14px] font-[450] text-graphite">신고자명 (선택)</label>
                  <input type="text" value={reporterName} onChange={(e) => setReporterName(e.target.value)}
                    placeholder="미입력 시 익명"
                    className="w-full rounded-input border border-dove px-4 py-3 text-[14px] outline-none focus:border-ink" />
                </div>
                <div>
                  <label className="mb-2 block text-[14px] font-[450] text-graphite">신고 사유</label>
                  <div className="flex flex-wrap gap-2">
                    {REPORT_REASONS.map((r) => (
                      <button key={r} type="button" onClick={() => setReportReason(r)}
                        className={["rounded-pill border px-3 py-1.5 text-[13px] transition-colors",
                          reportReason === r ? "border-ink bg-ink text-pure-white" : "border-dove text-ash hover:border-ink"].join(" ")}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[14px] font-[450] text-graphite">상세 내용</label>
                  <textarea value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} rows={3}
                    placeholder="어떤 부분이 문제인지 구체적으로 알려주세요."
                    className="w-full rounded-input border border-dove px-4 py-3 text-[14px] leading-[1.6] outline-none focus:border-ink" />
                </div>
                <div className="flex items-center gap-4">
                  <button type="submit" disabled={reportSubmitting}
                    className="rounded-pill bg-ink px-6 py-2.5 text-[14px] font-[450] text-pure-white hover:opacity-90 disabled:opacity-50">
                    {reportSubmitting ? "제출 중…" : "신고 제출"}
                  </button>
                  <button type="button" onClick={() => setReportOpen(false)} className="text-[14px] text-graphite hover:text-ink">취소</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
