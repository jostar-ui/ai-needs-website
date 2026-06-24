interface DetailFieldProps {
  label: string;
  value: string;
}

// 상세 항목 행: 라벨(Graphite) + 값(Ink). 빈 값이면 렌더하지 않는다.
export default function DetailField({ label, value }: DetailFieldProps) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return (
    <div className="border-t border-dove/50 py-5 first:border-t-0">
      <dt className="mb-2 text-[13px] font-[450] tracking-[-0.01em] text-graphite">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap text-[16px] leading-[1.6] text-ink">
        {trimmed}
      </dd>
    </div>
  );
}
