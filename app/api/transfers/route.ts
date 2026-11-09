import { NextResponse } from "next/server";
import { z } from "zod";
import { getMe, rateLimited } from "@/lib/server/auth";
import { processCheck } from "@/lib/server/pipeline";

export const maxDuration = 60;

const body = z.object({
  amount: z.number().int().positive().max(10_000_000_000),
  payee_name: z.string().trim().min(1).max(100),
  payee_account: z.string().trim().min(1).max(40),
  new_payee: z.boolean(),
  memo: z.string().trim().max(200).default(""),
});

/**
 * PRIMARY (automatic) trigger: the bank calls this when a protected customer starts a transfer.
 * Mom does not have to recognise the scam. Demo: called by a simulated bank app with the parent's
 * session. Production: called server-to-server by the bank with its own credentials.
 */
export async function POST(req: Request) {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });
  if (auth.me.role !== "parent") return NextResponse.json({ error: "Only the protected customer's account can transfer" }, { status: 403 });
  if (rateLimited(auth.userId)) return NextResponse.json({ error: "Too many requests, wait a minute" }, { status: 429 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const t = parsed.data;

  const content = `[은행 이체 시도] ${t.amount.toLocaleString("ko-KR")}원 → ${t.payee_name} (${t.payee_account})` +
    `${t.new_payee ? " · 처음 보내는 계좌" : ""}${t.memo ? ` · 메모: ${t.memo}` : ""}`;

  const { check, error } = await processCheck({ familyId: auth.me.family_id, userId: auth.userId, channel: "bank_transfer", content, transfer: t });
  if (!check) return NextResponse.json({ error }, { status: 500 });
  return error ? NextResponse.json({ error, check }, { status: 502 }) : NextResponse.json({ check }, { status: 201 });
}
