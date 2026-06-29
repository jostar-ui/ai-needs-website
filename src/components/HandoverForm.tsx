"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DEPARTMENT_GROUPS } from "@/lib/departments";
import {
  CYCLES,
  PRIORITY_LABELS,
  SYSTEM_PRESETS,
  type Cycle,
  type Handover,
  type HandoverInput,
  type ScheduleItem,
  type HandoverTemplate,
} from "@/lib/types";
import { templateStore } from "@/lib/templates";
import { repository } from "@/lib/repository";
import { supabase } from "@/lib/supabase";

const BUCKET = "handover-attachments";

interface HandoverFormProps {
  initial?: Handover;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (input: HandoverInput, editorName: string) => void;
}

const fieldBase =
  "w-full rounded-input border border-dove bg-pure-white px-4 py-3 text-[15px] tracking-[-0.009em] text-ink outline-none transition-colors focus:border-ink placeholder:text-graphite";
const labelBase = "mb-2 block text-[15px] font-[450] tracking-[-0.01em] text-ink";

function ChipToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={[
            "rounded-pill border px-4 py-2 text-[14px] tracking-[-0.01em] transition-colors",
            value === o
              ? "border-ink bg-ink text-pure-white"
              : "border-dove bg-pure-white text-ash hover:border-ink",
          ].join(" ")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function HandoverForm({
  initial,
  submitLabel,
  cancelHref,
  onSubmit,
}: HandoverFormProps) {
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [taskName, setTaskName] = useState(initial?.taskName ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Handover["priority"]>(
    initial?.priority ?? "보통",
  );
  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    initial?.schedules?.length ? initial.schedules : [{ cycle: "상시", description: "" }],
  );
  const [checklist, setChecklist] = useState<string[]>(
    initial?.checklist?.length ? initial.checklist : [""],
  );
  const [systems, setSystems] = useState<string[]>(initial?.systems ?? []);
  const [systemInput, setSystemInput] = useState("");
  const [laws, setLaws] = useState(initial?.laws ?? "");
  const [cautions, setCautions] = useState(initial?.cautions ?? "");
  const [knowhow, setKnowhow] = useState(initial?.knowhow ?? "");
  const [attachments, setAttachments] = useState<string[]>(
    initial?.attachments?.length ? initial.attachments : [""],
  );
  const [uploading, setUploading] = useState(false);
  const [editorName, setEditorName] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState("");

  // 관련 업무위키
  const [relatedIds, setRelatedIds] = useState<string[]>(initial?.relatedIds ?? []);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [relatedResults, setRelatedResults] = useState<Handover[]>([]);
  const [relatedItems, setRelatedItems] = useState<Handover[]>([]);

  // 템플릿
  const [templates, setTemplates] = useState<HandoverTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setTemplates(templateStore.list());
  }, []);

  // 관련 업무위키 ID → 실제 항목 불러오기
  useEffect(() => {
    if (relatedIds.length === 0) { setRelatedItems([]); return; }
    repository.getByIds(relatedIds).then(setRelatedItems);
  }, [relatedIds]);

  // 관련 업무위키 검색
  useEffect(() => {
    const q = relatedSearch.trim();
    if (!q) { setRelatedResults([]); return; }
    const timer = setTimeout(() => {
      repository.search(q).then((results) =>
        setRelatedResults(results.filter((r) => r.id !== initial?.id && !relatedIds.includes(r.id)).slice(0, 5)),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [relatedSearch, relatedIds, initial?.id]);

  // ── Schedules ──────────────────────────────────────────────
  function addSchedule() {
    setSchedules((prev) => [...prev, { cycle: "상시", description: "" }]);
  }
  function removeSchedule(i: number) {
    setSchedules((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateScheduleCycle(i: number, cycle: Cycle) {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, cycle } : s)),
    );
  }
  function updateScheduleDesc(i: number, desc: string) {
    setSchedules((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, description: desc } : s)),
    );
  }

  // ── Checklist ──────────────────────────────────────────────
  function addCheckItem() {
    setChecklist((prev) => [...prev, ""]);
  }
  function removeCheckItem(i: number) {
    setChecklist((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateCheckItem(i: number, v: string) {
    setChecklist((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  }

  // ── Systems ────────────────────────────────────────────────
  function togglePreset(s: string) {
    setSystems((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }
  function addCustomSystem() {
    const v = systemInput.trim();
    if (v && !systems.includes(v)) setSystems((prev) => [...prev, v]);
    setSystemInput("");
  }
  function removeSystem(s: string) {
    setSystems((prev) => prev.filter((x) => x !== s));
  }

  // ── Attachments ────────────────────────────────────────────
  function addAttachment() {
    setAttachments((prev) => [...prev, ""]);
  }
  function removeAttachment(i: number) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateAttachment(i: number, v: string) {
    setAttachments((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  }
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (!upErr) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setAttachments((prev) => [...prev.filter((a) => a.trim()), data.publicUrl]);
    }
    setUploading(false);
    e.target.value = "";
  }

  // ── Related ────────────────────────────────────────────────
  function addRelated(item: Handover) {
    setRelatedIds((prev) => [...prev, item.id]);
    setRelatedSearch("");
    setRelatedResults([]);
  }
  function removeRelated(id: string) {
    setRelatedIds((prev) => prev.filter((x) => x !== id));
  }

  // ── Templates ──────────────────────────────────────────────
  function saveTemplate() {
    const name = templateName.trim();
    if (!name) return;
    templateStore.create(name, {
      department, taskName, description, priority,
      schedules: schedules.filter((s) => s.description.trim()),
      checklist: checklist.filter(Boolean),
      systems, laws, cautions, knowhow,
      attachments: attachments.filter(Boolean),
      relatedIds,
      status: "active",
    });
    setTemplates(templateStore.list());
    setTemplateName("");
  }

  function loadTemplate(tpl: HandoverTemplate) {
    const d = tpl.data;
    if (d.department) setDepartment(d.department);
    if (d.taskName) setTaskName(d.taskName);
    if (d.description !== undefined) setDescription(d.description);
    if (d.priority) setPriority(d.priority);
    if (d.schedules?.length) setSchedules(d.schedules);
    if (d.checklist?.length) setChecklist(d.checklist);
    if (d.systems?.length) setSystems(d.systems);
    if (d.laws !== undefined) setLaws(d.laws);
    if (d.cautions !== undefined) setCautions(d.cautions);
    if (d.knowhow !== undefined) setKnowhow(d.knowhow);
    if (d.attachments?.length) setAttachments(d.attachments);
    setShowTemplates(false);
  }

  function deleteTemplate(id: string) {
    templateStore.remove(id);
    setTemplates(templateStore.list());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!department) { setError("부서명을 선택해 주세요."); return; }
    if (!taskName.trim()) { setError("업무명을 입력해 주세요."); return; }
    if (schedules.some((s) => !s.description.trim())) {
      setError("업무 일정의 내용을 모두 입력해 주세요."); return;
    }
    setError("");
    onSubmit(
      {
        department,
        taskName: taskName.trim(),
        description: description.trim(),
        priority,
        schedules: schedules.filter((s) => s.description.trim()),
        checklist: checklist.filter((s) => s.trim()),
        systems,
        laws: laws.trim(),
        cautions: cautions.trim(),
        knowhow: knowhow.trim(),
        attachments: attachments.filter((s) => s.trim()),
        relatedIds,
        status: "active",
      },
      editorName.trim() || "익명",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── 1단계: 필수 입력 ── */}

      {/* 부서명 + 업무명 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="department" className={labelBase}>
            부서명 <span className="text-rust">*</span>
          </label>
          <div className="relative">
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={`${fieldBase} appearance-none pr-10 ${department ? "text-ink" : "text-graphite"}`}
            >
              <option value="">부서를 선택하세요</option>
              {DEPARTMENT_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-graphite">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="taskName" className={labelBase}>
            업무명 <span className="text-rust">*</span>
          </label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="예: 예산 편성 및 집행 관리"
            className={fieldBase}
          />
        </div>
      </div>

      {/* 중요도 — 이모지 버튼 */}
      <div>
        <span className={labelBase}>중요도</span>
        <div className="flex gap-3">
          {([
            { value: "높음", emoji: "🔴" },
            { value: "보통", emoji: "🟡" },
            { value: "낮음", emoji: "🟢" },
          ] as const).map(({ value, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPriority(value)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-[14px] border py-3 text-[15px] font-[450] transition-colors",
                priority === value
                  ? "border-ink bg-ink text-pure-white"
                  : "border-dove bg-pure-white text-ash hover:border-ink",
              ].join(" ")}
            >
              <span>{emoji}</span>
              <span>{value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 업무 설명 */}
      <div>
        <label htmlFor="description" className={labelBase}>
          업무 설명 <span className="text-rust">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="업무의 목적, 전체 흐름, 범위를 적어주세요."
          className={`${fieldBase} resize-y leading-[1.6]`}
        />
      </div>

      {/* ── 더 입력하기 토글 ── */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-dove/50" />
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="flex items-center gap-2 rounded-pill border border-dove bg-pure-white px-5 py-2 text-[14px] font-[450] text-graphite shadow-sm transition-colors hover:border-ink hover:text-ink"
        >
          {showOptional ? "접기 ▲" : "더 입력하기 ▼"}
        </button>
        <div className="h-px flex-1 bg-dove/50" />
      </div>

      {/* ── 2단계: 선택 입력 ── */}
      {showOptional && (
        <div className="space-y-8">

          {/* 업무 일정 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelBase + " mb-0"}>업무 일정</span>
              <button type="button" onClick={addSchedule} className="text-[13px] font-[450] text-ink hover:text-ash">
                + 일정 추가
              </button>
            </div>
            <div className="space-y-3">
              {schedules.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative w-[120px] shrink-0">
                    <select
                      value={s.cycle}
                      onChange={(e) => updateScheduleCycle(i, e.target.value as Cycle)}
                      className={`${fieldBase} appearance-none py-3 pr-8`}
                    >
                      {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-graphite">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={s.description}
                    onChange={(e) => updateScheduleDesc(i, e.target.value)}
                    placeholder="예: 분기별 집행률 점검 및 부서 피드백"
                    className={`${fieldBase} flex-1`}
                  />
                  {schedules.length > 1 && (
                    <button type="button" onClick={() => removeSchedule(i)} className="shrink-0 text-graphite hover:text-rust" aria-label="일정 삭제">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 주의사항 */}
          <div>
            <label htmlFor="cautions" className={labelBase}>
              주의사항 <span className="text-[13px] font-normal text-graphite">놓치면 안 되는 것들</span>
            </label>
            <textarea id="cautions" value={cautions} onChange={(e) => setCautions(e.target.value)} rows={3}
              placeholder="기한, 자주 발생하는 실수, 반드시 확인할 사항 등"
              className={`${fieldBase} resize-y leading-[1.6]`} />
          </div>

          {/* 전임자 노하우 */}
          <div>
            <label htmlFor="knowhow" className={labelBase}>
              전임자 노하우 <span className="text-[13px] font-normal text-graphite">자유 메모</span>
            </label>
            <textarea id="knowhow" value={knowhow} onChange={(e) => setKnowhow(e.target.value)} rows={4}
              placeholder="문서에는 없지만 알아두면 좋은 요령, 담당자 연락 팁 등"
              className={`${fieldBase} resize-y leading-[1.6]`} />
          </div>

          {/* 업무 체크리스트 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelBase + " mb-0"}>업무 체크리스트</span>
              <button type="button" onClick={addCheckItem} className="text-[13px] font-[450] text-ink hover:text-ash">+ 항목 추가</button>
            </div>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="shrink-0 text-graphite">☐</span>
                  <input type="text" value={item} onChange={(e) => updateCheckItem(i, e.target.value)}
                    placeholder="예: 행복e음 권한 이관 확인" className={`${fieldBase} flex-1`} />
                  {checklist.length > 1 && (
                    <button type="button" onClick={() => removeCheckItem(i)} className="shrink-0 text-graphite hover:text-rust" aria-label="항목 삭제">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 관련 시스템 */}
          <div>
            <span className={labelBase}>관련 시스템</span>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_PRESETS.map((s) => (
                <button key={s} type="button" onClick={() => togglePreset(s)} aria-pressed={systems.includes(s)}
                  className={["rounded-pill border px-3 py-1.5 text-[13px] tracking-[-0.01em] transition-colors",
                    systems.includes(s) ? "border-ink bg-ink text-pure-white" : "border-dove bg-pure-white text-ash hover:border-ink"].join(" ")}>
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input type="text" value={systemInput} onChange={(e) => setSystemInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSystem(); } }}
                placeholder="직접 입력 후 Enter" className={`${fieldBase} flex-1`} />
              <button type="button" onClick={addCustomSystem} className="shrink-0 rounded-input border border-dove px-4 py-3 text-[14px] text-ink hover:border-ink">추가</button>
            </div>
            {systems.filter((s) => !SYSTEM_PRESETS.includes(s as typeof SYSTEM_PRESETS[number])).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {systems.filter((s) => !SYSTEM_PRESETS.includes(s as typeof SYSTEM_PRESETS[number])).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-pill border border-dove bg-fog px-3 py-1 text-[13px] text-ash">
                    {s}<button type="button" onClick={() => removeSystem(s)} className="text-graphite hover:text-rust">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 관련 법령·지침 */}
          <div>
            <label htmlFor="laws" className={labelBase}>관련 법령·지침</label>
            <textarea id="laws" value={laws} onChange={(e) => setLaws(e.target.value)} rows={2}
              placeholder="예: 지방재정법 제36조, 시흥시 ○○ 조례"
              className={`${fieldBase} resize-y leading-[1.6]`} />
          </div>

          {/* 첨부 파일 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className={labelBase + " mb-0"}>첨부 파일</span>
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer text-[13px] font-[450] ${uploading ? "text-graphite" : "text-ink hover:text-ash"}`}>
                  {uploading ? "업로드 중…" : "파일 업로드"}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.txt,.zip,.png,.jpg,.jpeg" />
                </label>
                <button type="button" onClick={addAttachment} className="text-[13px] font-[450] text-graphite hover:text-ink">경로 직접 입력</button>
              </div>
            </div>
            <div className="space-y-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  {a.startsWith("https://") ? (
                    <div className="flex flex-1 items-center gap-2 rounded-input border border-dove bg-fog px-4 py-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-graphite"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                      <span className="flex-1 truncate text-[13px] text-ash">{decodeURIComponent(a.split("/").pop() ?? a)}</span>
                    </div>
                  ) : (
                    <input type="text" value={a} onChange={(e) => updateAttachment(i, e.target.value)}
                      placeholder="예: 공유드라이브/예산/2027본예산" className={`${fieldBase} flex-1`} />
                  )}
                  <button type="button" onClick={() => removeAttachment(i)} className="shrink-0 text-graphite hover:text-rust" aria-label="삭제">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[12px] text-graphite">PDF, Word, Excel, HWP, 이미지 등 · 최대 10MB</p>
          </div>

          {/* 관련 업무위키 연결 */}
          <div>
            <span className={labelBase}>관련 업무위키 연결</span>
            {relatedItems.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {relatedItems.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 rounded-pill border border-dove bg-fog px-3 py-1.5 text-[13px] text-ash">
                    <span className="text-[11px] text-graphite">{r.department}</span>
                    {r.taskName}
                    <button type="button" onClick={() => removeRelated(r.id)} className="text-graphite hover:text-rust">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={relatedSearch}
                onChange={(e) => setRelatedSearch(e.target.value)}
                placeholder="업무명으로 검색해서 연결"
                className={fieldBase}
              />
              {relatedResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-[14px] border border-dove bg-pure-white shadow-card">
                  {relatedResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => addRelated(r)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] hover:bg-fog first:rounded-t-[14px] last:rounded-b-[14px]"
                    >
                      <span className="text-[12px] text-graphite">{r.department}</span>
                      <span className="text-ink">{r.taskName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 템플릿 */}
          <div className="rounded-[14px] border border-dove/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-[450] text-graphite">템플릿</span>
              <button
                type="button"
                onClick={() => setShowTemplates((v) => !v)}
                className="text-[13px] text-ink hover:text-ash"
              >
                {showTemplates ? "접기" : `불러오기 (${templates.length})`}
              </button>
            </div>
            {showTemplates && (
              <div className="mt-3">
                {templates.length === 0 ? (
                  <p className="text-[13px] text-graphite">저장된 템플릿이 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="flex items-center justify-between rounded-[10px] bg-fog px-3 py-2">
                        <button type="button" onClick={() => loadTemplate(tpl)} className="text-[14px] text-ink hover:underline">
                          {tpl.name}
                        </button>
                        <button type="button" onClick={() => deleteTemplate(tpl.id)} className="text-[13px] text-graphite hover:text-rust">삭제</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="템플릿 이름 입력 후 저장"
                className={`${fieldBase} flex-1 py-2 text-[13px]`}
              />
              <button
                type="button"
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                className="shrink-0 rounded-input border border-dove px-4 py-2 text-[13px] text-ink hover:border-ink disabled:opacity-40"
              >
                저장
              </button>
            </div>
          </div>

          {/* 작성자명 */}
          <div>
            <label htmlFor="editorName" className={labelBase}>
              작성자명 <span className="text-[13px] font-normal text-graphite">이력 기록용, 미입력 시 익명</span>
            </label>
            <input id="editorName" type="text" value={editorName} onChange={(e) => setEditorName(e.target.value)}
              placeholder="홍길동" className={`${fieldBase} max-w-[280px]`} />
          </div>

        </div>
      )}

      {error && <p className="text-[14px] text-rust" role="alert">{error}</p>}

      <div className="flex items-center gap-5 pt-2">
        <button type="submit"
          className="rounded-pill bg-ink px-6 py-3 text-[15px] font-[450] tracking-[-0.009em] text-pure-white transition-opacity hover:opacity-90">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="text-[15px] font-[450] tracking-[-0.009em] text-ink hover:text-ash">취소</Link>
      </div>
    </form>
  );
}
