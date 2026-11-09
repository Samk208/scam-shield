"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO_LABEL } from "@/lib/labels";

// Skeleton: works end to end. Frontend owner restyles.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    window.location.href = "/";
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold">🛡️ Scam Shield</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="rounded border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="rounded border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="rounded bg-black p-3 font-semibold text-white disabled:opacity-50" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <p className="text-xs text-zinc-500">{DEMO_LABEL}</p>
    </main>
  );
}
