# Scam Shield — Engineering & UI/UX Handover Note

**Last Updated:** 2026-11-09  
**Repository:** `https://github.com/Samk208/scam-shield`  
**Live Production (unchanged `main` branch):** `https://scam-shield-livid-omega.vercel.app`  
**Feature Branch:** `feat/desktop-homepage-ux` (pushed to GitHub without touching `main`)

---

## 1. Executive Summary of Improvements

This iteration transformed **Scam Shield** from a mobile-only strip (`max-w-md`) that required `.env.local` to boot into a **full-width, responsive desktop & mobile fintech platform (`max-w-7xl`)** with a **zero-config Local Demo Mode** and an interactive **Dual-Screen Live Simulator** on the homepage (`/`).

### Key Capabilities Delivered
1. **Zero-Config Local Demo Mode (`lib/server/demo-store.ts`)**:
   - Works out-of-the-box with `pnpm dev` even when `.env.local` (Supabase & Anthropic keys) is absent.
   - When `.env.local` is present (e.g., on Vercel production), 100% of the real Supabase Auth + RLS + Realtime + Anthropic Claude pipeline runs unchanged.
   - Uses an in-memory store (`globalThis.__scamShieldDemoStore`), `BroadcastChannel("scam-shield-sync")` + 2s polling for instant cross-tab synchronization, `x-demo-role` request headers so `/parent` and `/guardian` can be used simultaneously in two tabs of the **same** browser window without cookie collisions, and deterministic heuristic fallback (`deterministicFallbackVerdict()` in `lib/server/analyze.ts`) when no LLM API key is configured.

2. **Public Fintech Homepage & Live Split-Screen Simulator (`app/page.tsx` at `/`)**:
   - **Full-Bleed Navy Hero (`max-w-7xl`, 12-column grid)**: Bilingual (`KO` / `EN`) toggle, 2025 Korean National Police Agency voice-phishing statistics (`₩1.26조` annual loss, `78.6%` authority impersonation, `< 2.1s` interception latency, `100%` human-verified release), and a live **Family Co-Signing Mesh** status card.
   - **Interactive Dual-Screen Live Simulator (`#simulator`)**: Side-by-side 12-column desktop split with **Mom's Banking App (Seoul, 72)** on the left (`lg:col-span-6`) and **Joon's Guardian Console (Singapore, 34)** on the right (`lg:col-span-6`). Visitors can trigger a ₩30,000,000 scam transfer on the left and immediately block or release it on the right on a single screen.
   - **6-Stage Hybrid Defense Architecture (`#architecture`)**: Documents `Perceive → Tools → Reason → Policy Gate → Proving Human → Audit Trail`.
   - **Bank No-Fault Liability Act Compliance (`#compliance`) & Interactive FAQ (`#faq`)**: Previews the timestamped JSON Warning Record (`warning-record-c-held.json`) and links directly to `/checks/c-held`.

3. **Full Desktop Multi-Column Workspaces (`max-w-7xl`)**:
   - **Parent Portal (`app/(app)/parent/page.tsx` at `/parent`)**:
     - Top row: 7-col active protection banner + 5-col 4-card `StatsStrip`.
     - Left 7 cols: `BankDemo` (with 2 presets + new **3rd Custom Input tab (`직접 입력 실험`)** for custom payee/account/amount/memo) + manual SMS / KakaoTalk / Call transcript checker.
     - Right 5 cols (sticky on desktop): Latest AI Safety Check `CheckCard`, interactive check history, and 24/7 Senior Emergency Hotline card (`112`, `1332`).
   - **Guardian Command Center (`app/(app)/guardian/page.tsx` at `/guardian`)**:
     - Top row: 7-col Urgent Hold Alert banner (or All Clear banner with one-click demo scenario restore) + 5-col `StatsStrip`.
     - Left 7 cols: Held transfer decision queue (`Block transfer`, `Confirm safe & release`, `Call Mom now`).
     - Right 5 cols (sticky on desktop): `FamilyCard`, resolved activity feed, and active deterministic policy rules.
   - **Forensic & Bank Liability Record (`app/(app)/checks/[id]/page.tsx` at `/checks/[id]`)**:
     - 12-column split: left 6 cols (`CheckCard` + raw JSON Liability Certificate preview), right 6 cols (`AgentTrace` + timestamped Warning Record timeline + JSON download, summary copy, and `Print / Save PDF`).
   - **Role Switcher / Login (`app/login/page.tsx` at `/login`)**:
     - 12-column split card with 3-step architecture overview on the left and one-click persona switching (`Mom` / `Joon`) on the right.

