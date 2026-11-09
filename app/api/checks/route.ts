import { NextResponse } from "next/server";
import { z } from "zod";
import { getMe, rateLimited } from "@/lib/server/auth";
import {
  getDemoCheck,
  isSupabaseConfigured,
  listDemoChecks,
  listDemoEvents,
} from "@/lib/server/demo-store";
import { processCheck } from "@/lib/server/pipeline";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const body = z.object({
  channel: z.enum(["sms", "kakao", "call_transcript"]),
  content: z.string().trim().min(1).max(4000),
});

export async function GET(req: Request) {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const checkId = searchParams.get("checkId");

  if (!isSupabaseConfigured()) {
    if (checkId) {
      const check = getDemoCheck(checkId);
      const events = check ? listDemoEvents(checkId) : [];
      return NextResponse.json({ check, events });
    }
    return NextResponse.json({ checks: listDemoChecks(auth.me.family_id) });
  }

  const supabase = await createClient();
  if (checkId) {
    const [c, e] = await Promise.all([
      supabase.from("checks").select("*").eq("id", checkId).maybeSingle(),
      supabase.from("audit_events").select("*").eq("check_id", checkId).order("created_at"),
    ]);
    return NextResponse.json({ check: c.data ?? null, events: e.data ?? [] });
  }

  const { data: checks } = await supabase
    .from("checks")
    .select("*")
    .eq("family_id", auth.me.family_id)
    .order("created_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ checks: checks ?? [] });
}

// Fallback trigger: a family member forwards a suspicious message.
export async function POST(req: Request) {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });
  if (rateLimited(auth.userId)) return NextResponse.json({ error: "Too many checks, wait a minute" }, { status: 429 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { check, error } = await processCheck({ familyId: auth.me.family_id, userId: auth.userId, ...parsed.data });
  if (!check) return NextResponse.json({ error }, { status: 500 });
  return error ? NextResponse.json({ error, check }, { status: 502 }) : NextResponse.json({ check }, { status: 201 });
}
