# 🛡️ Scam Shield

**Family-confirmed protection against voice phishing.** Built at c0mpiled-17 Seoul (2026-11-09) for the YC RFS themes **AI for the Aging Population** and **Proving You're Human**.

Koreans lost a record ₩1.26조 to voice phishing in 2025 (National Police Agency). Scammers win by isolating parents. With Scam Shield, Mom forwards any suspicious call, KakaoTalk message or text. An AI agent classifies the scam, puts the transfer on hold and alerts her real child. The child blocks or confirms it from their own verified device before any money moves. Every step is saved as a timestamped warning record that banks can use as evidence under the pending no-fault liability law.

> Demo: synthetic messages · simulated bank hold · no real accounts.

## The Scam Shield agent
Each forwarded message runs through one agent loop. Every step is recorded on the check (`agent_trace`) and shown in the app.

```
Perceive ──▶ Tools ──────────────────▶ Reason ─────────▶ Policy ─────────▶ Human ─────────▶ Audit
untrusted    extract_indicators        Claude classifies  deterministic     guardian          timestamped
message      (links, phones,           scam type, risk,   rule: risk ≥ 60   blocks or         warning record
             accounts, amounts)        red flags, KO/EN   → HOLD + alert    releases          (bank evidence)
             scan_scam_playbook        using tool                           (only a human
             (8 Korean scam signals)   evidence                             can release)
```

**Why this design holds up under questioning:**
- **The LLM only reasons.** Deterministic tools gather the evidence, and a deterministic policy picks the action. If two or more playbook signals fire, the risk can't be scored below 70, so a prompt-injected "this is safe" can't release a scam.
- **The AI can put a transfer on hold, but never release it.** Releasing money needs a human: the real child, confirming from their own authenticated session. That's the "Proving You're Human" part.
- **Every step is auditable.** The trace plus the audit events make up the warning record that the pending no-fault liability law will ask banks to show.

## How it works
1. **Parent** pastes a suspicious message and taps 확인하기.
2. **AI agent** (Claude, structured output) returns the scam type (기관사칭형, 가족사칭, 대출빙자형…), a risk score from 0 to 100, red flags, and a bilingual KO/EN explanation. The message is handled as untrusted input.
3. A score of **60 or more** puts the transfer **on hold** and alerts the guardian live (Supabase Realtime).
4. The **guardian** taps Block or It's fine. The decision is a compare-and-swap, so it happens exactly once, and Mom's screen updates live.
5. The **warning record** shows the audit timeline and can be exported.

## Stack
- Next.js 16 (App Router), TypeScript and Tailwind v4.
- Supabase: Auth, Postgres with RLS on every table, and Realtime.
- Vercel AI SDK with Anthropic.
- Deployed on Vercel.

## Run locally
1. Create a Supabase project (hosted, self-hosted on Coolify, or `supabase start` locally). Run `supabase/migrations/0001_init.sql` and then `0002_agent_trace.sql`.
2. Create `.env.local` with these keys. Never commit it.
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=        # server only
   ANTHROPIC_API_KEY=                # server only; if unset, the logged-in Claude Code CLI is used (set CLAUDE_CLI_PATH)
   ANTHROPIC_MODEL=claude-sonnet-5-5
   SEED_PARENT_EMAIL=mom@scamshield.test
   SEED_GUARDIAN_EMAIL=joon@scamshield.test
   SEED_PASSWORD=                    # demo-only password
   ```
3. Install and run:
   ```
   pnpm install
   pnpm seed
   pnpm dev
   ```
4. Sign in as the parent in one browser and as the guardian in another browser or a private window.

## Docs
- `docs/PRD.md`: product requirements, API contract, demo script.
- `docs/FRONTEND_PLAN.md`: UI plan and ownership.

## Built with
- Claude Code.
- gstack skills: `/office-hours`, used to pick the idea from seven candidates.
