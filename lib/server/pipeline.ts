import "server-only";
import { runAgent } from "@/lib/server/agent";
import {
  hasRecentSuspiciousDemoCheck,
  insertDemoAudit,
  insertDemoCheck,
  isSupabaseConfigured,
  updateDemoCheck,
} from "@/lib/server/demo-store";
import { createServiceClient } from "@/lib/supabase/server";
import type { AuditEventType, Channel, Check, Transfer } from "@/lib/types";

// One pipeline for every trigger (forwarded message or bank transfer): save -> agent -> hold/safe -> audit.
// Caller must already have verified the user's family membership.
export async function processCheck(opts: {
  familyId: string;
  userId: string;
  channel: Channel;
  content: string;
  transfer?: Transfer;
}): Promise<{ check: Check | null; error?: string }> {
  const { familyId, userId, channel, content, transfer } = opts;

  if (!isSupabaseConfigured()) {
    const recentSuspicious = transfer ? hasRecentSuspiciousDemoCheck(familyId) : false;
    const created = insertDemoCheck({
      family_id: familyId,
      submitted_by: userId,
      channel,
      content,
      transfer: transfer ?? null,
    });
    insertDemoAudit({
      family_id: familyId,
      check_id: created.id,
      event_type: "submitted",
      actor_type: transfer ? "system" : "user",
      actor_id: transfer ? null : userId,
    });

    try {
      const { verdict, action, indicators, trace } = await runAgent(
        channel,
        content,
        transfer ? { t: transfer, recentSuspicious } : undefined,
      );
      const held = action === "hold_and_alert";
      const check = updateDemoCheck(created.id, {
        ...verdict,
        indicators,
        agent_trace: trace,
        status: held ? "held" : "safe",
      });
      insertDemoAudit({ family_id: familyId, check_id: created.id, event_type: "ai_verdict", actor_type: "ai" });
      if (held) {
        insertDemoAudit({ family_id: familyId, check_id: created.id, event_type: "held", actor_type: "system" });
        insertDemoAudit({
          family_id: familyId,
          check_id: created.id,
          event_type: "guardian_alerted",
          actor_type: "system",
        });
      } else {
        insertDemoAudit({ family_id: familyId, check_id: created.id, event_type: "marked_safe", actor_type: "system" });
      }
      return { check };
    } catch (e) {
      console.error("analyze failed", e);
      const check = updateDemoCheck(created.id, { status: "failed", error: "AI analysis failed" });
      insertDemoAudit({ family_id: familyId, check_id: created.id, event_type: "failed", actor_type: "system" });
      return { check, error: "AI analysis failed" };
    }
  }

  const db = createServiceClient();
  const audit = (
    check_id: string,
    event_type: AuditEventType,
    actor_type: "user" | "ai" | "system",
    actor_id: string | null = null,
  ) => db.from("audit_events").insert({ family_id: familyId, check_id, event_type, actor_type, actor_id });

  // Bank trigger context: was there a suspicious contact for this family in the last 24h?
  let recentSuspicious = false;
  if (transfer) {
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count } = await db
      .from("checks")
      .select("id", { count: "exact", head: true })
      .eq("family_id", familyId)
      .gte("created_at", since)
      .gte("risk_score", 60);
    recentSuspicious = (count ?? 0) > 0;
  }

  const { data: created, error } = await db
    .from("checks")
    .insert({ family_id: familyId, submitted_by: userId, channel, content, transfer: transfer ?? null })
    .select()
    .single();
  if (error || !created) return { check: null, error: "Could not save check" };
  await audit(created.id, "submitted", transfer ? "system" : "user", transfer ? null : userId);

  try {
    const { verdict, action, indicators, trace } = await runAgent(
      channel,
      content,
      transfer ? { t: transfer, recentSuspicious } : undefined,
    );
    const held = action === "hold_and_alert";
    const { data: check } = await db
      .from("checks")
      .update({
        ...verdict,
        indicators,
        agent_trace: trace,
        status: held ? "held" : "safe",
        updated_at: new Date().toISOString(),
      })
      .eq("id", created.id)
      .select()
      .single();
    await audit(created.id, "ai_verdict", "ai");
    if (held) {
      await audit(created.id, "held", "system");
      await audit(created.id, "guardian_alerted", "system");
    } else {
      await audit(created.id, "marked_safe", "system");
    }
    return { check: check as Check };
  } catch (e) {
    console.error("analyze failed", e);
    const { data: check } = await db
      .from("checks")
      .update({ status: "failed", error: "AI analysis failed", updated_at: new Date().toISOString() })
      .eq("id", created.id)
      .select()
      .single();
    await audit(created.id, "failed", "system");
    return { check: check as Check, error: "AI analysis failed" };
  }
}
