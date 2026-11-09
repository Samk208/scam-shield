import { NextResponse } from "next/server";
import { z } from "zod";
import { getMe } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";

const body = z.object({ decision: z.enum(["block", "release"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });
  if (auth.me.role !== "guardian") return NextResponse.json({ error: "Only a guardian can decide" }, { status: 403 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const db = createServiceClient();
  const status = parsed.data.decision === "block" ? "blocked" : "released";

  // Compare-and-swap: only a held check in the caller's own family can be decided, exactly once.
  const { data: check } = await db
    .from("checks")
    .update({ status, decided_by: auth.userId, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("family_id", auth.me.family_id)
    .eq("status", "held")
    .select()
    .maybeSingle();

  if (!check) {
    const { data: exists } = await db.from("checks").select("id").eq("id", id).eq("family_id", auth.me.family_id).maybeSingle();
    return exists
      ? NextResponse.json({ error: "Already decided or not on hold" }, { status: 409 })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.from("audit_events").insert({
    family_id: auth.me.family_id, check_id: id, actor_id: auth.userId, actor_type: "user", event_type: status,
  });
  return NextResponse.json({ check });
}
