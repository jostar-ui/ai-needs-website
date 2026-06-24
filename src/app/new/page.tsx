"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import HandoverForm from "@/components/HandoverForm";
import { useHandovers } from "@/lib/useHandovers";
import type { HandoverInput } from "@/lib/types";

export default function NewHandoverPage() {
  const router = useRouter();
  const { create } = useHandovers();

  async function handleSubmit(input: HandoverInput, editorName: string) {
    const created = await create(input, editorName);
    router.push(`/handover/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[14px] text-graphite hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        목록으로
      </Link>

      <h1 className="font-signifier text-[40px] leading-[1.1] tracking-[-0.8px] text-ink">
        새 인수인계 등록
      </h1>
      <p className="mb-10 mt-3 text-[16px] leading-[1.5] text-ash">
        후임자가 바로 이어받을 수 있도록 업무의 핵심을 남겨주세요.
      </p>

      <HandoverForm
        submitLabel="등록하기"
        cancelHref="/"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
