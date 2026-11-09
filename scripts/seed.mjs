// Creates the two demo accounts and their family. Run: pnpm seed  (reads .env.local)
// Uses the service-role key; server/dev machine only.
import { createClient } from "@supabase/supabase-js";

const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, SEED_PASSWORD: password } = process.env;
const parentEmail = process.env.SEED_PARENT_EMAIL || "mom@scamshield.test";
const guardianEmail = process.env.SEED_GUARDIAN_EMAIL || "joon@scamshield.test";
if (!url || !key || !password) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function ensureUser(email) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  const found = list?.users.find((u) => u.email === email);
  if (found) return found.id;
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}

const momId = await ensureUser(parentEmail);
const joonId = await ensureUser(guardianEmail);

const { data: existing } = await db.from("family_members").select("family_id").eq("user_id", momId).maybeSingle();
let familyId = existing?.family_id;
if (!familyId) {
  const { data: fam, error } = await db.from("families").insert({ name: "김씨 가족 (demo)" }).select().single();
  if (error) throw error;
  familyId = fam.id;
}

const { error } = await db.from("family_members").upsert([
  { family_id: familyId, user_id: momId, role: "parent", display_name: "엄마 (김영자)", lang: "ko" },
  { family_id: familyId, user_id: joonId, role: "guardian", display_name: "Joon (Singapore)", lang: "en" },
]);
if (error) throw error;
console.log(`Seeded family ${familyId}: parent ${parentEmail}, guardian ${guardianEmail}`);
