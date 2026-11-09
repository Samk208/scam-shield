# Scam Shield: PRD v1.0 (c0mpiled-17 Seoul, 2026-11-09)

> **One line:** Mom forwards anything suspicious. AI flags the scam and holds the transfer until her real child confirms or blocks it from their own verified device.
> **YC RFS themes:** AI for the Aging Population + Proving You're Human.
> **Repo:** `C:\Users\Lenovo\Desktop\CaSam\scam-shield`. The research behind every claim is in `reports/Hackathon idea validation Seoul.md`.

---

## 1. Event constraints (from luma.com/compiled-8lsr)
- Build window 10:00–15:00 KST. Commits made before 10:00 make the project ineligible. The repo was created after 11:00.
- Submit a GitHub URL and a demo video of **2 minutes or less** (Loom or YouTube).
- Judged on problem-solution clarity, technical execution and creativity. The pitch is in English.
- Judges: Pickle, YC (Sina Matian), Outsome, Rex, Circleback.

## 2. Problem
- Koreans lost a record **₩1.2578조 to voice phishing in 2025**, up 47.2% on 2024. There were 23,360 cases, about ₩5,384만 each. Source: National Police Agency, via iNews24 and Korea Herald.
- **78.6% of losses** came from people impersonating authorities (prosecutors, the FSS). Victims in their 60s rose **85.4%** year on year (Jan–Jul 2025).
- **How the scam works:** isolate the victim. "Don't tell anyone." Take over the phone with a malicious app. Text as "your son with a new number".
- **The bank-side cost:** a no-fault liability bill is pending (still not passed as of 2026-11-05). The FSC estimates banks would pay ₩1,098억–2,811억 a year. The bill exempts banks that "sufficiently warned" the customer.

## 3. Solution
A family safety room with an AI scam agent in the middle:
1. **The parent forwards** a suspicious SMS, KakaoTalk message or call transcript.
2. **The AI agent** classifies the scam type, scores the risk from 0 to 100, extracts red flags and explains them in Korean and English.
3. **If the risk is high**, it automatically puts the transfer on **HOLD** (simulated) and **alerts the guardian live**.
4. **The guardian** (the adult child, possibly abroad) taps **Block** or **It's really fine** from their own authenticated device.
5. **The parent's screen updates live** with the child's decision.
6. Every step is written to a **timestamped warning record**: the evidence a bank needs.

## 4. Differentiation (never claim "first family alert")

| Existing | Gap we fill |
|---|---|
| SKT 에이닷 가족 케어 (Apr 2026): guardian alerts for scam **calls** | Ours covers **any channel** (KakaoTalk, SMS, transcripts) and is **two-way**: the family can block |
| Big-5 bank pilots: family alert on 65+ withdrawals (target end of 2026) | Ours works **across banks** and the child confirms **before** money moves |
| Telco in-call detection (Samsung, KT, LG U+) | Ours brings the **family into the loop** and keeps a **warning record** |

**The "Proving You're Human" angle:** scammers impersonate the child from a new number or with a cloned voice. Our confirmation can only come from the child's own authenticated session, which a scammer cannot fake by text or voice.

## 5. Users

| Role | Persona (demo) | Device | Language |
|---|---|---|---|
| `parent` | 엄마 (Kim Young-ja, 72, Seoul) | phone | Korean, large text |
| `guardian` | 아들 Joon (34, works in Singapore) | phone or laptop | English (Korean toggle) |

## 6. AI and agent features

