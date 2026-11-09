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
import type { Channel, Lang } from "@/lib/types";

const CHANNELS: { id: Channel; labelKo: string; labelEn: string; Icon: typeof Phone }[] = [
  { id: "sms", labelKo: "문자 (SMS)", labelEn: "SMS", Icon: Smartphone },
  { id: "kakao", labelKo: "카카오톡", labelEn: "KakaoTalk", Icon: MessageSquareText },
  { id: "call_transcript", labelKo: "통화 녹취", labelEn: "Call Text", Icon: Phone },
];

const EXAMPLES: {
  labelKo: string;
  labelEn: string;
  tagKo: string;
  tagEn: string;
  isDanger: boolean;
  channel: Channel;
  text: string;
}[] = [
  {
    labelKo: "검찰 사칭 문자",
    labelEn: "Prosecutor Scam SMS",
    tagKo: "위험",
    tagEn: "Scam",
    isDanger: true,
    channel: "sms",
    text: "[서울중앙지검] 김영자님 명의 계좌가 범죄에 연루되어 수사 중입니다. 자산 보호를 위해 오늘 중 안전계좌로 280만 원을 이체하시고 가족에게 알리지 마십시오.",
  },
  {
    labelKo: "자녀 사칭 카톡 (98만)",
    labelEn: "Broken Phone Kakao",
    tagKo: "위험",
    tagEn: "Scam",
    isDanger: true,
    channel: "kakao",
    text: "엄마 나 폰 액정 깨져서 수리 맡겼어. 수리비 98만 원 급하게 보내야 하는데 엄마 카드 번호랑 비밀번호 좀 찍어 보내줘",
  },
  {
    labelKo: "일상 안부 카톡",
    labelEn: "Normal Family Chat",
    tagKo: "안전",
    tagEn: "Safe",
    isDanger: false,
    channel: "kakao",
    text: "엄마 저녁 먹었어? 이번 주말에 갈게",
  },
];

const MSG_PROGRESS: Record<Lang, string[]> = {
  ko: [
    "1/4 · 메시지 원문을 안전하게 격리하는 중…",
    "2/4 · 전화번호·계좌·사기 키워드 스캔 중…",
    "3/4 · AI가 사기 위험도를 분석하는 중…",
    "4/4 · 위험 시 자녀에게 즉시 알림 전송 중…",
  ],
  en: [
    "1/4 · Isolating untrusted message payload…",
    "2/4 · Scanning phone numbers, accounts & scam phrases…",
    "3/4 · Running bilingual AI scam classification…",
    "4/4 · Applying policy floor & alerting guardian…",
  ],
};

