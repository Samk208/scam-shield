"use client";
import { useEffect, useRef, useState } from "react";
import { BellRing, Phone, ShieldCheck, ShieldX, ThumbsUp } from "lucide-react";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { CheckCard } from "@/components/CheckCard";
import { FamilyCard, StatsStrip } from "@/components/Dashboard";
import { decideCheck, useFamilyChecks, useMe } from "@/lib/hooks";
import type { Decision } from "@/lib/types";

function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1175].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.3);
      o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.3);
    });
  } catch { /* audio blocked until user interacts: fine */ }
}

export default function GuardianPage() {
  const { me, family } = useMe();
  const { checks, loading } = useFamilyChecks(me?.family_id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parent = family.find((m) => m.role === "parent");
  const held = checks.filter((c) => c.status === "held");
  const others = checks.filter((c) => c.status !== "held");
  const seen = useRef<Set<string> | null>(null);

  // Chime when a NEW held check arrives live.
  useEffect(() => {
    if (loading) return;
    const ids = new Set(held.map((c) => c.id));
    if (seen.current && [...ids].some((id) => !seen.current!.has(id))) chime();
    seen.current = ids;
  }, [held, loading]);

  async function decide(id: string, d: Decision) {
    setBusyId(id);
    setError(null);
    const r = await decideCheck(id, d);
    setBusyId(null);
    if (r.error) setError(r.error);
  }

  return (
    <>
      <AppHeader me={me} subtitle={me ? `${me.display_name} · protecting ${parent?.display_name ?? "Mom"}` : undefined} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 p-4">
        <FamilyCard family={family} held={held.length > 0} />
        <StatsStrip checks={checks} lang="en" />
        {held.length > 0 ? (
          <div className="ss-pop flex items-center gap-3 rounded-2xl bg-danger p-4 text-white shadow-md" role="alert">
            <BellRing className="size-7 shrink-0" />
            <p className="font-bold">
              {held[0].transfer
                ? `${parent?.display_name ?? "Mom"} is trying to send ₩${held[0].transfer.amount.toLocaleString("en-US")} to a new account. Her bank paused it until you decide.`
                : `${parent?.display_name ?? "Mom"} forwarded a likely scam. Any transfer is on hold until you decide.`}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm">
            <ShieldCheck className="size-7 shrink-0 text-safe" />
            <p><span className="font-semibold">All clear.</span> Her bank checks every large transfer with Scam Shield. You&apos;ll be alerted the moment one looks like a scam.</p>
          </div>
        )}

        {error && <p className="text-danger" role="alert">{error}</p>}

        {held.map((c) => (
          <CheckCard key={c.id} check={c} lang="en">
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={busyId === c.id} onClick={() => decide(c.id, "block")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-danger-ink text-lg font-bold text-white shadow active:scale-[.98] disabled:opacity-50">
                <ShieldX className="size-5" /> Block transfer
              </button>
              <button disabled={busyId === c.id} onClick={() => decide(c.id, "release")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface font-semibold active:scale-[.98] disabled:opacity-50">
                <ThumbsUp className="size-5" /> It&apos;s really me / fine
              </button>
              <a href="tel:"className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface font-semibold">
                <Phone className="size-5" /> Call Mom now
              </a>
            </div>
            <p className="mt-2 text-xs text-muted">Only you can release a hold. The AI can hold money, never release it.</p>
          </CheckCard>
        ))}

        {others.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">Recent activity</h2>
            {others.map((c) => <CheckCard key={c.id} check={c} lang="en" compact />)}
          </section>
        )}
      </main>
      <DemoFooter />
    </>
  );
}
