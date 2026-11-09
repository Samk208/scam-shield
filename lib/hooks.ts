"use client";
import { useEffect, useMemo, useState } from "react";
import { fixtureChecks, fixtureEvents } from "@/lib/fixtures";
import { createClient } from "@/lib/supabase/client";
import type {
  ApiError,
  AuditEvent,
  Channel,
  Check,
  CheckResponse,
  Decision,
  Member,
  MeResponse,
  Transfer,
} from "@/lib/types";

export const HAS_PUBLIC_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "YBnlWRMGMdAU";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

export async function ensureDemoSession(role: "parent" | "guardian"): Promise<boolean> {
  if (!HAS_PUBLIC_SUPABASE) {
    await fetch("/api/me", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    }).catch(() => {});
    return true;
  }
  const email = role === "guardian" ? "joon@scamshield.test" : "mom@scamshield.test";
  const { error } = await createClient().auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  });
  return !error;
}

export function useSupabase() {
  return useMemo(() => (HAS_PUBLIC_SUPABASE ? createClient() : null), []);
}

export function useMe() {
  const [state, setState] = useState<{
    me: Member | null;
    family: Member[];
    loading: boolean;
    error: string | null;
  }>({ me: null, family: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;
    const demoRole = inferClientDemoRole();
    fetch("/api/me", {
      headers: demoRole ? { "x-demo-role": demoRole } : undefined,
    })
      .then(async (r) => {
        const j = (await r.json()) as MeResponse & ApiError;
        if (!alive) return;
        setState(
          r.ok
            ? { me: j.me, family: j.family, loading: false, error: null }
            : { me: null, family: [], loading: false, error: j.error },
        );
      })
      .catch(() => {
        if (alive) setState({ me: null, family: [], loading: false, error: "Network error" });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function upsert<T extends { id: string }>(list: T[], row: T, newestFirst: boolean) {
  const rest = list.filter((x) => x.id !== row.id);
  return newestFirst ? [row, ...rest] : [...rest, row];
}

// Normalizes any legacy 30M demo row in Supabase into the realistic 2.8M sub-limit transfer.
function normalizeLegacyCheck(c: Check): Check {
  if (c.transfer?.amount === 30_000_000 || c.content.includes("30,000,000원")) {
    return {
      ...c,
      content: c.content.replace(/30,000,000원/g, "2,800,000원"),
      transfer: c.transfer ? { ...c.transfer, amount: 2_800_000 } : c.transfer,
      explanation_ko:
        "검찰·금감원을 사칭해 300만 원 한도 직전 금액(280만 원)을 '안전계좌'로 유도하는 전형적인 수법입니다. 자녀 확인 전까지 출금이 보류되었습니다.",
      explanation_en:
        "Classic prosecutor-impersonation transfer (₩2.8M, right below the ₩3M mobile limit) to a fake 'safe account'. Paused until family confirms.",
      red_flags: [
        "'안전계좌' 수취인 지정 — 공공·금융기관은 안전계좌를 운영하지 않습니다.",
        "이체 메모 '수사관 지시' — 검찰·금감원은 계좌 이체를 지시하지 않습니다.",
        "신규 계좌 280만 원 송금 (1회 모바일 한도 300만 원 회피 패턴)",
      ],
      indicators:
        c.indicators && Array.isArray((c.indicators as { amounts?: string[] }).amounts)
          ? {
              ...(c.indicators as import("@/lib/types").Indicators),
              amounts: (c.indicators as import("@/lib/types").Indicators).amounts.map((a) =>
                a === "30,000,000원" ? "2,800,000원" : a,
              ),
            }
          : c.indicators,
    };
  }
  return c;
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
              setChecks((j.checks ?? []).map(normalizeLegacyCheck));
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
      supabase
        .from("checks")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          if (alive) {
            setChecks(((data as Check[]) ?? []).map(normalizeLegacyCheck));
            setLoading(false);
          }
        });
    load();
    const channel = supabase
      .channel(`checks:${familyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checks", filter: `family_id=eq.${familyId}` },
        (p) =>
          setChecks((prev) =>
            upsert(prev, normalizeLegacyCheck(p.new as Check), true).sort((a, b) =>
              b.created_at.localeCompare(a.created_at),
            ),
          ),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") load();
      });
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [familyId, supabase]);

  return { checks, loading: familyId ? loading : false };
}

// One check plus its audit timeline, live. Supports both UUID DB rows and canonical fixture IDs (c-held, c-safe).
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

    // In Supabase mode, if the caller navigated to a non-UUID fixture link like /checks/c-held,
    // load the latest real check from Supabase if signed in, or fall back to the fixture record.
    if (!UUID_RE.test(checkId)) {
      const loadFixtureOrLatest = async () => {
        const { data: latestRows } = await supabase
          .from("checks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        const latestReal = (latestRows?.[0] as Check | undefined) ?? null;
        if (latestReal) {
          const { data: realEvents } = await supabase
            .from("audit_events")
            .select("*")
            .eq("check_id", latestReal.id)
            .order("created_at");
          if (alive) {
            setCheck(normalizeLegacyCheck(latestReal));
            setEvents((realEvents as AuditEvent[]) ?? []);
            setLoading(false);
          }
          return;
        }
        const fallbackCheck =
          fixtureChecks.find((c) => c.id === checkId) ?? fixtureChecks[0] ?? null;
        const fallbackEvents = fallbackCheck
          ? fixtureEvents.filter((e) => e.check_id === fallbackCheck.id)
          : [];
        if (alive) {
          setCheck(fallbackCheck);
          setEvents(fallbackEvents);
          setLoading(false);
        }
      };
      void loadFixtureOrLatest();
      return () => {
        alive = false;
      };
    }

    const load = async () => {
      const [c, e] = await Promise.all([
        supabase.from("checks").select("*").eq("id", checkId).maybeSingle(),
        supabase.from("audit_events").select("*").eq("check_id", checkId).order("created_at"),
      ]);
      if (!alive) return;
      setCheck(c.data ? normalizeLegacyCheck(c.data as Check) : null);
      setEvents((e.data as AuditEvent[]) ?? []);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel(`check:${checkId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checks", filter: `id=eq.${checkId}` },
        (p) => setCheck(p.new as Check),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_events",
          filter: `check_id=eq.${checkId}`,
        },
        (p) => setEvents((prev) => upsert(prev, p.new as AuditEvent, false)),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") load();
      });
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [checkId, supabase]);

  return { check, events, loading: checkId ? loading : false };
}

// API calls. Return { check } or { error }.
export async function submitCheck(
  channel: Channel,
  content: string,
): Promise<{ check?: Check; error?: string }> {
  let r = await fetch("/api/checks", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "parent" },
    body: JSON.stringify({ channel, content }),
  });
  if ((r.status === 401 || r.status === 403) && HAS_PUBLIC_SUPABASE) {
    const switched = await ensureDemoSession("parent");
    if (switched) {
      r = await fetch("/api/checks", {
        method: "POST",
        headers: { "content-type": "application/json", "x-demo-role": "parent" },
        body: JSON.stringify({ channel, content }),
      });
    }
  }
  const j = (await r.json().catch(() => ({ error: "Bad response" }))) as CheckResponse & ApiError;
  broadcastSync();
  return r.ok ? { check: j.check } : { error: j.error, check: j.check };
}

