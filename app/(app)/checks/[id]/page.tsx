"use client";
import { useParams } from "next/navigation";
import { CheckCard } from "@/components/CheckCard";
import { useCheckAudit, useMe } from "@/lib/hooks";
import { DEMO_LABEL } from "@/lib/labels";

const EVENT_LABEL: Record<string, string> = {
  submitted: "Message forwarded by parent",
  ai_verdict: "AI verdict recorded",
  held: "Transfer put on HOLD (simulated)",
  guardian_alerted: "Guardian alerted",
  marked_safe: "Marked safe — no alert",
  blocked: "Guardian BLOCKED the transfer",
  released: "Guardian confirmed it is safe",
  failed: "AI analysis failed",
};

// Skeleton: warning record (audit timeline + export). Frontend owner restyles.
export default function CheckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { me, family } = useMe();
  const { check, events, loading } = useCheckAudit(id);
  const name = (uid: string | null) => family.find((m) => m.user_id === uid)?.display_name;

  function exportRecord() {
    const blob = new Blob([JSON.stringify({ check, events, exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warning-record-${id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (loading) return <main className="p-4">Loading…</main>;
  if (!check) return <main className="p-4">Not found</main>;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Warning record</h1>
      <CheckCard check={check} lang={me?.lang ?? "en"} />
      <ol className="flex flex-col gap-2 border-l-2 pl-4">
        {events.map((e) => (
          <li key={e.id}>
            <span className="font-mono text-sm">{new Date(e.created_at).toLocaleString("ko-KR")}</span>{" "}
            — {EVENT_LABEL[e.event_type]}
            {e.actor_type === "user" && name(e.actor_id) ? ` (${name(e.actor_id)})` : e.actor_type === "ai" ? " (AI)" : ""}
          </li>
        ))}
      </ol>
      <button onClick={exportRecord} className="self-start rounded-lg border-2 p-3">Export warning record (JSON)</button>
      <p className="text-xs text-zinc-500">{DEMO_LABEL}</p>
    </main>
  );
}
