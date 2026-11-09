# Scam Shield: frontend plan (for the frontend teammate)

**Goal:** make the three demo screens look trustworthy, calm and obvious in the 2-minute video. All the data plumbing (auth, AI, database, live updates) already works. You own the look and the UX.

Read the "What it is" section of `docs/PRD.md` first (5 minutes).

---

## 0. Setup (10 min)

Run on your machine (PowerShell):
```powershell
git clone <repo-url>; cd scam-shield; pnpm install
```

- Get the `.env.local` values from Sam privately, by DM. Never commit them.
- Run `pnpm dev` and open http://localhost:3000.
- **No backend yet?** Build on fixtures. Import `fixtureChecks`, `fixtureEvents` and `fixtureMembers` from `lib/fixtures.ts` and render your components with them. Swap to the real hooks later; it's a one-line change.

## 1. Rules so we don't collide

| You own (edit freely) | Read-only for you (ask Sam first) |
|---|---|
| `app/(app)/parent/page.tsx`, `app/(app)/guardian/page.tsx`, `app/(app)/checks/[id]/page.tsx`, `app/login/page.tsx` | `lib/types.ts` (the contract) |
| `components/**` (create any files) | `lib/hooks.ts`, `lib/server/**`, `app/api/**` |
| `app/globals.css`, `app/layout.tsx` (fonts, metadata) | `supabase/**`, `proxy.ts`, `scripts/**` |
| `lib/labels.ts` (wording and translations) | |

- Work on branch `frontend`. Commit small and often, push every ~30 minutes, and Sam merges.
- The skeleton pages already work end to end. **Restyle them; don't rewrite the data calls.**

## 2. Data you get (already wired)

```ts
const { me, family } = useMe();                         // me.role: "parent" | "guardian", me.lang
const { checks } = useFamilyChecks(me?.family_id);     // live, newest first
const { check, events } = useCheckAudit(id);           // live, for the detail page
await submitCheck(channel, content);                   // returns { check } or { error }
await decideCheck(id, "block" | "release");            // returns { check } or { error }
```

- **`check.status`:** `analyzing` → `safe` | `held` → `blocked` | `released` (or `failed`)
- **Labels:** `SCAM_TYPE_LABEL`, `STATUS_LABEL` and `CHANNEL_LABEL` in `lib/labels.ts`, each with `.ko` and `.en`.
- **Risk:** `check.risk_score` (0–100). 60 or above means held.

## 3. Screens, in priority order

### P0-1: Parent screen `/parent`, Mom aged 72, phone, Korean (by 12:40)
- Large type: base 20px or more, buttons 56px or taller. High contrast. One action per screen.
- **Header:** "🛡️ 의심 메시지 확인" plus her name.
- **Channel picker:** three big segmented buttons: 문자 / 카카오톡 / 통화 내용.
- **Textarea:** with a "붙여넣기" hint. A "예시 넣기" demo button that fills one of the three demo texts (PRD §16) makes recording easier.
- **Big red "확인하기" button.** While it runs, show "AI가 확인 중…" with a spinner. It takes about 5–10 seconds.
- **Result card, by status:**
  - **held:** red, with a shield icon. "⚠️ 사기 의심. 송금하지 마세요. 아들에게 확인 요청을 보냈어요." Show the scam type, the red flags as a short list, and `safe_action_ko`.
  - **blocked:** full-width deep red banner: "아들이 차단했습니다. 절대 송금하지 마세요." This is the money shot in the video, so make it unmistakable and animate it in.
  - **released:** green: "아들이 안전하다고 확인했어요."
  - **safe:** green: "안전한 메시지로 보여요."
  - **failed:** amber, with a retry button.

### P0-2: Guardian screen `/guardian`, Joon in Singapore, laptop, English (by 13:20)
- **Top alert bar** when any check is `held`: "⚠️ Mom forwarded a likely scam. Transfer on hold."
- **Alert card:**
  - Scam type in English
  - Risk score as a meter or badge
  - Red flags (Korean; `explanation_en` gives the English summary)
  - Original message, collapsible
  - Time
- **Three buttons:** **Block** (primary, red), **It's really fine** (secondary), **📞 Call Mom**.
- **After a decision:** the card collapses to "Blocked by you · 13:21". Disable the buttons while the request is in flight.
- **Feed below:** older checks, compact.
- **Live arrival:** a subtle flash or highlight plus a sound (optional) when a new check appears. The video shows this screen changing with no refresh, so make the arrival noticeable.

### P0-3: Warning record `/checks/[id]` (by 13:40)
- Check summary on top. Vertical timeline:
  - submitted (Mom)
  - AI verdict
  - HOLD
  - guardian alerted
  - blocked (Joon)

  Each step shows a timestamp and an icon.
- **"Export warning record"** button. The logic already exists. Add a subtitle: "Evidence of warning for bank liability review."

### P0-4: Login `/login` (15 min)
- Logo, a one-line tagline ("Family-confirmed protection against voice phishing") and the demo label.

### Everywhere
- **Persistent footer:** `DEMO_LABEL` ("Demo: synthetic messages · simulated bank hold · no real accounts").
- **Mobile first:** test at 375px.

## 4. Visual direction
- **Mood:** trustworthy and calm, like a bank or Toss. Not hacker-red everywhere.
- **Palette:** white background, deep navy primary, red only for danger states, green for safe.
- **Font:** Pretendard for Korean, via CDN or `next/font/local`. If that's fiddly, fall back to system fonts.
- **Icons:** lucide-react is fine (`pnpm add lucide-react`). Tell Sam before adding any other package.
- **Never render message content as HTML.** Plain text only, as React does by default. Don't use `dangerouslySetInnerHTML`.

## 5. Checklist before 13:45 freeze
- [ ] Parent: paste → verdict → red held card, at 375px.
- [ ] Guardian: a new held check appears without a refresh; Block works; the card shows its decided state.
- [ ] Parent's card changes to the "차단" banner live after Block.
- [ ] Benign message → green safe card, and no alert on the guardian screen.
- [ ] Warning-record timeline and export work.
- [ ] Demo label visible on every screen.
- [ ] `pnpm lint` and `pnpm build` pass.

## 6. Demo recording (14:10–14:40)
- Two browser windows side by side: Mom in a phone-sized window on the left (Korean), Joon on the right (English).
- Sam narrates; you drive Joon's window.
- Script: PRD §14.
