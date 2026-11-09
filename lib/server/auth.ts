import "server-only";
import { cookies, headers } from "next/headers";
import { DEMO_ROLE_COOKIE, getDemoAuthByRole, isSupabaseConfigured } from "@/lib/server/demo-store";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

// Returns the caller's membership, or null if not logged in / not in a family.
export async function getMe(): Promise<{ userId: string; me: Member } | null> {
  if (!isSupabaseConfigured()) {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const role =
      headerStore.get("x-demo-role") ||
      cookieStore.get(DEMO_ROLE_COOKIE)?.value ||
      "parent";
    return getDemoAuthByRole(role);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("family_members")
    .select("family_id,user_id,role,display_name,lang")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { userId: user.id, me: data as Member };
}

// ponytail: in-memory per-user limiter, resets per serverless instance; use Upstash/DB if this outlives the demo.
const hits = new Map<string, number[]>();
export function rateLimited(userId: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > max;
}
