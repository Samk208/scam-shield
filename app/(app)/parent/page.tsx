"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileCheck2,
  Landmark,
  MessageSquareText,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { BankDemo } from "@/components/BankDemo";
import { CheckCard } from "@/components/CheckCard";
import { StatsStrip } from "@/components/Dashboard";
import { submitCheck, useFamilyChecks, useMe } from "@/lib/hooks";
import type { Channel } from "@/lib/types";

const CHANNELS: { id: Channel; label: string; Icon: typeof Phone }[] = [
  { id: "sms", label: "문자 (SMS)", Icon: Smartphone },
  { id: "kakao", label: "카카오톡", Icon: MessageSquareText },
  { id: "call_transcript", label: "전화 통화 내용", Icon: Phone },
];

// Synthetic demo inputs (fictional).
const EXAMPLES: { label: string; tag: string; channel: Channel; text: string }[] = [
  {
    label: "검찰 사칭 문자",
    tag: "위험",
    channel: "sms",
    text: "[서울중앙지검] 김영자님 명의 계좌가 범죄에 연루되어 수사 중입니다. 자산 보호를 위해 오늘 중 안전계좌로 이체하시고 이 사실은 가족에게도 알리지 마십시오. 담당 수사관 010-0000-0000",
  },
  {
    label: "자녀 사칭 카톡",
    tag: "위험",
    channel: "kakao",
    text: "엄마 나 폰 액정 깨져서 임시폰으로 연락해. 급하게 결제할 게 있는데 엄마 카드 사진이랑 비밀번호 좀 보내줘",
  },
  {
    label: "일상 안부 카톡",
    tag: "안전",
    channel: "kakao",
    text: "엄마 저녁 먹었어? 이번 주말에 갈게",
  },
];

const MSG_PROGRESS = [
  "1/4 · 메시지 내용을 안전하게 분리해 읽는 중…",
  "2/4 · 전화번호·계좌·보이스피싱 단어 찾는 중…",
  "3/4 · AI가 사기 위험도를 분석하는 중…",
  "4/4 · 위험 시 자녀에게 알림을 보내는 중…",
];

