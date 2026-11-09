"use client";
import { useState } from "react";
import { MessageSquareText, Phone, Smartphone, ShieldCheck } from "lucide-react";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { BankDemo } from "@/components/BankDemo";
import { CheckCard } from "@/components/CheckCard";
import { StatsStrip } from "@/components/Dashboard";
import { submitCheck, useFamilyChecks, useMe } from "@/lib/hooks";
import type { Channel } from "@/lib/types";

const CHANNELS: { id: Channel; label: string; Icon: typeof Phone }[] = [
  { id: "sms", label: "문자", Icon: Smartphone },
  { id: "kakao", label: "카카오톡", Icon: MessageSquareText },
  { id: "call_transcript", label: "전화 내용", Icon: Phone },
];

// Synthetic demo inputs (fictional).
const EXAMPLES: { label: string; channel: Channel; text: string }[] = [
  { label: "검찰 사칭", channel: "sms", text: "[서울중앙지검] 김영자님 명의 계좌가 범죄에 연루되어 수사 중입니다. 자산 보호를 위해 오늘 중 안전계좌로 이체하시고 이 사실은 가족에게도 알리지 마십시오. 담당 수사관 010-0000-0000" },
  { label: "자녀 사칭", channel: "kakao", text: "엄마 나 폰 액정 깨져서 임시폰으로 연락해. 급하게 결제할 게 있는데 엄마 카드 사진이랑 비밀번호 좀 보내줘" },
  { label: "일상 안부", channel: "kakao", text: "엄마 저녁 먹었어? 이번 주말에 갈게" },
];

export default function ParentPage() {
  const { me, family } = useMe();
  const guardians = family.filter((m) => m.role === "guardian");
  const { checks, loading } = useFamilyChecks(me?.family_id);
  const [channel, setChannel] = useState<Channel>("sms");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestId, setLatestId] = useState<string | null>(null);

  async function onCheck() {
    setBusy(true);
    setError(null);
    const r = await submitCheck(channel, content);
    setBusy(false);
    if (r.check) setLatestId(r.check.id);
    if (r.error) setError("확인에 실패했어요. 잠시 후 다시 눌러 주세요.");
    else setContent("");
  }

  const latest = checks.find((c) => c.id === latestId) ?? checks[0];
  const history = checks.filter((c) => c.id !== latest?.id);

  return (
    <>
      <AppHeader me={me} subtitle={me ? `${me.display_name}님` : undefined} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-4 text-lg">
        <section className="flex items-center gap-3 rounded-3xl bg-navy p-4 text-white shadow-sm">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-white/15">
            <ShieldCheck className="size-7" />
            <span className="absolute right-0 top-0 size-3 rounded-full bg-[#32d583] ring-2 ring-navy" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold">보호 중이에요</p>
            <p className="text-base text-white/80">
              {guardians.length ? `${guardians.map((g) => g.display_name.split(" ")[0]).join(", ")}님이 함께 지켜요` : "가족이 함께 지켜요"} · 큰 이체는 가족 확인 후 진행돼요
            </p>
          </div>
        </section>

        <StatsStrip checks={checks} lang="ko" />

        <BankDemo onDone={(id) => id && setLatestId(id)} />

        {loading ? null : latest ? <CheckCard check={latest} lang="ko" /> : null}

        <section className="rounded-3xl bg-surface p-5 shadow-sm">
          <h1 className="text-xl font-bold">이상한 연락을 받으셨나요? (선택)</h1>
          <p className="mt-1 text-base text-muted">문자·카톡·전화 내용을 붙여넣어도 AI가 확인하고 자녀에게 알려드려요.</p>

          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="받은 경로">
            {CHANNELS.map(({ id, label, Icon }) => (
              <button key={id} role="radio" aria-checked={channel === id} onClick={() => setChannel(id)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-base font-semibold transition
                  ${channel === id ? "border-navy bg-navy text-white" : "border-line bg-surface text-ink"}`}>
                <Icon className="size-5" /> {label}
              </button>
            ))}
          </div>

          <label htmlFor="msg" className="sr-only">받은 메시지</label>
          <textarea id="msg" className="mt-3 min-h-36 w-full rounded-2xl border-2 border-line bg-bg p-4 text-lg outline-none focus:border-navy"
            maxLength={4000} value={content} onChange={(e) => setContent(e.target.value)} placeholder="여기에 길게 눌러 붙여넣기" />

          <div className="mt-2 flex flex-wrap gap-2" aria-label="데모 예시">
            {EXAMPLES.map((ex) => (
              <button key={ex.label} onClick={() => { setContent(ex.text); setChannel(ex.channel); }}
                className="min-h-11 rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-navy hover:bg-bg">예시: {ex.label}</button>
            ))}
          </div>

          <button onClick={onCheck} disabled={busy || !content.trim()}
            className="relative mt-4 flex min-h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-danger text-2xl font-bold text-white shadow-md transition active:scale-[.98] disabled:opacity-50">
            {busy && <span className="ss-scan absolute inset-y-0 left-0 w-1/3 bg-white/25" aria-hidden />}
            <ShieldCheck className="size-7" /> {busy ? "AI가 확인 중이에요…" : "확인하기"}
          </button>
          {error && <p className="mt-2 text-base text-danger" role="alert">{error}</p>}
        </section>

        {history.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-base font-semibold text-muted">지난 확인 기록</h2>
            {history.map((c) => <CheckCard key={c.id} check={c} lang="ko" compact />)}
          </section>
        )}
      </main>
      <DemoFooter />
    </>
  );
}
