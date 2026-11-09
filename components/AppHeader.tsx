"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileCheck2,
  Globe,
  Home,
  LogOut,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureDemoSession, HAS_PUBLIC_SUPABASE, triggerDemoReset } from "@/lib/hooks";
import { DEMO_LABEL } from "@/lib/labels";
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
      await ensureDemoSession(role);
    }
    router.push(targetPath);
    router.refresh();
  }

  const activeLang = lang ?? me?.lang ?? "ko";

  const navItems = [
    {
      href: "/",
      label: activeLang === "ko" ? "홈" : "Home",
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
      label: activeLang === "ko" ? "증빙 기록" : "Audit Log",
      Icon: FileCheck2,
      active: pathname.startsWith("/checks"),
      role: undefined,
    },
  ];

  return (
    <header
      className="print-hidden sticky top-0 z-30 border-b border-white/10 bg-navy text-white shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/25 transition group-hover:bg-white/20">
              <ShieldCheck className="size-6 text-[#32d583]" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="whitespace-nowrap text-lg font-bold leading-tight tracking-tight">
                  Scam Shield
                </p>
                <span className="hidden whitespace-nowrap rounded-full bg-[#32d583]/20 px-2 py-0.5 text-[11px] font-bold text-[#32d583] xl:inline-block">
                  LIVE GUARD
                </span>
              </div>
              <p className="max-w-64 truncate text-xs text-white/75">
                {subtitle ??
                  me?.display_name ??
                  (activeLang === "ko"
                    ? "보이스피싱 실시간 가족 승인 방어망"
                    : "Real-Time Family Transfer Protection")}
              </p>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={activeLang === "ko" ? "주요 메뉴" : "Primary navigation"}
          >
            {navItems.map(({ href, label, Icon, active, role }) => (
              <button
                key={href}
                type="button"
                onClick={() => navigateWithDemoRole(href, role)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-navy shadow-xs"
                    : "text-white/80 hover:bg-white/12 hover:text-white"
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onLangChange && (
            <button
              type="button"
              onClick={() => onLangChange(activeLang === "ko" ? "en" : "ko")}
              aria-label={activeLang === "ko" ? "Switch to English" : "한국어로 전환"}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#32d583]/50 bg-[#32d583]/15 px-3.5 text-xs font-bold text-white hover:bg-[#32d583]/25"
            >
              <Globe className="size-3.5 text-[#32d583]" aria-hidden />
              <span>{activeLang === "ko" ? "EN · 한국어" : "한국어 · EN"}</span>
            </button>
          )}

          {me && (
            <span className="hidden whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 md:inline-block">
              {me.role === "parent"
                ? activeLang === "ko"
                  ? "부모님"
                  : "Mom"
                : activeLang === "ko"
                  ? "보호자"
                  : "Guardian"}
            </span>
          )}

          <button
            type="button"
            onClick={signOut}
            aria-label={activeLang === "ko" ? "계정 전환" : "Switch user"}
            title={activeLang === "ko" ? "계정 전환" : "Switch user"}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/8 px-3 text-xs font-semibold text-white/90 hover:bg-white/18"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">
              {activeLang === "ko" ? "계정 전환" : "Switch"}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-navigation bar on mobile / tablet */}
      <div className="border-t border-white/10 bg-navy-2/60 px-4 py-1.5 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto">
          {navItems.map(({ href, label, Icon, active, role }) => (
            <button
              key={href}
              type="button"
              onClick={() => navigateWithDemoRole(href, role)}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
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

export function DemoFooter() {
  const [resetting, setResetting] = useState(false);

  async function onReset() {
    setResetting(true);
    await triggerDemoReset();
    setResetting(false);
  }

  return (
    <footer className="print-hidden mt-12 border-t border-line bg-surface text-ink">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-navy text-white">
                <ShieldCheck className="size-4.5 text-[#32d583]" aria-hidden />
              </span>
              <span className="text-base font-bold text-ink">Scam Shield</span>
              <span className="rounded-full bg-bg px-2.5 py-0.5 text-xs font-semibold text-muted">
                보이스피싱 가족 공동 방어망
              </span>
            </div>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted">
              부모님이 사기 수법을 직접 알아채지 못해도 괜찮습니다. 고액·신규 계좌 이체 시 은행이 Scam Shield AI 에이전트로 먼저 위험을 감지해 송금을 일시 보류하고, 인증된 자녀의 기기에서 최종 확인합니다.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-muted">
                <ShieldCheck className="size-3.5 text-navy" aria-hidden />
                {DEMO_LABEL}
              </p>
              {!HAS_PUBLIC_SUPABASE && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={resetting}
                  className="inline-flex min-h-7 items-center gap-1 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-navy hover:border-navy disabled:opacity-50"
                >
                  <RotateCcw className={`size-3 ${resetting ? "animate-spin" : ""}`} aria-hidden />
                  <span>{resetting ? "초기화 중…" : "데모 데이터 초기화 (Reset)"}</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-navy">워크스페이스 바로가기</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm font-medium text-muted">
              <li>
                <Link href="/" className="hover:text-navy hover:underline">
                  홈 · 실시간 듀얼 시뮬레이터
                </Link>
              </li>
              <li>
                <Link href="/parent" className="hover:text-navy hover:underline">
                  부모님 워크스페이스 (엄마 화면)
                </Link>
              </li>
              <li>
                <Link href="/guardian" className="hover:text-navy hover:underline">
                  보호자 관제 대시보드 (Joon 화면)
                </Link>
              </li>
              <li>
                <Link href="/checks/c-held" className="hover:text-navy hover:underline">
                  은행 제출용 타임스탬프 경고 기록
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-navy hover:underline">
                  계정 전환 / 로그인
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-danger-ink">
              보이스피싱 긴급 신고·상담
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li>
                <a href="tel:112" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-danger">
                  <Phone className="size-3.5 text-danger" aria-hidden /> 경찰청 범죄신고 · <span className="font-mono">112</span>
                </a>
              </li>
              <li>
                <a href="tel:1332" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-navy">
                  <Phone className="size-3.5 text-navy" aria-hidden /> 금융감독원 보이스피싱 · <span className="font-mono">1332</span>
                </a>
              </li>
              <li>
                <a href="tel:118" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-navy">
                  <Phone className="size-3.5 text-navy" aria-hidden /> KISA 스미싱 피해상담 · <span className="font-mono">118</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
