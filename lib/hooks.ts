"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuditEvent, Check, CheckResponse, ApiError, Channel, Decision, Member, MeResponse } from "@/lib/types";

export const HAS_PUBLIC_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const SYNC_CHANNEL = "scam-shield-sync";

function broadcastSync() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  try {
    const bc = new BroadcastChannel(SYNC_CHANNEL);
    bc.postMessage("sync");
    bc.close();
  } catch {
    /* ignore */
  }
}

function inferClientDemoRole(): "parent" | "guardian" | undefined {
  if (typeof window === "undefined" || HAS_PUBLIC_SUPABASE) return undefined;
  if (window.location.pathname.startsWith("/guardian")) return "guardian";
  if (window.location.pathname.startsWith("/parent")) return "parent";
  return undefined;
}

export function useSupabase() {
  return useMemo(() => (HAS_PUBLIC_SUPABASE ? createClient() : null), []);
}

export function useMe() {
  const [state, setState] = useState<{ me: Member | null; family: Member[]; loading: boolean; error: string | null }>(
    { me: null, family: [], loading: true, error: null },
  );
  useEffect(() => {
    let alive = true;
    const demoRole = inferClientDemoRole();
    fetch("/api/me", {
      headers: demoRole ? { "x-demo-role": demoRole } : undefined,
    })
      .then(async (r) => {
        const j = (await r.json()) as MeResponse & ApiError;
        if (!alive) return;
        setState(r.ok ? { me: j.me, family: j.family, loading: false, error: null } : { me: null, family: [], loading: false, error: j.error });
      })
      .catch(() => {
        if (alive) setState({ me: null, family: [], loading: false, error: "Network error" });
      });
    return () => { alive = false; };
  }, []);
  return state;
}

function upsert<T extends { id: string }>(list: T[], row: T, newestFirst: boolean) {
  const rest = list.filter((x) => x.id !== row.id);
  return newestFirst ? [row, ...rest] : [...rest, row];
}

// Live list of the family's checks, newest first. Postgres is the source of truth; Realtime just notifies.
export function useFamilyChecks(familyId: string | undefined) {
  const supabase = useSupabase();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    let alive = true;

    if (!supabase) {
      const loadDemo = () =>
        fetch("/api/checks")
          .then((r) => r.json())
          .then((j: { checks?: Check[] }) => {
            if (alive) {
              setChecks(j.checks ?? []);
              setLoading(false);
            }
          })
          .catch(() => {
            if (alive) setLoading(false);
          });

      loadDemo();
      const timer = setInterval(loadDemo, 2000);
      let bc: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel(SYNC_CHANNEL);
        bc.onmessage = () => loadDemo();
      }
      return () => {
        alive = false;
        clearInterval(timer);
        bc?.close();
      };
    }

    const load = () =>
      supabase.from("checks").select("*").eq("family_id", familyId).order("created_at", { ascending: false }).limit(50)
        .then(({ data }) => {
          if (alive) {
            setChecks((data as Check[]) ?? []);
            setLoading(false);
          }
        });
    load();
    const channel = supabase
      .channel(`checks:${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "checks", filter: `family_id=eq.${familyId}` },
        (p) => setChecks((prev) => upsert(prev, p.new as Check, true)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))))
      .subscribe((status) => { if (status === "SUBSCRIBED") load(); });
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [familyId, supabase]);

  return { checks, loading: familyId ? loading : false };
}

// One check plus its audit timeline, live.
export function useCheckAudit(checkId: string | undefined) {
  const supabase = useSupabase();
  const [check, setCheck] = useState<Check | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkId) return;
    let alive = true;

    if (!supabase) {
      const loadDemo = () =>
        fetch(`/api/checks?checkId=${encodeURIComponent(checkId)}`)
          .then((r) => r.json())
          .then((j: { check?: Check | null; events?: AuditEvent[] }) => {
            if (alive) {
              setCheck(j.check ?? null);
              setEvents(j.events ?? []);
              setLoading(false);
            }
          })
          .catch(() => {
            if (alive) setLoading(false);
          });

      loadDemo();
      const timer = setInterval(loadDemo, 2000);
      let bc: BroadcastChannel | null = null;
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel(SYNC_CHANNEL);
        bc.onmessage = () => loadDemo();
      }
      return () => {
        alive = false;
        clearInterval(timer);
        bc?.close();
      };
    }

    const load = async () => {
      const [c, e] = await Promise.all([
        supabase.from("checks").select("*").eq("id", checkId).maybeSingle(),
        supabase.from("audit_events").select("*").eq("check_id", checkId).order("created_at"),
      ]);
      if (!alive) return;
      setCheck((c.data as Check) ?? null);
      setEvents((e.data as AuditEvent[]) ?? []);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel(`check:${checkId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "checks", filter: `id=eq.${checkId}` },
        (p) => setCheck(p.new as Check))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_events", filter: `check_id=eq.${checkId}` },
        (p) => setEvents((prev) => upsert(prev, p.new as AuditEvent, false)))
      .subscribe((status) => { if (status === "SUBSCRIBED") load(); });
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [checkId, supabase]);

  return { check, events, loading: checkId ? loading : false };
}

// API calls. Return { check } or { error }.
export async function submitCheck(channel: Channel, content: string): Promise<{ check?: Check; error?: string }> {
  const r = await fetch("/api/checks", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "parent" },
    body: JSON.stringify({ channel, content }),
  });
  const j = (await r.json().catch(() => ({ error: "Bad response" }))) as CheckResponse & ApiError;
  broadcastSync();
  return r.ok ? { check: j.check } : { error: j.error, check: j.check };
}

export async function decideCheck(id: string, decision: Decision): Promise<{ check?: Check; error?: string }> {
  const r = await fetch(`/api/checks/${id}/decision`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "guardian" },
    body: JSON.stringify({ decision }),
  });
  const j = (await r.json().catch(() => ({ error: "Bad response" }))) as CheckResponse & ApiError;
  broadcastSync();
  return r.ok ? { check: j.check } : { error: j.error };
}

// Automatic trigger (simulated bank app): the bank screens the transfer through Scam Shield.
export async function submitTransfer(t: import("@/lib/types").Transfer): Promise<{ check?: Check; error?: string }> {
  const r = await fetch("/api/transfers", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "parent" },
    body: JSON.stringify(t),
  });
  const j = (await r.json().catch(() => ({ error: "Bad response" }))) as CheckResponse & ApiError;
  broadcastSync();
  return r.ok ? { check: j.check } : { error: j.error, check: j.check };
}

export async function triggerDemoReset(): Promise<void> {
  await fetch("/api/me", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "reset" }),
  }).catch(() => {});
  broadcastSync();
}