4. **Design System & Accessibility (`DESIGN.md`, `app/globals.css`)**:
   - Added `DESIGN.md` at repo root specifying color tokens, senior-first typography, and 12-column responsive layout rules.
   - Added Korean CJK typography protection (`word-break: keep-all; overflow-wrap: break-word;`) in `app/globals.css` so Korean syllables never split mid-word.

---

## 2. File-by-File Change Manifest

| File | Summary of Changes |
| :--- | :--- |
| `DESIGN.md` | New design system specification (tokens, CJK typography, 12-column layout rules). |
| `docs/HANDOVER.md` | This engineering and UI/UX handover document. |
| `lib/server/demo-store.ts` | New in-memory store (`globalThis.__scamShieldDemoStore`) for zero-config Local Demo Mode + reset support. |
| `proxy.ts` | Allows public access to `/` and `/login`; auto-provisions `scam_shield_demo_role` cookie in Local Demo Mode; preserves `@supabase/ssr` session refresh when `.env.local` is configured. |
| `lib/server/auth.ts` | Supports `x-demo-role` header and `scam_shield_demo_role` cookie fallback when Supabase env vars are absent. |
| `lib/server/analyze.ts` | Added `deterministicFallbackVerdict()`, `/*turbopackIgnore: true*/` on `execFile`, and fixed unused `_drop` lint warning. |
| `lib/server/pipeline.ts` | Dual-mode persistence (Supabase when configured, `demo-store.ts` in Local Demo Mode). |
| `lib/hooks.ts` | Added `BroadcastChannel("scam-shield-sync")` + polling fallback, `x-demo-role` headers on mutations, and `triggerDemoReset()`. |
| `lib/fixtures.ts` | Enriched `c-held` and `c-safe` fixtures with full `transfer` metadata, `indicators`, and 6-step `agent_trace`. |
| `lib/labels.ts` | Converted `EVENT_LABEL` to bilingual `{ ko, en }` map. |
| `lib/supabase/client.ts` | Added build-time fallback URL/key strings so `next build` static prerendering succeeds without `.env.local`. |
| `app/page.tsx` | Replaced redirect-only root with full desktop/mobile Fintech Landing Page & Live Split-Screen Simulator. |
| `app/(app)/parent/page.tsx` | Upgraded to `max-w-7xl` 12-column desktop workspace for Mom. |
| `app/(app)/guardian/page.tsx` | Upgraded to `max-w-7xl` 12-column desktop command center for Joon. |
| `app/(app)/checks/[id]/page.tsx` | Upgraded to `max-w-7xl` 12-column forensic & compliance view with Print/PDF and live JSON certificate preview. |
| `app/(app)/layout.tsx` | Updated Suspense skeleton fallback to match `max-w-7xl` 12-column grid. |
| `app/login/page.tsx` | Upgraded to `max-w-7xl` 12-column split login & persona switcher. |
| `components/AppHeader.tsx` | Upgraded to `max-w-7xl` desktop top navigation bar + 4-column semantic `DemoFooter` with Demo Reset button. |
| `components/BankDemo.tsx` | Added 3rd Custom Transfer tab (`직접 입력 실험`) and step-by-step progress feedback. |
| `components/CheckCard.tsx` | Added compact status badges, structured bank transfer summary box, crimson blocked banner, forensic indicator chips, and 112/1332 action buttons. |
| `components/Dashboard.tsx` | Upgraded `StatsStrip` and `FamilyCard` with bilingual labels and responsive 4-card desktop grid. |
| `components/AgentPipeline.tsx` | Added total latency badge (`⏱ 4.8s`) and bilingual stage descriptions. |
| `components/AgentTrace.tsx` | Added step index pills, human-friendly tool badges, and visual connector timeline. |
| `components/RiskMeter.tsx` | Added risk tier badge (`고위험 · 즉시 보류 / High Risk · Auto-Hold`) and threshold scale (`0 / 35 / 60 / 100`). |

---

## 3. Verification & Quality Gates

- `pnpm typecheck` (`tsc --noEmit`): **PASS (0 errors)**
- `pnpm lint` (`eslint`): **PASS (0 errors, 0 warnings)**
- `pnpm build` (`next build` with Turbopack): **PASS (all static & dynamic routes compiled cleanly)**
- Live HTTP smoke check (`/` · `/parent` · `/guardian` · `/checks/c-held` · `/login`): **200 OK across all routes**

---

## 4. How to Merge to Production When Ready

The live Vercel deployment tracks `main`. All changes from this session are safely isolated on the `feat/desktop-homepage-ux` branch on GitHub.

To preview or merge into `main` later:
```bash
git checkout main
git merge feat/desktop-homepage-ux
git push origin main
```

