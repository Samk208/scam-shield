"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  FileCheck2,
  Home,
  Lock,
  LogOut,
  Phone,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureDemoSession, HAS_PUBLIC_SUPABASE, triggerDemoReset } from "@/lib/hooks";
import type { Lang, Member } from "@/lib/types";

export function AppHeader({
  me,
  subtitle,
  lang,
  onLangChange,
}: {
  me: Member | null;
  subtitle?: string;
  lang?: Lang;
  onLangChange?: (lang: Lang) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [switchingRole, setSwitchingRole] = useState(false);

  async function signOut() {
    if (HAS_PUBLIC_SUPABASE) {
      await createClient().auth.signOut();
    } else {
      await fetch("/api/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "signout" }),
      });
    }
    router.push("/login");
    router.refresh();
  }

  async function navigateWithDemoRole(targetPath: string, role?: "parent" | "guardian") {
    if (role && (!me || me.role !== role)) {
      setSwitchingRole(true);
      await ensureDemoSession(role);
      setSwitchingRole(false);
    }
    router.push(targetPath);
    router.refresh();
  }

  const activeLang: Lang = lang ?? me?.lang ?? "en";

  const navItems = [
    {
      href: "/",
      label: activeLang === "ko" ? "홈 · 시뮬레이터" : "Home",
      Icon: Home,
      active: pathname === "/",
      role: undefined,
    },
    {
      href: "/parent",
      label: activeLang === "ko" ? "부모님 앱" : "Mom's App",
      Icon: ShieldAlert,
      active: pathname.startsWith("/parent"),
      role: "parent" as const,
    },
    {
      href: "/guardian",
      label: activeLang === "ko" ? "자녀 관제" : "Guardian",
      Icon: UserCheck,
      active: pathname.startsWith("/guardian"),
      role: "guardian" as const,
    },
    {
      href: "/checks/c-held",
      label: activeLang === "ko" ? "경고 증빙" : "Audit Log",
      Icon: FileCheck2,
      active: pathname.startsWith("/checks"),
      role: undefined,
    },
    {
      href: "/#pricing",
      label: activeLang === "ko" ? "55+ 요금제" : "55+ & Pricing",
      Icon: Users,
      active: false,
      role: undefined,
    },
  ];

  return (
    <header
      className="print-hidden sticky top-0 z-30 border-b border-white/12 bg-navy/95 text-white shadow-lg backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Top Institutional Trust Micro-Bar (Desktop) */}
      <div className="hidden border-b border-white/10 bg-[#091526] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] text-white/75 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#32d583]">
              <span className="size-1.5 rounded-full bg-[#32d583] animate-pulse" />
              {activeLang === "ko"
                ? "실시간 은행 이체 보호 가동 중 (4.8초 보류)"
                : "REAL-TIME TRANSFER INTERCEPTION ACTIVE (4.8s HOLD)"}
            </span>
            <span className="text-white/25">|</span>
            <span className="inline-flex items-center gap-1 text-white/70">
              <Lock className="size-3 text-[#93c5fd]" aria-hidden />
              {activeLang === "ko"
                ? "결정적 정책 하한선: 신호 ≥ 2 → 무조건 보류(HELD)"
                : "Deterministic Policy Floor: signals ≥ 2 → Forced HOLD"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-white/70">
              <Scale className="size-3 text-[#32d583]" aria-hidden />
              {activeLang === "ko"
                ? "보이스피싱 무과실 배상책임 법안 증빙 호환"
                : "Korea No-Fault Liability Act Warning Record Ready"}
            </span>
            <span className="text-white/25">|</span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1 font-mono font-bold text-white/90 hover:text-[#32d583]"
            >
              <Phone className="size-3 text-danger" aria-hidden />
              {activeLang === "ko" ? "긴급신고 112 · 금감원 1332" : "KR Hotlines: 112 · 1332"}
            </a>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Identity */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#32d583]/25 to-white/10 ring-1 ring-white/25 transition group-hover:ring-[#32d583]/60">
            <ShieldCheck className="size-5.5 text-[#32d583]" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="whitespace-nowrap text-lg font-extrabold leading-tight tracking-tight text-white">
                Scam Shield
              </p>
              <span className="hidden whitespace-nowrap rounded-full border border-[#32d583]/40 bg-[#32d583]/15 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-[#32d583] sm:inline-block">
                55+ GUARD
              </span>
            </div>
            <p className="max-w-52 truncate text-[11px] font-medium text-white/70 xl:max-w-64">
              {subtitle ??
                me?.display_name ??
                (activeLang === "ko"
                  ? "보이스피싱 실시간 가족 공동 승인"
                  : "Family Co-Signed Transfer Protection")}
            </p>
          </div>
        </Link>

        {/* Zone 2: Center Segmented Navigation Pill */}
        <nav
          className="hidden items-center gap-1 rounded-2xl border border-white/12 bg-white/6 p-1 lg:flex"
          aria-label={activeLang === "ko" ? "주요 메뉴" : "Primary navigation"}
        >
          {navItems.map(({ href, label, Icon, active, role }) => (
            <button
              key={href}
              type="button"
              disabled={switchingRole}
              onClick={() => navigateWithDemoRole(href, role)}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-white text-navy shadow-xs"
                  : "text-white/80 hover:bg-white/12 hover:text-white"
              }`}
            >
              <Icon className={`size-3.5 shrink-0 ${active ? "text-navy" : "text-[#93c5fd]"}`} aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: Language Segmented Toggle + Active Persona + Account Switch */}
        <div className="flex shrink-0 items-center gap-2">
          {onLangChange && (
            <div
              className="inline-flex items-center rounded-xl border border-white/15 bg-[#091526] p-0.5"
              role="group"
              aria-label="Language selector"
            >
              <button
                type="button"
                onClick={() => onLangChange("en")}
                aria-pressed={activeLang === "en"}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === "en"
                    ? "bg-[#32d583] text-navy shadow-2xs"
                    : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange("ko")}
                aria-pressed={activeLang === "ko"}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                  activeLang === "ko"
                    ? "bg-[#32d583] text-navy shadow-2xs"
                    : "text-white/70 hover:text-white"
                }`}
              >
                한국어
              </button>
            </div>
          )}

          {me && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white/95 md:inline-flex">
              <span
                className={`size-2 rounded-full ${
                  me.role === "parent" ? "bg-[#93c5fd]" : "bg-[#32d583]"
                }`}
              />
              {me.role === "parent"
                ? activeLang === "ko"
                  ? "엄마 (72세)"
                  : "Mom (72)"
                : activeLang === "ko"
                  ? "Joon (보호자)"
                  : "Joon (Guardian)"}
            </span>
          )}

          <button
            type="button"
            onClick={signOut}
            aria-label={activeLang === "ko" ? "계정 전환" : "Switch persona"}
            title={activeLang === "ko" ? "계정 전환" : "Switch persona"}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/18"
          >
            <LogOut className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">
              {activeLang === "ko" ? "역할 전환" : "Switch Role"}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-navigation bar on mobile / tablet */}
      <div className="border-t border-white/10 bg-[#091526]/90 px-4 py-1.5 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto">
          {navItems.map(({ href, label, Icon, active, role }) => (
            <button
              key={href}
              type="button"
              onClick={() => navigateWithDemoRole(href, role)}
              className={`inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                active ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function DemoFooter({ lang = "en" }: { lang?: Lang }) {
  const [resetting, setResetting] = useState(false);

  async function onReset() {
    setResetting(true);
    await triggerDemoReset();
    setResetting(false);
  }

  return (
    <footer className="print-hidden mt-12 border-t border-line bg-[#0b192c] text-white">
      {/* Main 12-Column Semantic Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Col 1 (4 cols): Brand Mission & Architecture Badges */}
          <div className="flex flex-col justify-between lg:col-span-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <ShieldCheck className="size-5 text-[#32d583]" aria-hidden />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold tracking-tight text-white">
                      Scam Shield
                    </span>
                    <span className="rounded-full bg-[#32d583]/20 px-2 py-0.5 text-[10px] font-bold text-[#32d583]">
                      55+ ACTIVE SENIOR GUARD
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60">
                    {lang === "ko"
                      ? "실시간 보이스피싱 이체 보류 · 가족 공동 승인망"
                      : "Real-Time Transfer Interception & Family Co-Signing"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-white/75">
                {lang === "ko"
                  ? "부모님이 사기범에게 속아 모바일 한도 직전 금액(280만·98만 원)을 송금하려 해도 돈이 바로 빠져나가지 않습니다. 결정적 보안 코드와 AI가 4.8초 만에 이체를 보류하고 자녀의 승인을 요청합니다."
                  : "Even when a scammer coaches your parent into sending sub-limit transfers (₩2.8M / ₩980K), the money doesn't leave. Deterministic guardrails + Claude pause the transfer in 4.8s until family confirms."}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/6 px-2.5 py-1 font-mono text-[11px] text-[#93c5fd]">
                  <Cpu className="size-3" aria-hidden /> Prompt-Injection Sandbox
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/6 px-2.5 py-1 font-mono text-[11px] text-[#32d583]">
                  <Lock className="size-3" aria-hidden /> Policy Floor ≥ 70
                </span>
              </div>
            </div>
          </div>

          {/* Col 2 (2 cols): Live Workspaces */}
          <div className="lg:col-span-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#93c5fd]">
              {lang === "ko" ? "워크스페이스" : "Workspaces"}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-medium text-white/75">
              <li>
                <Link href="/" className="transition hover:text-white hover:underline">
                  {lang === "ko" ? "홈 · 듀얼 시뮬레이터" : "Home & Dual Simulator"}
                </Link>
              </li>
              <li>
                <Link href="/parent" className="transition hover:text-white hover:underline">
                  {lang === "ko" ? "부모님 앱 (/parent)" : "Mom's Bank App (/parent)"}
                </Link>
              </li>
              <li>
                <Link href="/guardian" className="transition hover:text-white hover:underline">
                  {lang === "ko" ? "자녀 관제 (/guardian)" : "Guardian Console (/guardian)"}
                </Link>
              </li>
              <li>
                <Link href="/checks/c-held" className="transition hover:text-white hover:underline">
                  {lang === "ko" ? "경고 증빙 (/checks/c-held)" : "Warning Record (/checks/c-held)"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-white hover:underline">
                  {lang === "ko" ? "역할 전환 (/login)" : "Switch Persona (/login)"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 (3 cols): 55+ Business Model & Architecture */}
          <div className="lg:col-span-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#32d583]">
              {lang === "ko" ? "55+ 수익모델 · 아키텍처" : "55+ Business & Architecture"}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-xs font-medium text-white/75">
              <li>
                <Link href="/#pricing" className="transition hover:text-white hover:underline">
                  {lang === "ko"
                    ? "Stage 1 · 가족 안심 구독 (₩9,900/월)"
                    : "Stage 1 · B2C Family Plan (₩9,900/mo)"}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="transition hover:text-white hover:underline">
                  {lang === "ko"
                    ? "Stage 2 · 손해보험·알뜰폰 55+ 번들"
                    : "Stage 2 · P&C Insurer & MVNO Bundle"}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="transition hover:text-white hover:underline">
                  {lang === "ko"
                    ? "Stage 3 · 제2금융권 배상책임 SaaS"
                    : "Stage 3 · Tier-2 Mutual Bank SaaS"}
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="transition hover:text-white hover:underline">
                  {lang === "ko"
                    ? "6단계 하이브리드 방어 파이프라인"
                    : "6-Stage Hybrid Defense Pipeline"}
                </Link>
              </li>
              <li>
                <Link href="/#compliance" className="transition hover:text-white hover:underline">
                  {lang === "ko"
                    ? "무과실 배상책임 법안 Warning Record"
                    : "No-Fault Liability Act Compliance"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 (3 cols): 24/7 Emergency Hotlines & Demo Reset Card */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/15 bg-white/6 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#fda29b]">
                {lang === "ko"
                  ? "24시간 보이스피싱 긴급 신고"
                  : "24/7 Korea Anti-Phishing Hotlines"}
              </p>
              <ul className="mt-2.5 flex flex-col gap-2 text-xs">
                <li>
                  <a
                    href="tel:112"
                    className="flex items-center justify-between rounded-lg bg-white/8 px-2.5 py-1.5 font-semibold text-white transition hover:bg-white/15"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5 text-[#fda29b]" aria-hidden />
                      {lang === "ko" ? "경찰청 범죄신고" : "National Police"}
                    </span>
                    <span className="font-mono font-extrabold text-[#fda29b]">112</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:1332"
                    className="flex items-center justify-between rounded-lg bg-white/8 px-2.5 py-1.5 font-semibold text-white transition hover:bg-white/15"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5 text-[#93c5fd]" aria-hidden />
                      {lang === "ko" ? "금융감독원 피해상담" : "Financial Supervisory (FSS)"}
                    </span>
                    <span className="font-mono font-extrabold text-[#93c5fd]">1332</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:118"
                    className="flex items-center justify-between rounded-lg bg-white/8 px-2.5 py-1.5 font-semibold text-white transition hover:bg-white/15"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5 text-[#32d583]" aria-hidden />
                      {lang === "ko" ? "KISA 스미싱 상담" : "KISA Smishing Center"}
                    </span>
                    <span className="font-mono font-extrabold text-[#32d583]">118</span>
                  </a>
                </li>
              </ul>

              <button
                type="button"
                onClick={onReset}
                disabled={resetting}
                className="mt-3 flex min-h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <RotateCcw className={`size-3.5 ${resetting ? "animate-spin" : ""}`} aria-hidden />
                <span>
                  {resetting
                    ? lang === "ko"
                      ? "초기화 중…"
                      : "Resetting…"
                    : lang === "ko"
                      ? "데모 시나리오 초기화 (Reset)"
                      : "Reset Demo Scenarios"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Regulatory Attribution Bar */}
      <div className="border-t border-white/10 bg-[#07111f]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3.5 text-[11px] text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#32d583]" aria-hidden />
            <span>
              {lang === "ko"
                ? "시뮬레이션 데모 환경 (합성 데이터 · 실제 은행 계좌와 연결되지 않음)"
                : "Interactive Simulation Environment (Synthetic Data · No Real Bank Funds Moved)"}
            </span>
          </p>
          <p className="font-mono">
            © 2026 Scam Shield · AI for the Aging Population &amp; Proving You&apos;re Human
          </p>
        </div>
      </div>
    </footer>
  );
}