export async function decideCheck(
  id: string,
  decision: Decision,
): Promise<{ check?: Check; error?: string }> {
  let r = await fetch(`/api/checks/${id}/decision`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "guardian" },
    body: JSON.stringify({ decision }),
  });
  if ((r.status === 401 || r.status === 403) && HAS_PUBLIC_SUPABASE) {
    const switched = await ensureDemoSession("guardian");
    if (switched) {
      r = await fetch(`/api/checks/${id}/decision`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-demo-role": "guardian" },
        body: JSON.stringify({ decision }),
      });
    }
  }
  const j = (await r.json().catch(() => ({ error: "Bad response" }))) as CheckResponse & ApiError;
  broadcastSync();
  return r.ok ? { check: j.check } : { error: j.error };
}

// Automatic trigger (simulated bank app): the bank screens the transfer through Scam Shield.
export async function submitTransfer(
  t: Transfer,
): Promise<{ check?: Check; error?: string }> {
  let r = await fetch("/api/transfers", {
    method: "POST",
    headers: { "content-type": "application/json", "x-demo-role": "parent" },
    body: JSON.stringify(t),
  });
  if ((r.status === 401 || r.status === 403) && HAS_PUBLIC_SUPABASE) {
    const switched = await ensureDemoSession("parent");
    if (switched) {
      r = await fetch("/api/transfers", {
        method: "POST",
        headers: { "content-type": "application/json", "x-demo-role": "parent" },
        body: JSON.stringify(t),
      });
    }
  }
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
