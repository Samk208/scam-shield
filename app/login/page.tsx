"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HAS_PUBLIC_SUPABASE } from "@/lib/hooks";
import { AppHeader, DemoFooter } from "@/components/AppHeader";

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "YBnlWRMGMdAU";

const DEMO = [
  {
    label: "엄마 (Parent)",
    sub: "72세 · 한국어 큰 글씨 화면",
    email: "mom@scamshield.test",
    role: "parent" as const,
  },
  {
    label: "Joon (Guardian)",
    sub: "아들 · 실시간 알림 및 차단",
    email: "joon@scamshield.test",
    role: "guardian" as const,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("mom@scamshield.test");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPw, setShowPw] = useState(false);
  const [demoSelected, setDemoSelected] = useState<string | null>("mom@scamshield.test");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function selectDemoPersona(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setDemoSelected(demoEmail);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (!HAS_PUBLIC_SUPABASE) {
      const r = await fetch("/api/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = (await r.json().catch(() => ({}))) as { role?: "parent" | "guardian" };
      setBusy(false);
      router.push(j.role === "guardian" ? "/guardian" : "/parent");
      router.refresh();
      return;
    }

    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error)
      return setError(
        "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요. (Sign-in failed)",
      );
    router.push(email.includes("joon") ? "/guardian" : "/parent");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <AppHeader me={null} subtitle="역할별 데모 계정 전환 · Role Switcher" />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-8 rounded-3xl bg-navy p-6 text-white shadow-2xl sm:p-10 lg:grid-cols-12">
          {/* LEFT 6 COLUMNS: BRAND & 3-STEP ARCHITECTURE */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-[#32d583]">
                <ShieldCheck className="size-4" aria-hidden />
                <span>SCAM SHIELD · FAMILY CO-SIGNING SECURITY</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                보이스피싱,
                <br />
                가족이 함께 막습니다.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-white/85">
                AI holds suspicious transfers at the bank layer until your real child confirms.
                Switch between <strong>Mom (Seoul, 72)</strong> and{" "}
                <strong>Joon (Singapore, 34)</strong> with a single click.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  Icon: Landmark,
                  t: "Mom transfers",
                  s: "Bank screens high-risk transfers via Scam Shield",
                },
                {
                  Icon: Brain,
                  t: "AI agent holds",
                  s: "Deterministic tools + Claude + policy floor >= 70",
                },
                {
                  Icon: UserCheck,
                  t: "Child decides",
                  s: "Only verified family guardian can release funds",
                },
              ].map(({ Icon, t, s }, i) => (
                <li
                  key={t}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left"
                >
                  <span className="mb-2 grid size-9 place-items-center rounded-xl bg-white/15">
                    <Icon className="size-5 text-[#32d583]" aria-hidden />
                  </span>
                  <p className="text-sm font-bold text-white">
                    {i + 1}. {t}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/75">{s}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* RIGHT 6 COLUMNS: SIGN-IN & PERSONA SELECTOR FORM */}
          <div className="lg:col-span-6">
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-4 rounded-3xl bg-surface p-6 text-ink shadow-xl sm:p-8"
            >
              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-navy">
                  <Sparkles className="size-4" aria-hidden /> 원클릭 데모 계정 선택 (Quick Demo Persona)
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {DEMO.map((d) => {
                    const active = email === d.email;
                    return (
                      <button
                        type="button"
                        key={d.email}
                        onClick={() => selectDemoPersona(d.email)}
                        className={`flex min-h-16 flex-col items-start justify-center rounded-2xl border-2 px-4 py-2.5 text-left transition ${
                          active
                            ? "border-navy bg-navy text-white shadow-xs"
                            : "border-line bg-bg/60 text-ink hover:border-navy/50"
                        }`}
                      >
                        <span className="text-base font-bold">{d.label}</span>
                        <span className={`text-xs ${active ? "text-white/80" : "text-muted"}`}>
                          {d.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {demoSelected && (
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-safe">
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                    데모 계정이 자동 입력되었습니다. 아래 로그인 버튼을 누르면 바로 전환됩니다.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-ink" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="mt-1 w-full rounded-xl border-2 border-line bg-bg/40 p-3 text-base outline-none focus:border-navy focus:bg-surface"
                  type="email"
                  autoComplete="username"
                  placeholder="mom@scamshield.test"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setDemoSelected(null);
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink" htmlFor="pw">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="pw"
                    className="w-full rounded-xl border-2 border-line bg-bg/40 p-3 pr-12 text-base outline-none focus:border-navy focus:bg-surface"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 min-h-14 rounded-2xl bg-navy text-lg font-bold text-white shadow-md transition hover:bg-navy-2 active:scale-[.99] disabled:opacity-50"
                disabled={busy}
              >
                {busy ? "Signing in… (로그인 중…)" : "Sign in & Open Dashboard (로그인)"}
              </button>

              {error && (
                <p
                  className="rounded-xl bg-danger-bg p-3 text-sm font-medium text-danger-ink"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
