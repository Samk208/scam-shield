import { Activity, Ban, PiggyBank, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import type { Check, Member } from "@/lib/types";

// Live family protection stats, computed from the family's checks (no extra queries).
export function StatsStrip({ checks, lang }: { checks: Check[]; lang: "ko" | "en" }) {
  const held = checks.filter((c) => c.status === "held").length;
  const blocked = checks.filter((c) => c.status === "blocked");
  const protectedWon = blocked.reduce((s, c) => s + (c.transfer?.amount ?? 0), 0);
  const items = [
    { Icon: Activity, label: lang === "ko" ? "AI 확인" : "AI checks", value: String(checks.length), tone: "text-navy" },
    { Icon: ShieldAlert, label: lang === "ko" ? "보류 중" : "On hold", value: String(held), tone: held ? "text-danger" : "text-muted" },
    { Icon: Ban, label: lang === "ko" ? "차단" : "Blocked", value: String(blocked.length), tone: "text-danger-ink" },
    { Icon: PiggyBank, label: lang === "ko" ? "지킨 돈" : "₩ protected", value: protectedWon ? `₩${(protectedWon / 10_000).toLocaleString()}만` : "₩0", tone: "text-safe" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(({ Icon, label, value, tone }) => (
        <div key={label} className="rounded-2xl bg-surface p-3 text-center shadow-sm">
          <Icon className={`mx-auto size-5 ${tone}`} />
          <p className={`mt-1 font-mono text-lg font-bold leading-tight ${tone}`}>{value}</p>
          <p className="text-xs leading-tight text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, tone }: { name: string; tone: string }) {
  return <span className={`grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold text-white ${tone}`}>{name.slice(0, 1)}</span>;
}

// Who is protected, who is guarding, and through which channels.
export function FamilyCard({ family, held }: { family: Member[]; held: boolean }) {
  const parent = family.find((m) => m.role === "parent");
  const guardians = family.filter((m) => m.role === "guardian");
  return (
    <section className="rounded-3xl bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar name={parent?.display_name ?? "M"} tone={held ? "bg-danger" : "bg-navy"} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{parent?.display_name ?? "Mom"}</p>
          <p className={`flex items-center gap-1 text-sm ${held ? "text-danger" : "text-safe"}`}>
            {held ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
            {held ? "Transfer paused — needs you" : "Protected · all clear"}
          </p>
        </div>
        <div className="flex -space-x-2">
          {guardians.map((g) => <Avatar key={g.user_id} name={g.display_name} tone="bg-navy-2 ring-2 ring-surface" />)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {["Bank transfers (auto)", "SMS", "KakaoTalk", "Call transcripts"].map((c, i) => (
          <span key={c} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${i === 0 ? "bg-navy text-white" : "bg-bg text-muted"}`}>
            <Smartphone className="size-3" /> {c}
          </span>
        ))}
      </div>
    </section>
  );
}