| # | Feature | Implementation | P |
|---|---|---|---|
| A1 | Scam classification into Korean scam types | One LLM call with structured output (zod schema) | P0 |
| A2 | Risk score 0–100 | Same call | P0 |
| A3 | Red-flag extraction (why it's suspicious) | Same call, `red_flags: string[]` in Korean | P0 |
| A4 | Bilingual explanation, KO for the parent and EN for the guardian | Same call | P0 |
| A5 | **Agent action:** auto-hold, alert the guardian, write the audit record | Server logic driven by the score (threshold 60) | P0 |
| A6 | Prompt-injection safety | Scam text goes in a delimited block marked untrusted; the system prompt forbids following it | P0 |
| A7 | Screenshot reading (KakaoTalk screenshot) | Vision input to the same model | P1 |
| A8 | Family safe word (defence against voice clones) | Hashed safe word; the app prompts the parent to ask the caller for it | P1 |

**Scam types (DB value → Korean label):**
- `impersonation_authority` → 기관사칭형
- `impersonation_family` → 가족·지인사칭 메신저피싱
- `loan_fraud` → 대출빙자형
- `other_scam` → 기타 사기 의심
- `legit` → 정상

## 7. Scope

**P0 (must ship):**
1. Email and password login with 2 seeded users in one family. Row-level security on every table.
2. **Parent page:** channel picker, text area, a big "확인하기 / Check" button, and the latest result card.
3. `POST /api/checks`: membership check, insert the row as `analyzing`, call the LLM, update the row to `held` or `safe` (or `failed`), and write audit events.
4. **Guardian page:** live list of checks over Realtime. A high-risk alert card shows Block and Release buttons plus a `tel:` "Call Mom" link.
5. `POST /api/checks/:id/decision`: a compare-and-swap update (only from `held`), so a check can be decided exactly once. Writes an audit event.
6. Parent page updates live with the decision banner.
7. **Check detail page:** the audit timeline and an "Export warning record" button (JSON download).
8. Persistent label: **"Demo: synthetic messages · simulated bank hold · no real accounts."**

**P1 (only if P0 is done by 13:45):** A7 screenshot reading, A8 safe word, a KO/EN toggle for the guardian, push notifications.

**Out of scope:** real bank or telco integration, reading the phone's SMS automatically, call recording, real personal data, payments.

## 8. Architecture
```
Browser (parent)  ──POST /api/checks──▶  Next.js route ──▶ Anthropic (structured output)
        ▲                                      │
        │ Realtime (postgres_changes)          ▼
Browser (guardian) ◀──────────────  Supabase Postgres (RLS) ◀── audit_events
        └──POST /api/checks/:id/decision──▶ CAS update + audit
```
- **Stack:**
  - Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui
  - `@supabase/ssr`
  - Vercel AI SDK (`ai`, `@ai-sdk/anthropic`)
  - zod
  - Vercel
- **Patterns** are reused from the fleet's Cardinal app (`@supabase/ssr` client and server helpers). They are rewritten fresh in this repo, with no code copied from before the event.
- **Realtime** only notifies. Postgres is the source of truth. Clients re-fetch on reconnect.

## 9. Data model (`supabase/migrations/0001_init.sql`)
- `families(id, name, created_at)`
- `family_members(family_id, user_id, role parent|guardian, display_name, lang ko|en)`, primary key `(family_id, user_id)`
- `checks(id, family_id, submitted_by, channel, content, status, risk_score, scam_type, red_flags jsonb, explanation_ko, explanation_en, safe_action_ko, decided_by, decided_at, error, created_at, updated_at)`
- `audit_events(id, family_id, check_id, actor_id, actor_type user|ai|system, event_type, created_at)`

Rules:
- **Reads:** RLS lets family members read only their own family's rows.
- **Writes:** inserts and updates go through API routes only. They use the user's session and RLS policies that allow members to insert checks. Only guardians can update decisions, through the route.
- **Realtime:** `checks` and `audit_events` are added to the `supabase_realtime` publication.

## 10. API contract (frozen, so frontend and backend can build in parallel)
The types live in `lib/types.ts`. **Do not change them without telling the other person.**

| Method | Path | Body | 2xx | Errors |
|---|---|---|---|---|
| POST | `/api/checks` | `{ channel: Channel, content: string (1–4000) }` | `201 { check: Check }`, already analysed | `400` invalid, `401` not logged in, `403` not a member, `502 { check }` AI failed (status `failed`) |
| POST | `/api/checks/:id/decision` | `{ decision: "block" \| "release" }` | `200 { check: Check }` | `400`, `401`, `403` not a guardian, `404`, `409` already decided or not held |
| GET | `/api/me` | none | `200 { me: Member, family: Member[] }` | `401` |

**Client reads and Realtime** (ready-made hooks in `lib/hooks.ts`):
- `useMe()` → `{ me, family, loading }`
- `useFamilyChecks(familyId)` → `{ checks, loading }`, live updates, newest first
- `useCheckAudit(checkId)` → `{ check, events, loading }`, live

## 11. Security
- All keys stay server-side except the Supabase URL and publishable key. `.env.local` is never committed.
- RLS on every table, and every route checks membership server-side.
- Pasted content is untrusted: capped at 4,000 characters, sent in a delimited block, never rendered as HTML.
- Per-user rate limit on `/api/checks` (simple in-memory limit for the demo; noted as a known limitation).
- Compare-and-swap decision update prevents double decisions.

## 12. Ownership split (avoids merge conflicts)

| Area | Owner | Files |
|---|---|---|
| Backend, DB, AI, hooks | Sam | `supabase/**`, `app/api/**`, `lib/server/**`, `lib/supabase/**`, `lib/hooks.ts`, `lib/types.ts`, `proxy.ts` |
| Frontend UI | Teammate | `app/(app)/**` pages, `app/login/**`, `components/**`, `app/globals.css`, `lib/labels.ts` |
| Shared, read-only for the teammate | — | `lib/types.ts`, `lib/fixtures.ts` |

The frontend plan is in `09_FRONTEND_PLAN.md`.

## 13. Timeline (KST)

| By | Backend (Sam) | Frontend (teammate) |
|---|---|---|
| 11:50 | Scaffold, schema and RLS pushed, seed users, `.env` | Pull repo, build the layout and Parent page on fixtures |
| 12:40 | `/api/checks` with a real LLM, hooks working | Guardian page, alert card, status badges on fixtures |
| 13:20 | Decision route, Realtime verified in 2 browsers | Swap fixtures for hooks; detail page and timeline |
| 13:45 | **FEATURE FREEZE.** Bug fixes only | Polish, demo label, mobile check |
| 14:10 | Vercel deploy and environment variables | Production two-browser test |
| 14:40 | Record the video together (Sam narrates) | Drives the second browser |
| 15:00 | Submit the GitHub URL and the video | — |

**Cut order:** export button → KO/EN toggle → call link → animations. **Never cut:** a real AI verdict, the live guardian alert, the decision updating Mom's screen, the audit log.

## 14. Demo script (about 110 seconds)
- **0–12s:** "₩1.26조 lost to voice phishing in 2025. Scammers win by isolating parents. YC RFS: Aging + Proving You're Human."
- **12–30s:** Mom's phone view (Korean). Paste a synthetic prosecutor-impersonation text and tap 확인하기.
- **30–45s:** Verdict: 기관사칭형 · risk 92 · red flags · **HELD**.
- **45–65s:** Joon's laptop (English, "in Singapore") turns red without a refresh. He reads the flags and taps **Block**.
- **65–80s:** Mom sees "아들이 차단했습니다. 절대 송금하지 마세요."
- **80–95s:** A benign "엄마 저녁 먹었어?" message scores **safe** with no alert, so it doesn't cry wolf.
- **95–110s:** The warning-record timeline. "The evidence banks need under the coming no-fault law. Banks pay; families use it free."

## 15. Judge Q&A
- **SKT does this?** Calls only, and one-way. We cover KakaoTalk and SMS, work across banks, and the child blocks *before* money moves.
- **Who pays?** Banks. The liability bill exempts a bank that sufficiently warned the customer, and our log is that proof.
- **False positives?** The benign demo case. Then threshold tuning and family feedback.
- **Privacy?** We only check what Mom chooses to forward. Nothing is read automatically.
- **Why not just call Mom?** Scammers control her phone and tell her not to call. A verdict plus a block from the child's own device breaks the isolation.
- **Prompt injection?** Pasted text is treated as untrusted data.

## 16. Synthetic demo inputs (fictional)
1. **Authority impersonation:** "[서울중앙지검] 김영자님 명의 계좌가 범죄에 연루되어 수사 중입니다. 자산 보호를 위해 오늘 중 안전계좌로 이체하시고 이 사실은 가족에게도 알리지 마십시오. 담당 수사관 010-0000-0000"
2. **Family impersonation:** "엄마 나 폰 액정 깨져서 임시폰으로 연락해. 급하게 결제할 게 있는데 엄마 카드 사진이랑 비밀번호 좀 보내줘"
3. **Benign:** "엄마 저녁 먹었어? 이번 주말에 갈게"

## 17. Acceptance tests
- A non-member cannot read checks or call the routes (403).
- A check in browser A appears in browser B without a refresh.
- High risk gives status `held` and an alert; the benign message gives status `safe`.
- Block from the guardian makes the parent's banner change live, and a second decision returns 409.
- The audit timeline shows submitted → ai_verdict → held → blocked, with actors and times.
- Survives a refresh, and works on the production URL in two browsers.
