"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import HandoverForm from "@/components/HandoverForm";
import { useHandover } from "@/lib/useHandovers";
import { repository } from "@/lib/repository";
import type { HandoverInput } from "@/lib/types";

export default function EditHandoverPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { item, loading } = useHandover(id);

  async function handleSubmit(input: HandoverInput, editorName: string) {
    await repository.update(id, input, editorName);
    router.push(`/handover/${id}`);
  }

  if (loading) {
    return <p className="py-24 text-center text-[15px] text-graphite">불러오는 중…</p>;
  }
  if (!item) {
    return (
      <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-8">
        <p className="text-center text-[15px] text-graphite">존재하지 않는 인수인계입니다.</p>
        <div className="mt-6 text-center">
          <Link href="/" className="text-[15px] font-[450] text-ink hover:text-ash">목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href={`/handover/${id}`}
        className="mb-8 inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        상세로
      </Link>
      <h1 className="mb-10 font-signifier text-[40px] leading-[1.1] tracking-[-0.8px] text-ink">
        인수인계 수정
      </h1>
      <HandoverForm
        initial={item}
        submitLabel="저장하기"
        cancelHref={`/handover/${id}`}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
