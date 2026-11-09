import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeMessage } from "@/lib/server/analyze";
import { getMe, rateLimited } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { HOLD_THRESHOLD, type AuditEventType } from "@/lib/types";

export const maxDuration = 60;

const body = z.object({
  channel: z.enum(["sms", "kakao", "call_transcript"]),
  content: z.string().trim().min(1).max(4000),
});

export async function POST(req: Request) {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });
  if (rateLimited(auth.userId)) return NextResponse.json({ error: "Too many checks, wait a minute" }, { status: 429 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const db = createServiceClient();
  const familyId = auth.me.family_id;
  const audit = (check_id: string, event_type: AuditEventType, actor_type: "user" | "ai" | "system", actor_id: string | null = null) =>
    db.from("audit_events").insert({ family_id: familyId, check_id, event_type, actor_type, actor_id });

  const { data: created, error } = await db
    .from("checks")
    .insert({ family_id: familyId, submitted_by: auth.userId, ...parsed.data })
    .select()
    .single();
  if (error || !created) return NextResponse.json({ error: "Could not save check" }, { status: 500 });
  await audit(created.id, "submitted", "user", auth.userId);

  try {
    const v = await analyzeMessage(parsed.data.channel, parsed.data.content);
    const held = v.risk_score >= HOLD_THRESHOLD;
    const { data: check } = await db
      .from("checks")
      .update({ ...v, status: held ? "held" : "safe", updated_at: new Date().toISOString() })
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
    return NextResponse.json({ check }, { status: 201 });
  } catch (e) {
    console.error("analyze failed", e);
    const { data: check } = await db
      .from("checks")
      .update({ status: "failed", error: "AI analysis failed", updated_at: new Date().toISOString() })
      .eq("id", created.id)
      .select()
      .single();
    await audit(created.id, "failed", "system");
    return NextResponse.json({ error: "AI analysis failed", check }, { status: 502 });
  }
}
