"use client";
import { useState } from "react";
import { CheckCard } from "@/components/CheckCard";
import { decideCheck, useFamilyChecks, useMe } from "@/lib/hooks";
import { DEMO_LABEL } from "@/lib/labels";
import type { Decision } from "@/lib/types";

// Skeleton: adult child's screen. Live alerts + Block/Release. Frontend owner restyles.
export default function GuardianPage() {
  const { me, family } = useMe();
  const { checks } = useFamilyChecks(me?.family_id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parent = family.find((m) => m.role === "parent");
  const held = checks.filter((c) => c.status === "held");

  async function decide(id: string, d: Decision) {
    setBusyId(id);
    setError(null);
    const r = await decideCheck(id, d);
    setBusyId(null);
    if (r.error) setError(r.error);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">🛡️ Family guard — {parent?.display_name ?? "Parent"}</h1>
      {held.length > 0 && (
        <p className="rounded-lg bg-red-600 p-3 font-bold text-white">
          ⚠️ {held.length} transfer{held.length > 1 ? "s" : ""} on hold — your decision needed
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      <section className="flex flex-col gap-3">
        {checks.map((c) => (
          <CheckCard key={c.id} check={c} lang="en">
            {c.status === "held" && (
              <div className="mt-3 flex gap-2">
                <button disabled={busyId === c.id} onClick={() => decide(c.id, "block")}
                  className="flex-1 rounded-lg bg-red-700 p-3 font-bold text-white disabled:opacity-50">Block</button>
                <button disabled={busyId === c.id} onClick={() => decide(c.id, "release")}
                  className="flex-1 rounded-lg border-2 border-zinc-400 p-3 font-semibold disabled:opacity-50">It&apos;s really fine</button>
                <a href="tel:" className="rounded-lg border-2 border-zinc-400 p-3">📞 Call Mom</a>
              </div>
            )}
          </CheckCard>
        ))}
      </section>
      <p className="text-xs text-zinc-500">{DEMO_LABEL}</p>
    </main>
  );
}
