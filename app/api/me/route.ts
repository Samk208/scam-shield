import { NextResponse } from "next/server";
import { getMe } from "@/lib/server/auth";
import { DEMO_ROLE_COOKIE, getDemoFamily, isSupabaseConfigured, resetDemoStore } from "@/lib/server/demo-store";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ me: auth.me, family: getDemoFamily(), demoMode: true });
  }

  const supabase = await createClient();
  const { data: family } = await supabase
    .from("family_members")
    .select("family_id,user_id,role,display_name,lang")
    .eq("family_id", auth.me.family_id);
  return NextResponse.json({ me: auth.me, family: family ?? [] });
}

// Local Demo session switcher (used when .env.local Supabase credentials are not present).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    role?: "parent" | "guardian";
    action?: "signout" | "reset";
  };

  if (body.action === "reset") {
    if (!isSupabaseConfigured()) resetDemoStore();
    return NextResponse.json({ ok: true });
  }

  if (body.action === "signout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(DEMO_ROLE_COOKIE);
    return res;
  }

  const role: "parent" | "guardian" =
    body.role ?? (body.email?.toLowerCase().includes("joon") ? "guardian" : "parent");

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(DEMO_ROLE_COOKIE, role, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
