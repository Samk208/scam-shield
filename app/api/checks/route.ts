import { NextResponse } from "next/server";
import { z } from "zod";
import { getMe, rateLimited } from "@/lib/server/auth";
import { processCheck } from "@/lib/server/pipeline";

export const maxDuration = 60;

const body = z.object({
  channel: z.enum(["sms", "kakao", "call_transcript"]),
  content: z.string().trim().min(1).max(4000),
});

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
