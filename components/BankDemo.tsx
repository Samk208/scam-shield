"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Landmark, PenLine, Send, ShieldCheck } from "lucide-react";
import { submitTransfer } from "@/lib/hooks";
import type { Lang, Transfer } from "@/lib/types";

// Simulated bank app. Mom just sends money as she was told to: the bank screens it through Scam Shield automatically.
const PRESETS: {
  labelKo: string;
  labelEn: string;
  tagKo: string;
  tagEn: string;
  isDangerPreset: boolean;
  t: Transfer;
}[] = [
  {
    labelKo: "검찰 사칭 '안전계좌' (280만)",
    labelEn: "Fake 'Safe Account' (₩2.8M)",
    tagKo: "사기",
    tagEn: "Scam",
    isDangerPreset: true,
    t: {
      amount: 2_800_000,
      payee_name: "금융보안 안전계좌",
      payee_account: "352-1234-5678-90",
      new_payee: true,
      memo: "수사관 지시 자산보호",
    },
  },
  {
    labelKo: "아들 용돈 송금 (15만)",
    labelEn: "Son's Allowance (₩150K)",
    tagKo: "정상",
    tagEn: "Safe",
    isDangerPreset: false,
    t: {
      amount: 150_000,
      payee_name: "김준 (아들)",
      payee_account: "110-555-123456",
      new_payee: false,
      memo: "용돈",
    },
  },
];

const PROGRESS_STEPS: Record<Lang, string[]> = {
  ko: [
    "1/4 · 은행이 이체 정보를 Scam Shield로 전달 중…",
    "2/4 · 수취 계좌·금액·메모 위험 신호 검사 중…",
    "3/4 · AI 에이전트가 보이스피싱 패턴 분석 중…",
    "4/4 · 보호 정책 적용 및 자녀 알림 전송 중…",
  ],
  en: [
    "1/4 · Forwarding transfer payload to Scam Shield…",
    "2/4 · Scanning payee, amount & memo risk signals…",
    "3/4 · Running bilingual AI scam classification…",
    "4/4 · Applying deterministic policy floor & alerting guardian…",
  ],
};

