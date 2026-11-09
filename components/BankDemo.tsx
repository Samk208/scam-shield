"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Landmark, PenLine, Send, ShieldCheck } from "lucide-react";
import { submitTransfer } from "@/lib/hooks";
import type { Transfer } from "@/lib/types";

// Simulated bank app. Mom just sends money as she was told to: the bank screens it through Scam Shield automatically.
const PRESETS: {
  label: string;
  tag: string;
  isDangerPreset: boolean;
  t: Transfer;
}[] = [
  {
    label: "검찰이 시킨 '안전계좌' 이체",
    tag: "사기 시나리오",
    isDangerPreset: true,
    t: {
      amount: 30_000_000,
      payee_name: "금융보안 안전계좌",
      payee_account: "352-1234-5678-90",
      new_payee: true,
      memo: "수사관 지시 자산보호",
    },
  },
  {
    label: "아들에게 용돈 보내기",
    tag: "정상 이체",
    isDangerPreset: false,
    t: {
      amount: 200_000,
      payee_name: "김준 (아들)",
      payee_account: "110-555-123456",
      new_payee: false,
      memo: "용돈",
    },
  },
];

const PROGRESS_STEPS = [
  "1/4 · 은행이 이체 정보를 Scam Shield로 전달 중…",
  "2/4 · 수취 계좌·금액·메모 위험 신호 검사 중…",
  "3/4 · AI 에이전트가 보이스피싱 패턴 분석 중…",
  "4/4 · 보호 정책 적용 및 가족 알림 확인 중…",
];

export function BankDemo({
  onDone,
}: {
  onDone: (id?: string, createdCheck?: import("@/lib/types").Check) => void;
}) {
  const [i, setI] = useState<number>(0); // 0, 1 = presets, 2 = custom
  const [customTransfer, setCustomTransfer] = useState<Transfer>({
    amount: 15_000_000,
    payee_name: "금감원 피해구제팀",
    payee_account: "301-9988-7766-11",
    new_payee: true,
    memo: "범죄연루 계좌 안전보호",
  });
  const [busy, setBusy] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isCustom = i === 2;
  const t = isCustom ? customTransfer : PRESETS[i].t;

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [busy]);

  async function send() {
    setStepIdx(0);
    setBusy(true);
    setError(null);
    const r = await submitTransfer(t);
    setBusy(false);
    if (r.error) setError("이체 확인 중 문제가 생겼어요. 다시 시도해 주세요.");
    onDone(r.check?.id, r.check);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-2 bg-[#1e4fd8] px-5 py-3.5 text-white">
        <Landmark className="size-5 shrink-0" aria-hidden />
        <p className="font-bold">내 은행 앱 (자동 보호 시뮬레이션)</p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
          <ShieldCheck className="size-3.5" aria-hidden /> Scam Shield 연동
        </span>
      </div>

      <div className="p-5">
        <p className="mb-2.5 text-xs font-semibold text-muted">
          시나리오 선택 (엄마가 은행 앱에서 이체할 때)
        </p>
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="group"
          aria-label="이체 시나리오"
        >
          {PRESETS.map((p, idx) => {
            const active = i === idx;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setI(idx)}
                disabled={busy}
                aria-pressed={active}
                className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border-2 px-3.5 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "border-navy bg-navy text-white shadow-xs"
                    : "border-line bg-bg/60 text-ink hover:border-navy/50"
                }`}
              >
                <span className="truncate">{p.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : p.isDangerPreset
                        ? "bg-danger-bg text-danger-ink"
                        : "bg-safe-bg text-safe"
                  }`}
                >
                  {p.tag}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setI(2)}
            disabled={busy}
            aria-pressed={isCustom}
            className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border-2 px-3.5 py-2 text-left text-sm font-semibold transition ${
              isCustom
                ? "border-navy bg-navy text-white shadow-xs"
                : "border-line bg-bg/60 text-ink hover:border-navy/50"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <PenLine className="size-4 shrink-0" aria-hidden />
              직접 입력 실험
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isCustom ? "bg-white/20 text-white" : "bg-bg text-muted"
              }`}
            >
              커스텀
            </span>
          </button>
        </div>

        {isCustom ? (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-bg/70 p-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-payee">
                받는 분 이름
              </label>
              <input
                id="custom-payee"
                type="text"
                value={customTransfer.payee_name}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, payee_name: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-account">
                계좌번호
              </label>
              <input
                id="custom-account"
                type="text"
                value={customTransfer.payee_account}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, payee_account: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm font-semibold tabular-nums text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-amount">
                보낼 금액 (원)
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
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm font-bold tabular-nums text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted" htmlFor="custom-memo">
                이체 메모
              </label>
              <input
                id="custom-memo"
                type="text"
                value={customTransfer.memo ?? ""}
                onChange={(e) =>
                  setCustomTransfer((prev) => ({ ...prev, memo: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-navy"
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
                <span>처음 보내는 수취 계좌 (신규 수취인 위험 신호)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-line bg-bg/70 p-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
              <dt className="text-muted">받는 분</dt>
              <dd className="flex flex-wrap items-center gap-1.5 font-bold text-ink">
                <span>{t.payee_name}</span>
                {t.new_payee ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warn-bg px-2.5 py-0.5 text-xs font-semibold text-warn ring-1 ring-warn/30">
                    <AlertTriangle className="size-3" aria-hidden /> 처음 보내는 계좌
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-safe-bg px-2.5 py-0.5 text-xs font-semibold text-safe">
                    <CheckCircle2 className="size-3" aria-hidden /> 자주 쓰는 가족 계좌
                  </span>
                )}
              </dd>
              <dt className="text-muted">계좌번호</dt>
              <dd className="font-mono font-semibold tabular-nums text-ink">{t.payee_account}</dd>
              <dt className="text-muted">이체 메모</dt>
              <dd className="font-medium text-ink">{t.memo || "—"}</dd>
            </dl>

            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs font-medium text-muted">보낼 금액</p>
              <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-ink">
                {t.amount.toLocaleString("ko-KR")}
                <span className="ml-0.5 font-sans text-2xl font-bold">원</span>
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="relative mt-4 flex min-h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#1e4fd8] text-2xl font-bold text-white shadow-md hover:bg-[#1943b8] active:scale-[.99] disabled:opacity-70"
        >
          {busy && <span className="ss-scan absolute inset-y-0 left-0 w-1/3 bg-white/25" aria-hidden />}
          <Send className="size-6 shrink-0" aria-hidden />
          <span>{busy ? "은행이 안전 확인 중…" : "이체하기"}</span>
        </button>

        {busy ? (
          <div
            className="mt-3 rounded-2xl border border-[#1e4fd8]/25 bg-[#1e4fd8]/5 p-3 text-sm font-medium text-navy"
            role="status"
          >
            <p className="animate-pulse">{PROGRESS_STEPS[stepIdx]}</p>
          </div>
        ) : (
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            엄마는 사기인지 직접 판단할 필요가 없어요. 이체 버튼을 누르면 은행이 먼저 Scam Shield AI로 안전을 확인합니다.
          </p>
        )}

        {error && (
          <p className="mt-2 rounded-xl bg-danger-bg p-3 text-base font-medium text-danger-ink" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
