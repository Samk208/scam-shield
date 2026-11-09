import { Activity, Ban, Landmark, PiggyBank, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import type { Check, Lang, Member } from "@/lib/types";

function formatProtectedWon(won: number, lang: Lang) {
  if (!won) return "₩0";
  if (lang === "ko") {
    return `₩${(won / 10_000).toLocaleString("ko-KR")}만`;
  }
  if (won >= 1_000_000) {
    const millions = won / 1_000_000;
    return `₩${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `₩${won.toLocaleString("en-US")}`;
}

// Live family protection stats, computed from the family's checks (no extra queries).
export function StatsStrip({ checks, lang }: { checks: Check[]; lang: Lang }) {
  const held = checks.filter((c) => c.status === "held").length;
  const blocked = checks.filter((c) => c.status === "blocked");
  const protectedWon = blocked.reduce((s, c) => s + (c.transfer?.amount ?? 0), 0);

  const items = [
    {
      Icon: Activity,
      label: lang === "ko" ? "AI 보안 확인" : "AI Checks",
      sub: lang === "ko" ? "누적 분석 건수" : "Total screened",
      value: String(checks.length),
      tone: "text-navy",
      cardStyle: "border-line bg-surface",
    },
    {
      Icon: ShieldAlert,
      label: lang === "ko" ? "출금 보류 중" : "On Hold",
      sub: lang === "ko" ? "자녀 승인 대기" : "Awaiting family",
      value: String(held),
      tone: held ? "text-danger" : "text-muted",
      cardStyle: held ? "border-danger/40 bg-danger-bg/60" : "border-line bg-surface",
    },
    {
      Icon: Ban,
      label: lang === "ko" ? "사기 차단" : "Blocked",
      sub: lang === "ko" ? "보호자 차단 완료" : "Stopped by family",
      value: String(blocked.length),
      tone: "text-danger-ink",
      cardStyle: "border-line bg-surface",
    },
    {
      Icon: PiggyBank,
      label: lang === "ko" ? "지킨 자산" : "Protected",
      sub: lang === "ko" ? "피해 예방 금액" : "Saved from scams",
      value: formatProtectedWon(protectedWon, lang),
      tone: "text-safe",
      cardStyle: protectedWon > 0 ? "border-safe/30 bg-safe-bg/50" : "border-line bg-surface",
    },
  ];

  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ Icon, label, sub, value, tone, cardStyle }) => (
        <div
          key={label}
          className={`flex flex-col justify-between gap-2 rounded-3xl border p-4 shadow-xs ${cardStyle}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted">{label}</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-bg">
              <Icon className={`size-4 ${tone}`} aria-hidden />
            </span>
          </div>
          <div>
            <p className={`truncate font-mono text-2xl font-extrabold leading-tight tabular-nums ${tone}`}>
              {value}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-muted">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, tone }: { name: string; tone: string }) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold text-white shadow-xs ${tone}`}
    >
      {name.slice(0, 1)}
    </span>
  );
}

// Who is protected, who is guarding, and through which channels.
export function FamilyCard({
  family,
  held,
  lang = "en",
}: {
  family: Member[];
  held: boolean;
  lang?: Lang;
}) {
  const parent = family.find((m) => m.role === "parent");
  const guardians = family.filter((m) => m.role === "guardian");

  const channels =
    lang === "ko"
      ? [
          { label: "은행 이체 자동 연동", Icon: Landmark, primary: true },
          { label: "문자(SMS)", Icon: Smartphone, primary: false },
          { label: "카카오톡", Icon: Smartphone, primary: false },
          { label: "통화 녹취록", Icon: Smartphone, primary: false },
        ]
      : [
          { label: "Bank transfers (auto)", Icon: Landmark, primary: true },
          { label: "SMS", Icon: Smartphone, primary: false },
          { label: "KakaoTalk", Icon: Smartphone, primary: false },
          { label: "Call transcripts", Icon: Smartphone, primary: false },
        ];

  return (
    <section
      className={`rounded-3xl border p-5 shadow-xs transition-colors ${
        held ? "border-danger/40 bg-danger-bg/40" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <Avatar name={parent?.display_name ?? "M"} tone={held ? "bg-danger" : "bg-navy"} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-extrabold text-ink">{parent?.display_name ?? "Mom"}</p>
            <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted">
              {lang === "ko" ? "보호 대상 부모님" : "Protected parent"}
            </span>
          </div>
          <p
            className={`mt-0.5 flex items-center gap-1.5 text-sm font-bold ${
              held ? "text-danger" : "text-safe"
            }`}
          >
            {held ? (
              <ShieldAlert className="size-4 shrink-0" />
            ) : (
              <ShieldCheck className="size-4 shrink-0" />
            )}
            {held
              ? lang === "ko"
                ? "이체 일시 보류 중 — 자녀 확인 필요"
                : "Transfer paused — needs your decision"
              : lang === "ko"
                ? "실시간 보호 중 · 이상 없음"
                : "Protected in real time · all clear"}
          </p>
        </div>
        <div className="flex -space-x-2" title={guardians.map((g) => g.display_name).join(", ")}>
          {guardians.map((g) => (
            <Avatar key={g.user_id} name={g.display_name} tone="bg-navy-2 ring-2 ring-surface" />
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
        {channels.map(({ label, Icon, primary }) => (
          <span
            key={label}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${
              primary ? "bg-navy text-white" : "border border-line bg-bg text-muted"
            }`}
          >
            <Icon className="size-3.5" aria-hidden /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}
