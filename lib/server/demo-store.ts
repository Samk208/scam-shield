import "server-only";
import { FAMILY_ID, fixtureChecks, fixtureEvents, fixtureMembers } from "@/lib/fixtures";
import type { AuditEvent, AuditEventType, Check, Member } from "@/lib/types";

export const DEMO_ROLE_COOKIE = "scam_shield_demo_role";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

interface DemoStore {
  checks: Check[];
  events: AuditEvent[];
  members: Member[];
}

const globalForDemo = globalThis as unknown as { __scamShieldDemoStore?: DemoStore };

function getStore(): DemoStore {
  if (
    !globalForDemo.__scamShieldDemoStore ||
    globalForDemo.__scamShieldDemoStore.checks.some((c) => c.content.includes("????"))
  ) {
    globalForDemo.__scamShieldDemoStore = {
      checks: structuredClone(fixtureChecks),
      events: structuredClone(fixtureEvents),
      members: structuredClone(fixtureMembers),
    };
  }
  return globalForDemo.__scamShieldDemoStore;
}

export function getDemoAuthByRole(role: string | undefined): { userId: string; me: Member } | null {
  const store = getStore();
  if (role === "parent") {
    const me = store.members.find((m) => m.role === "parent")!;
    return { userId: me.user_id, me };
  }
  if (role === "guardian") {
    const me = store.members.find((m) => m.role === "guardian")!;
    return { userId: me.user_id, me };
  }
  return null;
}

export function getDemoFamily(): Member[] {
  return getStore().members;
}

export function resetDemoStore(): void {
  globalForDemo.__scamShieldDemoStore = {
    checks: structuredClone(fixtureChecks),
    events: structuredClone(fixtureEvents),
    members: structuredClone(fixtureMembers),
  };
}

export function listDemoChecks(familyId = FAMILY_ID): Check[] {
  return getStore()
    .checks.filter((c) => c.family_id === familyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDemoCheck(id: string): Check | null {
  return getStore().checks.find((c) => c.id === id) ?? null;
}

export function listDemoEvents(checkId: string): AuditEvent[] {
  return getStore()
    .events.filter((e) => e.check_id === checkId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function hasRecentSuspiciousDemoCheck(familyId: string): boolean {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  return getStore().checks.some(
    (c) => c.family_id === familyId && c.created_at >= since && (c.risk_score ?? 0) >= 60,
  );
}

export function insertDemoCheck(data: {
  family_id: string;
  submitted_by: string;
  channel: Check["channel"];
  content: string;
  transfer: Check["transfer"];
}): Check {
  const now = new Date().toISOString();
  const check: Check = {
    id: `c-${crypto.randomUUID().slice(0, 8)}`,
    family_id: data.family_id,
    submitted_by: data.submitted_by,
    channel: data.channel,
    content: data.content,
    status: "analyzing",
    risk_score: null,
    scam_type: null,
    red_flags: [],
    explanation_ko: null,
    explanation_en: null,
    safe_action_ko: null,
    decided_by: null,
    decided_at: null,
    error: null,
    agent_trace: [],
    transfer: data.transfer,
    indicators: {},
    created_at: now,
    updated_at: now,
  };
  getStore().checks.unshift(check);
  return check;
}

export function updateDemoCheck(id: string, patch: Partial<Check>): Check | null {
  const store = getStore();
  const idx = store.checks.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated: Check = {
    ...store.checks[idx],
    ...patch,
    updated_at: patch.updated_at ?? new Date().toISOString(),
  };
  store.checks[idx] = updated;
  return updated;
}

export function decideDemoCheckCas(opts: {
  id: string;
  familyId: string;
  userId: string;
  status: "blocked" | "released";
}): { check: Check | null; exists: boolean } {
  const store = getStore();
  const idx = store.checks.findIndex((c) => c.id === opts.id && c.family_id === opts.familyId);
  if (idx === -1) return { check: null, exists: false };
  const target = store.checks[idx];
  if (target.status !== "held") {
    return { check: null, exists: true };
  }
  const now = new Date().toISOString();
  const updated: Check = {
    ...target,
    status: opts.status,
    decided_by: opts.userId,
    decided_at: now,
    updated_at: now,
  };
  store.checks[idx] = updated;
  return { check: updated, exists: true };
}

export function insertDemoAudit(data: {
  family_id: string;
  check_id: string;
  event_type: AuditEventType;
  actor_type: "user" | "ai" | "system";
  actor_id?: string | null;
}): AuditEvent {
  const ev: AuditEvent = {
    id: `e-${crypto.randomUUID().slice(0, 8)}`,
    family_id: data.family_id,
    check_id: data.check_id,
    actor_id: data.actor_id ?? null,
    actor_type: data.actor_type,
    event_type: data.event_type,
    created_at: new Date().toISOString(),
  };
  getStore().events.push(ev);
  return ev;
}