export default function ParentPage() {
  const { me, family } = useMe();
  const guardians = family.filter((m) => m.role === "guardian");
  const { checks, loading } = useFamilyChecks(me?.family_id);
  const [channel, setChannel] = useState<Channel>("sms");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [latestId, setLatestId] = useState<string | null>(null);
  const latestCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev < MSG_PROGRESS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [busy]);

  function focusLatest(id?: string) {
    if (!id) return;
    setLatestId(id);
    setTimeout(() => {
      latestCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 120);
  }

  async function onCheck() {
    setStepIdx(0);
    setBusy(true);
    setError(null);
    const r = await submitCheck(channel, content);
    setBusy(false);
    if (r.check) focusLatest(r.check.id);
    if (r.error) setError("확인에 실패했어요. 잠시 후 다시 눌러 주세요.");
    else setContent("");
  }

  const latest = checks.find((c) => c.id === latestId) ?? checks[0];
  const history = checks.filter((c) => c.id !== latest?.id);
  const heldCount = checks.filter((c) => c.status === "held").length;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        me={me}
        subtitle={me ? `${me.display_name}님 · 시니어 안심 뱅킹 포털` : "시니어 안심 뱅킹 포털"}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 text-lg sm:px-6 lg:px-8">
        {/* TOP FULL-WIDTH STATUS BANNER + STATS */}
        <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-navy p-6 text-white shadow-sm lg:col-span-7">
            <div className="flex items-start gap-4">
              <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <ShieldCheck className="size-8 text-[#32d583]" aria-hidden />
                <span
                  className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-[#32d583] ring-2 ring-navy"
                  aria-hidden
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#32d583]/20 px-2.5 py-0.5 text-xs font-bold text-[#32d583]">
                    실시간 가족 공동 보호 중
                  </span>
                  {heldCount > 0 && (
                    <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white">
                      보류 중인 이체 {heldCount}건
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  가족 안전 보호가 켜져 있어요
                </h1>
                <p className="mt-1 text-base leading-snug text-white/85">
                  {guardians.length
                    ? `${guardians.map((g) => g.display_name.split(" ")[0]).join(", ")}님이 함께 확인해요`
                    : "자녀가 함께 확인해요"}{" "}
                  · 위험한 고액 이체는 은행이 먼저 멈추고 자녀에게 물어봅니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-white/80">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-semibold">
                  <Landmark className="size-4 text-[#93c5fd]" aria-hidden /> 은행 고액 이체 자동 연동됨
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-semibold">
                  <Users className="size-4 text-[#32d583]" aria-hidden /> 보호자: Joon (아들)
                </span>
              </div>
              <Link
                href="/guardian"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-navy shadow-2xs transition hover:bg-white/90"
              >
                <span>자녀(보호자) 관제 화면 열기</span>
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <StatsStrip checks={checks} lang="ko" />
          </div>
        </section>

        {/* DESKTOP 12-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* LEFT 7 COLUMNS: ACTIVE VERIFICATION & BANK SIMULATOR */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* 1. Simulated Bank App (Primary Path) */}
            <BankDemo onDone={(id) => focusLatest(id)} />

            {/* 2. Manual Message / Call Transcript Checker */}
            <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">
                    수동 확인 도구
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-ink">
                    이상한 연락을 받으셨나요? (직접 확인)
                  </h2>
                </div>
              </div>
              <p className="mt-1 text-base leading-relaxed text-muted">
                문자·카톡·전화 통화 내용을 붙여넣으시면 AI가 사기인지 분석하고 위험할 경우 자녀에게 즉시 알림을 보냅니다.
              </p>

              <div
                className="mt-4 grid grid-cols-3 gap-2.5"
                role="radiogroup"
                aria-label="받은 경로"
              >
                {CHANNELS.map(({ id, label, Icon }) => {
                  const active = channel === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setChannel(id)}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-base font-bold transition ${
                        active
                          ? "border-navy bg-navy text-white shadow-xs"
                          : "border-line bg-bg/50 text-ink hover:border-navy/50"
                      }`}
                    >
                      <Icon className="size-5" aria-hidden /> {label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="msg" className="text-sm font-semibold text-muted">
                    받은 메시지 또는 통화 내용
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted tabular-nums">
                      {content.length}/4000
                    </span>
                    {content.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setContent("")}
                        className="inline-flex items-center gap-0.5 rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted hover:text-ink"
                      >
                        <X className="size-3" aria-hidden /> 지우기
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  id="msg"
                  className="min-h-36 w-full rounded-2xl border-2 border-line bg-bg/60 p-4 text-lg leading-relaxed outline-none focus:border-navy focus:bg-surface"
                  maxLength={4000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="여기에 길게 눌러 붙여넣거나 아래 예시 버튼을 눌러 보세요"
                />
              </div>

              <div className="mt-3">
                <p className="mb-2 text-xs font-semibold text-muted">
                  데모 예시 문구 원클릭 입력
                </p>
                <div className="flex flex-wrap gap-2" aria-label="데모 예시">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => {
                        setContent(ex.text);
                        setChannel(ex.channel);
                      }}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-bg/50 px-3.5 text-sm font-semibold text-ink transition hover:border-navy hover:bg-surface"
                    >
                      <span>{ex.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          ex.tag === "위험"
                            ? "bg-danger-bg text-danger-ink"
                            : "bg-safe-bg text-safe"
                        }`}
                      >
                        {ex.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onCheck}
                disabled={busy || !content.trim()}
                className="relative mt-5 flex min-h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-danger text-2xl font-bold text-white shadow-md transition active:scale-[.99] disabled:opacity-50"
              >
                {busy && (
                  <span
                    className="ss-scan absolute inset-y-0 left-0 w-1/3 bg-white/25"
                    aria-hidden
                  />
                )}
                <ShieldCheck className="size-7 shrink-0" aria-hidden />
                <span>{busy ? "AI가 확인 중이에요…" : "사기인지 확인하기"}</span>
              </button>

              {busy && (
                <div
                  className="mt-3 rounded-2xl border border-danger/25 bg-danger-bg/60 p-3.5 text-sm font-semibold text-danger-ink"
                  role="status"
                >
                  <p className="animate-pulse">{MSG_PROGRESS[stepIdx]}</p>
                </div>
              )}

              {error && (
                <p
                  className="mt-2 rounded-xl bg-danger-bg p-3 text-base font-medium text-danger-ink"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </section>
          </div>

          {/* RIGHT 5 COLUMNS: LIVE AI SAFETY RESULT + HISTORY + EMERGENCY GUIDE */}
          <aside className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-20">
            {loading ? (
              <div className="ss-skeleton h-80 rounded-3xl" aria-label="불러오는 중" />
            ) : latest ? (
              <div ref={latestCardRef} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-1.5 text-base font-extrabold text-navy">
                    <ShieldAlert className="size-5 text-danger" aria-hidden />
                    최근 AI 안전 확인 결과
                  </span>
                  {latest.status === "held" && (
                    <span className="rounded-full bg-danger px-3 py-1 text-xs font-bold text-white shadow-2xs">
                      자녀 확인 대기 중
                    </span>
                  )}
                </div>
                <CheckCard check={latest} lang="ko" />
              </div>
            ) : null}

            {/* Past Check History */}
            {history.length > 0 && (
              <section className="rounded-3xl border border-line bg-surface p-5 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-ink">
                    지난 확인 기록 ({history.length}건)
                  </h2>
                  <span className="text-xs font-medium text-muted">
                    항목을 누르면 상세 내역으로 이동
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {history.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setLatestId(c.id)}
                      className="cursor-pointer"
                    >
                      <CheckCard check={c} lang="ko" compact />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Senior Emergency Action Card */}
            <section className="rounded-3xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center gap-2 text-navy">
                <AlertTriangle className="size-5 shrink-0 text-warn" aria-hidden />
                <h2 className="text-base font-extrabold text-ink">
                  꼭 기억하세요! 보이스피싱 예방 3원칙
                </h2>
              </div>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                <li>
                  • <strong className="text-ink">검찰·경찰·금감원</strong>은 절대 전화나 문자로 &lsquo;안전계좌&rsquo; 송금을 요구하지 않습니다.
                </li>
                <li>
                  • <strong className="text-ink">&ldquo;아무에게도 말하지 말라&rdquo;</strong>고 하면 100% 보이스피싱 사기입니다.
                </li>
                <li>
                  • 의심스러울 때는 돈을 보내기 전에 먼저 자녀에게 전화로 목소리를 확인하세요.
                </li>
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <a
                  href="tel:112"
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-bold text-white hover:bg-navy-2"
                >
                  <Phone className="size-4" aria-hidden /> 경찰청 112 신고
                </a>
                <a
                  href="tel:1332"
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-sm font-bold text-ink hover:border-navy"
                >
                  <Phone className="size-4" aria-hidden /> 금감원 1332 상담
                </a>
              </div>
              {latest && (
                <Link
                  href={`/checks/${latest.id}`}
                  className="mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-bg/60 px-3 text-xs font-bold text-navy hover:bg-bg"
                >
                  <FileCheck2 className="size-4" aria-hidden />
                  <span>현재 거래의 은행 제출용 경고 기록(Warning Record) 보기</span>
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
