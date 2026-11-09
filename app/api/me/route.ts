import { NextResponse } from "next/server";
import { getMe } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const auth = await getMe();
  if (!auth) return NextResponse.json({ error: "Not signed in or not in a family" }, { status: 401 });
  const supabase = await createClient();
  const { data: family } = await supabase
    .from("family_members")
    .select("family_id,user_id,role,display_name,lang")
    .eq("family_id", auth.me.family_id);
  return NextResponse.json({ me: auth.me, family: family ?? [] });
}
