# Scam Shield Design System (`DESIGN.md`)

> **Domain:** Elder Financial Protection · Real-Time Bank Transfer Interception & Family Co-Signing  
> **Tracks:** AI for Aging Population · Proving You're Human

---

## 1. Aesthetic Direction & Dual-Persona Philosophy

Scam Shield serves two distinct personas in a single high-trust fintech product:

1. **Parent View (`/parent`) — Senior-First Korean Banking Safety Portal (`72세 어머니`):**
   - Warm, calm, high-contrast authority (`#0F2544` Deep Navy + `#F7F6F2` Warm Ivory).
   - Minimum `18px` (`text-lg`) body copy, `24px+` headings, `56px–64px` primary action targets, and `word-break: keep-all` so Korean Hangul syllables never split mid-word.
   - Zero jargon: Mom never has to guess if a message is a scam—her bank screens high-risk transfers automatically.

2. **Guardian Console (`/guardian`) & Forensic Audit (`/checks/[id]`) — Diaspora Child Command Center (`34세 아들 Joon`):**
   - Crisp bilingual (`EN` / `KO`) fintech operations console with real-time `BroadcastChannel` + Supabase Realtime synchronization.
   - High-signal risk visualization (`RiskMeter`, 6-stage `AgentPipeline`, `AgentTrace`, and exportable JSON `Warning Record` for Korea's Voice Phishing No-Fault Liability Act).

---

## 2. Color Tokens (`app/globals.css`)

| Token | Hex | Purpose |
| :--- | :--- | :--- |
| `--color-bg` | `#F7F6F2` | Warm ivory canvas (reduces glare for older eyes) |
| `--color-surface` | `#FFFFFF` | Elevated cards and interactive workspaces |
| `--color-ink` | `#101828` | Primary high-contrast body & heading ink (`16.5:1` on surface) |
| `--color-muted` | `#475467` | Secondary metadata & descriptions (`7.5:1` AAA contrast) |
| `--color-line` | `#E4E7EC` | Structural card & table borders |
| `--color-navy` | `#0F2544` | Primary institutional trust brand color |
| `--color-navy-2` | `#1B3B66` | Interactive navy hover & secondary badge state |
| `--color-danger` | `#B42318` | Urgent hold alerts & scam warnings |
| `--color-danger-bg` | `#FEF3F2` | Soft crimson surface tint for held/blocked cards |
| `--color-danger-ink` | `#7A271A` | Deep crimson emphasis & block action button |
| `--color-warn` | `#B54708` | Caution / medium risk (`35–59`) |
| `--color-safe` | `#067647` | Verified safe / protected asset metrics |

---

## 3. Typography & Korean CJK Rules

- **Primary Sans:** `Noto Sans KR`, `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Monospace / Financial Figures:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, `monospace` with `font-variant-numeric: tabular-nums`
- **CJK Line Breaking:**
  - `word-break: keep-all; overflow-wrap: break-word;` applied globally on `body` so Korean words wrap cleanly at spaces rather than breaking mid-syllable.

---

## 4. Layout & Responsive Grid Architecture

- **Desktop Multi-Column Container:** `max-w-7xl` (`1280px`) with `px-4 sm:px-6 lg:px-8` horizontal padding and a 12-column CSS Grid (`grid-cols-1 lg:grid-cols-12 gap-6`).
- **Homepage (`/`)**:
  - Full-bleed Navy Hero (`lg:col-span-7` value proposition + 4 National Police Agency metrics, `lg:col-span-5` live family co-signing status card).
  - **Live Split-Screen Simulator (`#simulator`)**: `lg:col-span-6` Mom's Bank App (`BankDemo`) side-by-side with `lg:col-span-6` Joon's Guardian Console (`CheckCard` + live Block/Release actions).
- **Parent Workspace (`/parent`)**:
  - Top row: 7-col protection banner + 5-col `StatsStrip`.
  - Main workspace: `lg:col-span-7` (`BankDemo` + manual SMS/Kakao/Call analyzer) + sticky `lg:col-span-5` (Latest AI Verdict `CheckCard` + History + 112/1332 Emergency Guide).
- **Guardian Command Center (`/guardian`)**:
  - Top row: 7-col Urgent Hold Alert banner + 5-col `StatsStrip`.
  - Main workspace: `lg:col-span-7` (Held transfer decision queue) + sticky `lg:col-span-5` (`FamilyCard` + Resolved activity + Policy rules & Compliance link).
- **Forensic & Liability Record (`/checks/[id]`)**:
  - `lg:col-span-6` (`CheckCard` + raw JSON certificate preview) + `lg:col-span-6` (`AgentTrace` + timestamped `Warning Record` timeline).

