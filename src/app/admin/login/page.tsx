"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fog px-5">
      <div className="w-full max-w-sm rounded-card bg-pure-white p-8 shadow-card">
        <h1 className="mb-1 font-signifier text-[32px] leading-[1.15] tracking-[-0.6px] text-ink">
          관리자
        </h1>
        <p className="mb-8 text-[14px] text-graphite">접근하려면 비밀번호를 입력하세요.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-[14px] font-[450] text-ink">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
              className="w-full rounded-input border border-dove bg-pure-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink placeholder:text-graphite"
            />
          </div>

          {error && (
            <p className="text-[14px] text-rust" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-pill bg-ink py-3 text-[15px] font-[450] text-pure-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "확인 중…" : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
