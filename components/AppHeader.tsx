"use client";
import { LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";

export function AppHeader({ me, subtitle }: { me: Member | null; subtitle?: string }) {
  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }
  return (
    <header className="sticky top-0 z-10 bg-navy text-white shadow-md" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <ShieldCheck className="size-8 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-tight">Scam Shield</p>
          <p className="truncate text-sm text-white/75">{subtitle ?? me?.display_name ?? "…"}</p>
        </div>
        {me && (
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {me.role === "parent" ? "부모님" : "Guardian"}
          </span>
        )}
        <button onClick={signOut} aria-label="Sign out" className="rounded-full p-2 hover:bg-white/10">
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}

export function DemoFooter() {
  return (
    <p className="px-4 pb-6 pt-2 text-center text-xs text-muted">
      Demo: synthetic messages · simulated bank hold · no real accounts
    </p>
  );
}
