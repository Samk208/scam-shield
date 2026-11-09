# 🛡️ Scam Shield

**Family-confirmed protection against voice phishing.** Built at c0mpiled-17 Seoul (2026-11-09) for the YC RFS themes **AI for the Aging Population** and **Proving You're Human**.

Koreans lost a record ₩1.26조 to voice phishing in 2025 (National Police Agency). Scammers win by isolating parents, so **Mom doesn't have to recognise the scam.** When she starts a transfer, her bank asks Scam Shield automatically. An AI agent screens the transfer, puts it on hold, and alerts her real child, who blocks or confirms it from their own verified device before any money moves. Every step is saved as a timestamped warning record that banks can use as evidence under the pending no-fault liability law. Forwarding a suspicious SMS, KakaoTalk message or call transcript is the fallback channel.

> Demo: synthetic messages · simulated bank API · no real accounts.

## For judges: everything in one place
| | |
|---|---|
| **Demo video (1:55)** | https://youtu.be/JjS4pAC-N2I |
| **Live app (no setup)** | https://scam-shield-livid-omega.vercel.app (installable PWA, mobile-first) |
| **Pitch deck** | [PDF](docs/pitch/Scam_Shield_Pitch_Deck.pdf) · [PPTX](docs/pitch/Scam_Shield_Pitch_Deck.pptx) · [speaker notes & Q&A](docs/pitch/SPEAKER_NOTES.md) |
| **Demo logins** (demo-only accounts, synthetic data) | Parent: `mom@scamshield.test` · Guardian: `joon@scamshield.test` · Password for both: `YBnlWRMGMdAU` |
| **Built during the event** | First commit `4b1bc58` at 2026-11-09 11:23 KST, after the 10:00 build start. See `git log`. |

### Try it in 60 seconds
1. Open the live app in a **normal window** and sign in as **엄마 (Parent)**. Open it again in an **incognito window** and sign in as **Joon (Guardian)**.
2. As Mom, in "내 은행 앱" (her bank app), pick **검찰이 시킨 '안전계좌' 이체** (₩30,000,000 to a new payee) and tap **이체하기**. She makes no judgement herself.
3. After about 6–10s, Mom's transfer is **on hold** (risk ~98, 기관사칭형 authority impersonation). Joon's screen turns red **live**, and the AI agent pipeline shows Perceive → Tools → Reason → Policy → **Human**.
4. Joon taps **Block transfer**, and Mom's screen updates instantly. Open "How the agent decided" to see the full agent trace and the exportable warning record.
5. As a contrast, **아들에게 용돈 보내기** (₩200,000 to a known payee) goes through as safe, so it doesn't cry wolf.

### What's real vs simulated
- **Real:**
  - Claude scam classification
  - The deterministic agent tools and policy
  - Supabase Auth with row-level security and Realtime
  - The audit trail
  - 14/14 end-to-end tests ([scripts/smoke.mjs](scripts/smoke.mjs)), run against the live deployment
- **Simulated:** the bank app and the bank hold. In production, the bank calls `POST /api/transfers` server-to-server.

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
- gstack skills: `/office-hours` (to pick the idea from seven researched candidates), gbrain installed as the team knowledge MCP
- `ui-ux-pro-max` design pass: accessible & ethical style for elderly users (44px targets, 16px+ text, SVG icons, focus states)
- Deep-research subagents (7 ideas validated with sourced market data; see the pitch deck)
