"use client";
import { useState } from "react";
import { Landmark, Send } from "lucide-react";
import { submitTransfer } from "@/lib/hooks";
import type { Transfer } from "@/lib/types";

// Simulated bank app. Mom just sends money as she was told to: the bank screens it through Scam Shield automatically.
const PRESETS: { label: string; t: Transfer }[] = [
  { label: "검찰이 시킨 '안전계좌' 이체", t: { amount: 30_000_000, payee_name: "금융보안 안전계좌", payee_account: "352-1234-5678-90", new_payee: true, memo: "수사관 지시 자산보호" } },
  { label: "아들에게 용돈 보내기", t: { amount: 200_000, payee_name: "김준 (아들)", payee_account: "110-555-123456", new_payee: false, memo: "용돈" } },
];

export function BankDemo({ onDone }: { onDone: (id?: string) => void }) {
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = PRESETS[i].t;

  async function send() {
    setBusy(true);
    setError(null);
    const r = await submitTransfer(t);
    setBusy(false);
    if (r.error) setError("이체 확인 중 문제가 생겼어요. 다시 시도해 주세요.");
    onDone(r.check?.id);
  }

  return (
    <section className="overflow-hidden rounded-3xl bg-surface shadow-sm">
      <div className="flex items-center gap-2 bg-[#1e4fd8] px-5 py-3 text-white">
        <Landmark className="size-5" />
        <p className="font-bold">내 은행 앱</p>
        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs">시뮬레이션 · Scam Shield 연동</span>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button key={p.label} onClick={() => setI(idx)}
              className={`rounded-full border px-3 py-1 text-sm ${i === idx ? "border-navy bg-navy text-white" : "border-line text-muted"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-base">
          <dt className="text-muted">받는 분</dt><dd className="font-semibold">{t.payee_name}{t.new_payee && <span className="ml-1 text-sm text-warn">(처음 보내는 계좌)</span>}</dd>
          <dt className="text-muted">계좌</dt><dd className="font-mono">{t.payee_account}</dd>
          <dt className="text-muted">메모</dt><dd>{t.memo || "—"}</dd>
        </dl>
        <p className="mt-3 text-3xl font-bold">{t.amount.toLocaleString("ko-KR")}원</p>
        <button onClick={send} disabled={busy}
          className="mt-4 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-[#1e4fd8] text-2xl font-bold text-white disabled:opacity-60">
          <Send className="size-6" /> {busy ? "은행이 확인 중…" : "이체하기"}
        </button>
        <p className="mt-2 text-sm text-muted">엄마는 아무것도 판단할 필요가 없어요. 은행이 이체 전에 Scam Shield로 자동 확인합니다.</p>
        {error && <p className="mt-2 text-danger" role="alert">{error}</p>}
      </div>
    </section>
  );
}
