"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, FileCheck2 } from "lucide-react";
import { AgentTrace } from "@/components/AgentTrace";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { CheckCard } from "@/components/CheckCard";
import { useCheckAudit, useMe } from "@/lib/hooks";

const EVENT_LABEL: Record<string, string> = {
  submitted: "Message forwarded by parent",
  ai_verdict: "AI agent verdict recorded",
  held: "Transfer put on HOLD (simulated bank hold)",
  guardian_alerted: "Guardian alerted in real time",
  marked_safe: "Marked safe — no alert sent",
  blocked: "Guardian BLOCKED the transfer",
  released: "Guardian confirmed it is safe",
  failed: "AI analysis failed",
};

export default function CheckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { me, family } = useMe();
  const { check, events, loading } = useCheckAudit(id);
  const lang = me?.lang ?? "en";
  const name = (uid: string | null) => family.find((m) => m.user_id === uid)?.display_name;

  function exportRecord() {
    const record = { record_type: "scam_shield_warning_record", version: 1, exported_at: new Date().toISOString(), check, events };
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warning-record-${id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <AppHeader me={me} subtitle="Warning record" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-4">
        <Link href={me?.role === "parent" ? "/parent" : "/guardian"} className="inline-flex items-center gap-1 text-sm font-semibold text-navy-2">
          <ArrowLeft className="size-4" /> Back
        </Link>
        {loading ? <p className="text-muted">Loading…</p> : !check ? <p>Not found</p> : (
          <>
            <CheckCard check={check} lang={lang} />

            <section className="rounded-3xl bg-surface p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold">How the AI agent decided</h2>
              <AgentTrace check={check} />
            </section>

            <section className="rounded-3xl bg-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileCheck2 className="size-5 text-navy" />
                <h2 className="text-lg font-bold">Warning record</h2>
              </div>
              <p className="mb-3 text-sm text-muted">Timestamped evidence that the customer was warned and the family confirmed — for bank liability review.</p>
              <ol className="flex flex-col gap-2">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3 text-[15px]">
                    <span className="w-20 shrink-0 font-mono text-sm text-muted">
                      {new Date(e.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span>
                      {EVENT_LABEL[e.event_type]}
                      <span className="text-muted">
                        {e.actor_type === "user" && name(e.actor_id) ? ` — ${name(e.actor_id)}` : e.actor_type === "ai" ? " — AI agent" : " — system"}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <button onClick={exportRecord} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-navy px-4 font-semibold text-white">
                <Download className="size-5" /> Export warning record
              </button>
            </section>
          </>
        )}
      </main>
      <DemoFooter />
    </>
  );
}
