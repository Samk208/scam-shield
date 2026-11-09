"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Loader2,
  Lock,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Smartphone,
  ThumbsUp,
} from "lucide-react";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { CheckCard } from "@/components/CheckCard";
import { FamilyCard, StatsStrip } from "@/components/Dashboard";
import { decideCheck, triggerDemoReset, useFamilyChecks, useMe } from "@/lib/hooks";
import type { Decision, Lang } from "@/lib/types";

function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1175].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.3);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.3);
    });
    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 900);
  } catch {
    /* audio blocked until user interacts: fine */
  }
}

export default function GuardianPage() {
  const { me, family } = useMe();
  const { checks, loading } = useFamilyChecks(me?.family_id);
  const [lang, setLang] = useState<Lang>("en");
  const [busyState, setBusyState] = useState<{ id: string; decision: Decision } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parent = family.find((m) => m.role === "parent");
  const held = checks.filter((c) => c.status === "held");
  const others = checks.filter((c) => c.status !== "held");
  const heldIdsKey = held.map((c) => c.id).join(",");
  const seen = useRef<Set<string> | null>(null);

  // Chime only when a NEW held check arrives live (keyed by held check IDs, not array reference).
  useEffect(() => {
    if (loading) return;
    const ids = new Set(heldIdsKey ? heldIdsKey.split(",") : []);
    if (seen.current && [...ids].some((id) => !seen.current!.has(id))) {
      chime();
    }
    seen.current = ids;
  }, [heldIdsKey, loading]);

  async function decide(id: string, d: Decision) {
    setBusyState({ id, decision: d });
    setError(null);
    const r = await decideCheck(id, d);
    setBusyState(null);
    if (r.error) setError(r.error);
  }

  async function handleResetDemo() {
    setResetting(true);
    await triggerDemoReset();
    setResetting(false);
  }

  const parentName = parent?.display_name ?? (lang === "ko" ? "어머니" : "Mom");

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        me={me}
        lang={lang}
        onLangChange={setLang}
        subtitle={
          me
            ? lang === "ko"
              ? `${me.display_name} · ${parentName} 보호 관제 센터`
              : `${me.display_name} · protecting ${parentName}`
            : undefined
        }
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP FULL-WIDTH ALERT BANNER + STATS */}
        <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {held.length > 0 ? (
              <div
                className="ss-pop flex h-full flex-col justify-between gap-4 rounded-3xl bg-danger p-6 text-white shadow-md"
                role="alert"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                    <BellRing className="size-7" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-white/85">
                      {lang === "ko"
                        ? `긴급 보류 알림 (${held.length}건 대기 중)`
                        : `Urgent Hold Alert (${held.length} Pending Decision)`}
                    </p>
                    <h1 className="mt-1 text-xl font-extrabold leading-snug sm:text-2xl">
                      {held[0].transfer
                        ? lang === "ko"
                          ? `${parentName}님이 신규 계좌로 ₩${held[0].transfer.amount.toLocaleString("ko-KR")}원 이체를 시도했습니다.`
                          : `${parentName} is trying to send ₩${held[0].transfer.amount.toLocaleString("en-US")} to a new account.`
                        : lang === "ko"
                          ? `${parentName}님이 보이스피싱 의심 메시지를 접수했습니다.`
                          : `${parentName} forwarded a high-risk scam message.`}
                    </h1>
                    <p className="mt-1 text-sm text-white/90">
                      {lang === "ko"
                        ? "보호자(자녀)가 직접 확인하고 결정할 때까지 은행이 출금을 일시 정지했습니다."
                        : "Her bank automatically paused the transfer via Scam Shield until you block or release it below."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-safe-bg text-safe">
                    <ShieldCheck className="size-7" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-safe-bg px-2.5 py-0.5 text-xs font-bold text-safe">
                      {lang === "ko" ? "실시간 이상 없음" : "All Clear · Active Monitoring"}
                    </span>
                    <h1 className="mt-1.5 text-xl font-extrabold text-ink sm:text-2xl">
                      {lang === "ko"
                        ? "현재 보류 중인 위험 이체가 없습니다"
                        : "No transfers currently on hold"}
                    </h1>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {lang === "ko"
                        ? "부모님이 고액 이체를 시작하거나 의심 메시지를 보내면 AI가 먼저 보류하고 즉시 알려드립니다."
                        : "Her bank screens every high-risk transfer with Scam Shield. You'll be alerted the moment one looks suspicious."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    disabled={resetting}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-navy px-3.5 py-1.5 text-xs font-bold text-white hover:bg-navy-2 disabled:opacity-50"
                  >
                    <RotateCcw className={`size-3.5 ${resetting ? "animate-spin" : ""}`} aria-hidden />
                    <span>
                      {lang === "ko"
                        ? "긴급 보류 시나리오 다시 불러오기"
                        : "Restore Held Transfer Demo Scenario"}
                    </span>
                  </button>
                  <Link
                    href="/parent"
                    className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-line bg-bg px-3.5 py-1.5 text-xs font-bold text-ink hover:border-navy"
                  >
                    <Smartphone className="size-3.5" aria-hidden />
                    <span>
                      {lang === "ko" ? "부모님 화면에서 새 이체 보내기" : "Trigger New Transfer as Mom"}
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <StatsStrip checks={checks} lang={lang} />
          </div>
        </section>

        {error && (
          <p
            className="rounded-2xl bg-danger-bg p-4 text-sm font-semibold text-danger-ink"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* DESKTOP 12-COLUMN COMMAND CENTER (EVEN COLUMNS WITH ITEMS-STRETCH) */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT 7 COLUMNS: ACTIVE HELD TRANSFERS + FULL CHECK QUEUE */}
          <div className="flex h-full flex-col justify-between gap-5 lg:col-span-7">
            {loading ? (
              <div className="ss-skeleton h-96 rounded-3xl" aria-label="Loading checks" />
            ) : held.length > 0 ? (
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-lg font-extrabold text-ink">
                    {lang === "ko"
                      ? `즉시 결정이 필요한 보류 거래 (${held.length}건)`
                      : `Action Required: Held Transfers (${held.length})`}
                  </h2>
                  <span className="font-mono text-xs font-bold uppercase text-danger">
                    HUMAN GATE LOCKED
                  </span>
                </div>
                {held.map((c) => {
                  const isBusy = busyState?.id === c.id;
                  return (
                    <CheckCard key={c.id} check={c} lang={lang} hideHotlines>
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => decide(c.id, "block")}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-danger-ink px-4 text-sm font-bold text-white shadow-sm transition hover:bg-danger active:scale-[.99] disabled:opacity-50"
                        >
                          {isBusy && busyState?.decision === "block" ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <ShieldX className="size-4 shrink-0" aria-hidden />
                          )}
                          <span>
                            {lang === "ko" ? "이체 즉시 차단 (Block)" : "Block Transfer"}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => decide(c.id, "release")}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface px-4 text-sm font-bold text-ink transition hover:border-navy active:scale-[.99] disabled:opacity-50"
                        >
                          {isBusy && busyState?.decision === "release" ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <ThumbsUp className="size-4 shrink-0" aria-hidden />
                          )}
                          <span>
                            {lang === "ko" ? "안전 확인 · 보류 해제" : "Approve & Release"}
                          </span>
                        </button>
                        <a
                          href="tel:010-0000-0000"
                          className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-xs font-bold text-navy transition hover:border-navy hover:bg-bg sm:col-span-2"
                        >
                          <Phone className="size-3.5 shrink-0" aria-hidden />
                          <span>
                            {lang === "ko"
                              ? `${parentName}님께 바로 전화 확인하기`
                              : `Call ${parentName} to verify`}
                          </span>
                        </a>
                      </div>
                    </CheckCard>
                  );
                })}
              </div>
            ) : (
              others[0] && (
                <div className="flex h-full flex-col justify-between gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-base font-extrabold text-ink">
                      {lang === "ko" ? "가장 최근 처리된 거래" : "Most Recently Processed Check"}
                    </h2>
                  </div>
                  <CheckCard check={others[0]} lang={lang} hideHotlines />
                </div>
              )
            )}
          </div>

          {/* RIGHT 5 COLUMNS: FAMILY MESH + RECENT ACTIVITY + POLICY RULES */}
          <aside className="flex h-full flex-col justify-between gap-5 lg:col-span-5">
            <div className="flex flex-col gap-5">
              <FamilyCard family={family} held={held.length > 0} lang={lang} />

              {others.length > 0 && (
                <section className="rounded-3xl border border-line bg-surface p-5 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
                      {lang === "ko"
                        ? `최근 보호 기록 (${others.length}건)`
                        : `Resolved & Safe Activity (${others.length})`}
                    </h2>
                    <span className="text-xs text-muted">
                      {lang === "ko" ? "클릭 시 감사 로그" : "Click for audit log"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {others.map((c) => (
                      <CheckCard key={c.id} check={c} lang={lang} compact />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Policy & Compliance Card */}
            <section className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-5 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-navy">
                  <Lock className="size-5 shrink-0" aria-hidden />
                  <h2 className="text-base font-extrabold text-ink">
                    {lang === "ko"
                      ? "활성화된 결정적 보안 정책 (Policy Gate)"
                      : "Active Deterministic Policy Rules"}
                  </h2>
                </div>
                <ul className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-muted">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden />
                    <span>
                      <strong className="text-ink">
                        {lang === "ko" ? "결정적 위험 하한선:" : "Deterministic Floor:"}
                      </strong>{" "}
                      {lang === "ko"
                        ? "신규 계좌 + 90만원 이상(모바일 한도 내 280만/98만) 또는 사기 키워드 2개 이상 감지 시 최소 위험도 70점 강제 부여"
                        : "2+ hard signals (new payee, ≥₩900K, scam keyword) enforce minimum risk ≥ 70 and auto-hold."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cpu className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
                    <span>
                      <strong className="text-ink">
                        {lang === "ko" ? "비대칭 권한 분리:" : "Asymmetric Authority:"}
                      </strong>{" "}
                      {lang === "ko"
                        ? "AI는 이체를 보류할 수만 있으며, 출금 해제는 오직 보호자만 실행 가능"
                        : "AI can pause transfers, never approve or release funds on its own."}
                    </span>
                  </li>
                </ul>
              </div>

              {checks[0] && (
                <Link
                  href={`/checks/${checks[0].id}`}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-navy px-4 text-xs font-bold text-white shadow-2xs hover:bg-navy-2"
                >
                  <FileCheck2 className="size-4" aria-hidden />
                  <span>
                    {lang === "ko"
                      ? "은행 제출용 경고 기록 (Warning Record) 열람"
                      : "Open Bank Liability Warning Record"}
                  </span>
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              )}
            </section>
          </aside>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