export function BankDemo({
  onDone,
  lang = "ko",
}: {
  onDone: (id?: string, createdCheck?: import("@/lib/types").Check) => void;
  lang?: Lang;
}) {
  const [i, setI] = useState<number>(0); // 0, 1 = presets, 2 = custom
  const [customTransfer, setCustomTransfer] = useState<Transfer>({
    amount: 980_000,
    payee_name: "수리점 김철수 (액정수리)",
    payee_account: "301-9988-7766-11",
    new_payee: true,
    memo: "자녀 폰 고장 긴급 수리비",
  });
  const [busy, setBusy] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isCustom = i === 2;
  const t = isCustom ? customTransfer : PRESETS[i].t;

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev < PROGRESS_STEPS[lang].length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [busy, lang]);

  async function send() {
    setStepIdx(0);
    setBusy(true);
    setError(null);
    const r = await submitTransfer(t);
    setBusy(false);
    if (r.error)
      setError(
        lang === "ko"
          ? "이체 확인 중 문제가 생겼어요. 다시 시도해 주세요."
          : "Transfer check failed. Please try again.",
      );
    onDone(r.check?.id, r.check);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-2 bg-[#1e4fd8] px-5 py-3.5 text-white">
        <Landmark className="size-5 shrink-0" aria-hidden />
        <p className="font-bold">
          {lang === "ko" ? "내 은행 앱 (자동 보호 시뮬레이션)" : "Mom's Bank App (Auto-Screened)"}
        </p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
          <ShieldCheck className="size-3.5" aria-hidden />{" "}
          {lang === "ko" ? "Scam Shield 연동" : "Scam Shield Active"}
        </span>
      </div>

      <div className="p-5">
        <p className="mb-2 text-xs font-semibold text-muted">
          {lang === "ko" ? "이체 시나리오 선택" : "Select Transfer Scenario"}
        </p>
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="group"
          aria-label={lang === "ko" ? "이체 시나리오" : "Transfer scenarios"}
        >
          {PRESETS.map((p, idx) => {
            const active = i === idx;
            const label = lang === "ko" ? p.labelKo : p.labelEn;
            const tag = lang === "ko" ? p.tagKo : p.tagEn;
            return (
              <button
                key={p.labelEn}
                type="button"
                onClick={() => setI(idx)}
                disabled={busy}
                aria-pressed={active}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border-2 px-3 py-2 text-left text-xs font-bold transition ${
                  active
                    ? "border-navy bg-navy text-white shadow-xs"
                    : "border-line bg-bg/60 text-ink hover:border-navy/50"
                }`}
              >
                <span className="truncate">{label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : p.isDangerPreset
                        ? "bg-danger-bg text-danger-ink"
                        : "bg-safe-bg text-safe"
                  }`}
                >
                  {tag}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setI(2)}
            disabled={busy}
            aria-pressed={isCustom}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border-2 px-3 py-2 text-left text-xs font-bold transition ${
              isCustom
                ? "border-navy bg-navy text-white shadow-xs"
                : "border-line bg-bg/60 text-ink hover:border-navy/50"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <PenLine className="size-3.5 shrink-0" aria-hidden />
              {lang === "ko" ? "직접 입력 (98만)" : "Custom (₩980K)"}
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isCustom ? "bg-white/20 text-white" : "bg-bg text-muted"
              }`}
            >
              {lang === "ko" ? "편집" : "Edit"}
            </span>
          </button>
        </div>

        {isCustom ? (
          <div className="mt-3.5 grid grid-cols-1 gap-2.5 rounded-2xl border border-line bg-bg/70 p-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-payee">
                {lang === "ko" ? "받는 분" : "Recipient Name"}
              </label>
              <input
                id="custom-payee"
                type="text"
                value={customTransfer.payee_name}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, payee_name: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-sm font-bold text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-account">
                {lang === "ko" ? "계좌번호" : "Account Number"}
              </label>
              <input
                id="custom-account"
                type="text"
                value={customTransfer.payee_account}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, payee_account: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-amount">
                {lang === "ko" ? "보낼 금액 (원)" : "Amount (KRW)"}
              </label>
              <input
                id="custom-amount"
                type="number"
                min={1000}
                step={100000}
                value={customTransfer.amount}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({
                    ...prev,
                    amount: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-memo">
                {lang === "ko" ? "이체 메모" : "Transfer Memo"}
              </label>
              <input
                id="custom-memo"
                type="text"
                value={customTransfer.memo ?? ""}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, memo: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-navy"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={customTransfer.new_payee}
                  onChange={(e) =>
                    setCustomTransfer((prev) => ({ ...prev, new_payee: e.target.checked }))
                  }
                  className="size-4 accent-navy"
                />
                <span>
                  {lang === "ko"
                    ? "처음 보내는 수취 계좌 (신규 수취인 위험 신호)"
                    : "First-time recipient account (new payee risk flag)"}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 rounded-2xl border border-line bg-bg/70 p-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">{lang === "ko" ? "받는 분" : "Recipient"}</dt>
              <dd className="flex flex-wrap items-center gap-1.5 font-bold text-ink">
                <span>{t.payee_name}</span>
                {t.new_payee ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-2 py-0.5 text-[11px] font-semibold text-warn ring-1 ring-warn/30">
                    <AlertTriangle className="size-3" aria-hidden />{" "}
                    {lang === "ko" ? "신규 계좌" : "New Payee"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-safe-bg px-2 py-0.5 text-[11px] font-semibold text-safe">
                    <CheckCircle2 className="size-3" aria-hidden />{" "}
                    {lang === "ko" ? "가족 계좌" : "Known Family"}
                  </span>
                )}
              </dd>
              <dt className="text-muted">{lang === "ko" ? "계좌번호" : "Account"}</dt>
              <dd className="font-mono font-semibold tabular-nums text-ink">{t.payee_account}</dd>
              <dt className="text-muted">{lang === "ko" ? "메모" : "Memo"}</dt>
              <dd className="font-medium text-ink">{t.memo || "—"}</dd>
            </dl>

            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-xs font-semibold text-muted">
                {lang === "ko" ? "이체 금액 (모바일 한도 내)" : "Transfer Amount"}
              </span>
              <p className="font-mono text-2xl font-extrabold tabular-nums tracking-tight text-ink sm:text-3xl">
                ₩{t.amount.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="relative mt-3.5 flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#1e4fd8] text-xl font-bold text-white shadow-md hover:bg-[#1943b8] active:scale-[.99] disabled:opacity-70"
        >
          {busy && <span className="ss-scan absolute inset-y-0 left-0 w-1/3 bg-white/25" aria-hidden />}
          <Send className="size-5 shrink-0" aria-hidden />
          <span>
            {busy
              ? lang === "ko"
                ? "은행이 안전 확인 중…"
                : "Bank screening transfer…"
              : lang === "ko"
                ? "이체하기 (실시간 검사)"
                : "Send Money (Run Live Check)"}
          </span>
        </button>

        {busy ? (
          <div
            className="mt-2.5 rounded-2xl border border-[#1e4fd8]/25 bg-[#1e4fd8]/5 p-2.5 text-xs font-medium text-navy"
            role="status"
          >
            <p className="animate-pulse">{PROGRESS_STEPS[lang][stepIdx]}</p>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            {lang === "ko"
              ? "이체 버튼을 누르면 출금 전 Scam Shield가 4.8초 만에 위험도를 자동 판별합니다."
              : "Tapping Send runs Scam Shield in 4.8s before a single won leaves the account."}
          </p>
        )}

        {error && (
          <p className="mt-2 rounded-xl bg-danger-bg p-2.5 text-sm font-medium text-danger-ink" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