export default function ParentPage() {
  const { me, family } = useMe();
  const guardians = family.filter((m) => m.role === "guardian");
  const { checks, loading } = useFamilyChecks(me?.family_id);
  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<"bank" | "message">("bank");
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
      setStepIdx((prev) => (prev < MSG_PROGRESS[lang].length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, [busy, lang]);

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
    if (r.error)
      setError(
        lang === "ko"
          ? "확인에 실패했어요. 다시 눌러 주세요."
          : "Check failed. Please try again.",
      );
    else setContent("");
  }

  const latest = checks.find((c) => c.id === latestId) ?? checks[0];
  const history = checks.filter((c) => c.id !== latest?.id);
  const heldCount = checks.filter((c) => c.status === "held").length;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        me={me}
        lang={lang}
        onLangChange={setLang}
        subtitle={
          lang === "ko"
            ? `${me?.display_name ?? "엄마 (김영자)"} · 시니어 안심 뱅킹 포털`
            : `${me?.display_name ?? "Mom (Kim Young-ja, 72)"} · Senior Protected Portal`
        }
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* TOP FULL-WIDTH STATUS BANNER + STATS (100% EVEN 7/5 SPLIT) */}
        <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-4 rounded-3xl bg-navy p-5 text-white shadow-sm lg:col-span-7">
            <div className="flex items-start gap-3.5">
              <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <ShieldCheck className="size-7 text-[#32d583]" aria-hidden />
                <span
                  className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-[#32d583] ring-2 ring-navy"
                  aria-hidden
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#32d583]/20 px-2.5 py-0.5 text-xs font-bold text-[#32d583]">
                    {lang === "ko" ? "실시간 가족 공동 보호 중" : "FAMILY CO-SIGN PROTECTION ACTIVE"}
                  </span>
                  {heldCount > 0 && (
                    <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white">
                      {lang === "ko" ? `보류 이체 ${heldCount}건` : `${heldCount} Transfer Held`}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
                  {lang === "ko"
                    ? "가족 안전 보호가 켜져 있어요"
                    : "Your Transfers Are Co-Protected by Family"}
                </h1>
                <p className="mt-0.5 text-sm text-white/85">
                  {lang === "ko"
                    ? `${guardians.length ? guardians.map((g) => g.display_name.split(" ")[0]).join(", ") : "자녀"}님이 함께 확인합니다 · 수상한 이체는 출금 전 자동으로 일시 정지됩니다.`
                    : "Suspicious transfers (≥₩900K to new payees) pause automatically until Joon confirms."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-white/80">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 font-semibold">
                  <Landmark className="size-3.5 text-[#93c5fd]" aria-hidden />{" "}
                  {lang === "ko" ? "은행 이체 자동 연동" : "Bank Auto-Hook Active"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1 font-semibold">
                  <Users className="size-3.5 text-[#32d583]" aria-hidden />{" "}
                  {lang === "ko" ? "보호자: Joon (아들)" : "Guardian: Joon (Son)"}
                </span>
              </div>
              <Link
                href="/guardian"
                className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-navy shadow-2xs transition hover:bg-white/90"
              >
                <span>{lang === "ko" ? "자녀 화면 열기" : "Open Guardian View"}</span>
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <StatsStrip checks={checks} lang={lang} />
          </div>
        </section>

        {/* DESKTOP 12-COLUMN WORKSPACE (EVEN 6/6 SPLIT WITH ITEMS-STRETCH) */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT 6 COLUMNS: TABBED SIMULATOR (BANK vs MESSAGE) + 3 GOLDEN RULES */}
          <div className="flex h-full flex-col justify-between gap-5 lg:col-span-6">
            <div className="flex flex-col gap-4">
              {/* Mode Switcher Tabs so Left Column stays compact and matches Right Column height */}
              <div
                className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-2xs"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "bank"}
                  onClick={() => setActiveTab("bank")}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold transition ${
                    activeTab === "bank"
                      ? "bg-navy text-white shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Landmark className="size-4" aria-hidden />
                  <span>
                    {lang === "ko" ? "1. 은행 이체 시뮬레이션" : "1. Bank Transfer Sim"}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "message"}
                  onClick={() => setActiveTab("message")}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold transition ${
                    activeTab === "message"
                      ? "bg-navy text-white shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <MessageSquareText className="size-4" aria-hidden />
                  <span>
                    {lang === "ko" ? "2. 문자·카톡 사기 검사" : "2. Check SMS / Kakao"}
                  </span>
                </button>
              </div>

              {activeTab === "bank" ? (
                <BankDemo lang={lang} onDone={(id) => focusLatest(id)} />
              ) : (
                <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-extrabold text-ink">
                      {lang === "ko"
                        ? "수상한 문자·카톡·통화 내용 붙여넣기"
                        : "Paste Suspicious SMS, KakaoTalk, or Call Text"}
                    </h2>
                    <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy">
                      {lang === "ko" ? "수동 검사" : "Manual Check"}
                    </span>
                  </div>

                  <div
                    className="mt-3 grid grid-cols-3 gap-2"
                    role="radiogroup"
                    aria-label={lang === "ko" ? "받은 경로" : "Channel"}
                  >
                    {CHANNELS.map(({ id, labelKo, labelEn, Icon }) => {
                      const active = channel === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setChannel(id)}
                          className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-bold transition sm:text-sm ${
                            active
                              ? "border-navy bg-navy text-white shadow-xs"
                              : "border-line bg-bg/50 text-ink hover:border-navy/50"
                          }`}
                        >
                          <Icon className="size-4" aria-hidden />{" "}
                          {lang === "ko" ? labelKo : labelEn}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label htmlFor="msg" className="text-xs font-semibold text-muted">
                        {lang === "ko" ? "메시지 원문" : "Message Content"}
                      </label>
                      {content.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setContent("")}
                          className="inline-flex items-center gap-0.5 rounded-full bg-bg px-2 py-0.5 text-xs font-semibold text-muted hover:text-ink"
                        >
                          <X className="size-3" aria-hidden />{" "}
                          {lang === "ko" ? "지우기" : "Clear"}
                        </button>
                      )}
                    </div>
                    <textarea
                      id="msg"
                      className="min-h-28 w-full rounded-2xl border-2 border-line bg-bg/60 p-3.5 text-base leading-relaxed outline-none focus:border-navy focus:bg-surface"
                      maxLength={4000}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={
                        lang === "ko"
                          ? "아래 데모 예시 버튼을 누르거나 메시지를 붙여넣으세요"
                          : "Click a sample preset below or paste a message"
                      }
                    />
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.labelEn}
                        type="button"
                        onClick={() => {
                          setContent(ex.text);
                          setChannel(ex.channel);
                        }}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-bg/50 px-3 text-xs font-bold text-ink transition hover:border-navy hover:bg-surface"
                      >
                        <span>{lang === "ko" ? ex.labelKo : ex.labelEn}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            ex.isDanger
                              ? "bg-danger-bg text-danger-ink"
                              : "bg-safe-bg text-safe"
                          }`}
                        >
                          {lang === "ko" ? ex.tagKo : ex.tagEn}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={onCheck}
                    disabled={busy || !content.trim()}
                    className="relative mt-4 flex min-h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-danger text-lg font-bold text-white shadow-md transition active:scale-[.99] disabled:opacity-50"
                  >
                    {busy && (
                      <span
                        className="ss-scan absolute inset-y-0 left-0 w-1/3 bg-white/25"
                        aria-hidden
                      />
                    )}
                    <ShieldCheck className="size-5 shrink-0" aria-hidden />
                    <span>
                      {busy
                        ? lang === "ko"
                          ? "AI가 확인 중…"
                          : "Analyzing…"
                        : lang === "ko"
                          ? "사기 위험도 즉시 확인하기"
                          : "Analyze Message Risk"}
                    </span>
                  </button>

                  {busy && (
                    <div
                      className="mt-2.5 rounded-2xl border border-danger/25 bg-danger-bg/60 p-2.5 text-xs font-semibold text-danger-ink"
                      role="status"
                    >
                      <p className="animate-pulse">{MSG_PROGRESS[lang][stepIdx]}</p>
                    </div>
                  )}

                  {error && (
                    <p
                      className="mt-2 rounded-xl bg-danger-bg p-2.5 text-sm font-medium text-danger-ink"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* Bottom Card in Left Column: Senior 3 Golden Rules + Emergency Hotlines (balances height with Right Column) */}
            <section className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-5 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-navy">
                  <AlertTriangle className="size-5 shrink-0 text-warn" aria-hidden />
                  <h2 className="text-base font-extrabold text-ink">
                    {lang === "ko"
                      ? "보이스피싱 예방 3대 핵심 수칙"
                      : "3 Golden Rules Against Voice Phishing"}
                  </h2>
                </div>
                <ul className="mt-2.5 flex flex-col gap-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                  <li>
                    •{" "}
                    {lang === "ko" ? (
                      <>
                        <strong className="text-ink">검찰·금감원</strong>은 절대 &lsquo;안전계좌&rsquo; 송금을 요구하지 않습니다.
                      </>
                    ) : (
                      <>
                        <strong className="text-ink">Prosecutors & FSS</strong> never ask you to move money to a &ldquo;safe account&rdquo;.
                      </>
                    )}
                  </li>
                  <li>
                    •{" "}
                    {lang === "ko" ? (
                      <>
                        <strong className="text-ink">&ldquo;자녀에게 비밀로 하라&rdquo;</strong>거나 300만 원 미만(280만·98만) 송금을 재촉하면 100% 사기입니다.
                      </>
                    ) : (
                      <>
                        <strong className="text-ink">Demands for secrecy</strong> or sub-limit transfers (₩2.8M / ₩980K) are 100% scams.
                      </>
                    )}
                  </li>
                </ul>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-line pt-3.5">
                <a
                  href="tel:112"
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-navy px-3 text-xs font-bold text-white hover:bg-navy-2"
                >
                  <Phone className="size-3.5" aria-hidden />{" "}
                  {lang === "ko" ? "경찰청 112 신고" : "Police 112"}
                </a>
                <a
                  href="tel:1332"
                  className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-xs font-bold text-ink hover:border-navy"
                >
                  <Phone className="size-3.5" aria-hidden />{" "}
                  {lang === "ko" ? "금감원 1332 상담" : "FSS 1332"}
                </a>
              </div>
            </section>
          </div>

          {/* RIGHT 6 COLUMNS: LIVE AI SAFETY RESULT + PAST CHECK HISTORY (MATCHED HEIGHT) */}
          <div className="flex h-full flex-col justify-between gap-5 lg:col-span-6">
            {loading ? (
              <div className="ss-skeleton h-80 rounded-3xl" aria-label="Loading" />
            ) : latest ? (
              <div ref={latestCardRef} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-navy">
                    <ShieldAlert className="size-4.5 text-danger" aria-hidden />
                    {lang === "ko" ? "실시간 AI 안전 확인 결과" : "Live AI Interception Result"}
                  </span>
                  {latest.status === "held" && (
                    <span className="rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-white">
                      {lang === "ko" ? "자녀 승인 대기 중" : "Awaiting Guardian"}
                    </span>
                  )}
                </div>
                <CheckCard check={latest} lang={lang} hideHotlines />
              </div>
            ) : null}

            {/* Past Check History + Audit Link Card (fills remaining vertical space cleanly) */}
            <section className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-5 shadow-xs">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-ink">
                    {lang === "ko"
                      ? `전체 확인 기록 (${checks.length}건)`
                      : `Recent Protection History (${checks.length})`}
                  </h2>
                  <span className="text-xs text-muted">
                    {lang === "ko" ? "클릭하여 전환" : "Click to inspect"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {(history.length > 0 ? history : checks).slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setLatestId(c.id)}
                      className="cursor-pointer"
                    >
                      <CheckCard check={c} lang={lang} compact />
                    </div>
                  ))}
                </div>
              </div>

              {latest && (
                <Link
                  href={`/checks/${latest.id}`}
                  className="mt-3.5 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-bg/70 px-3 text-xs font-bold text-navy hover:bg-bg"
                >
                  <FileCheck2 className="size-4" aria-hidden />
                  <span>
                    {lang === "ko"
                      ? "현재 거래의 은행 제출용 경고 기록(Warning Record) 열람"
                      : "Open Bank Liability Warning Record (JSON)"}
                  </span>
                </Link>
              )}
            </section>
          </div>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
