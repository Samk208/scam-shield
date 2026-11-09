"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DemoFooter } from "@/components/AppHeader";

const DEMO = [
  { label: "엄마 (Parent)", email: "mom@scamshield.test" },
  { label: "Joon (Guardian)", email: "joon@scamshield.test" },
];

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
    if (error) return setError("Sign-in failed. Check the email and password.");
    window.location.assign("/");
  }

  return (
    <div className="flex flex-1 flex-col bg-navy text-white">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 p-6">
        <div className="text-center">
          <ShieldCheck className="mx-auto size-16" />
          <h1 className="mt-3 text-4xl font-bold">Scam Shield</h1>
          <p className="mt-2 text-white/80">보이스피싱, 가족이 함께 막습니다.<br />AI holds the transfer until your real child confirms.</p>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-3xl bg-surface p-5 text-ink shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => (
              <button type="button" key={d.email} onClick={() => setEmail(d.email)}
                className={`rounded-xl border-2 px-2 py-2 text-sm font-semibold ${email === d.email ? "border-navy bg-navy text-white" : "border-line"}`}>
                {d.label}
              </button>
            ))}
          </div>
          <label className="text-sm font-medium text-muted" htmlFor="email">Email</label>
          <input id="email" className="rounded-xl border-2 border-line p-3 outline-none focus:border-navy" type="email" autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="text-sm font-medium text-muted" htmlFor="pw">Password</label>
          <input id="pw" className="rounded-xl border-2 border-line p-3 outline-none focus:border-navy" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="mt-2 min-h-14 rounded-2xl bg-navy text-lg font-bold text-white disabled:opacity-50" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        </form>
      </main>
      <div className="text-white/70 [&_p]:text-white/60"><DemoFooter /></div>
    </div>
  );
}
