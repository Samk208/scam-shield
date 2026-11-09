# Scam Shield: 2-minute demo recording

## Setup (5 min)
1. **App:** http://localhost:3005. Sam's machine is already running it.
2. **Window A (Mom):** Chrome, normal window. Open DevTools (F12) and turn on device mode → iPhone 12 Pro, or just make the window narrow. Sign in with the **엄마 (Parent)** button.
3. **Window B (Joon):** Chrome **Incognito** window (Ctrl+Shift+N), so it has a separate login. Sign in with the **Joon (Guardian)** button. Keep it desktop width.
4. Put them side by side: Mom on the left, narrow; Joon on the right.
5. **Recorder:** Loom or OBS, full screen, microphone on. Click once anywhere in Joon's window so the alert chime is allowed to play.
6. **Dry run once, then reset.** To reset, ask Claude to clear the demo checks, or run on your machine in PowerShell:
   `docker exec supabase_db_scam-shield psql -U postgres -c "delete from public.checks"`

## Script (target 1:50; the limit is 2:00)

| Time | On screen | Say (English) |
|---|---|---|
| 0:00–0:12 | Login screen | "In 2025, Koreans lost a record 1.26 trillion won to voice phishing. Scammers win by isolating parents. This is Scam Shield, for YC's *AI for the Aging Population* and *Proving You're Human* requests." |
| 0:12–0:25 | Mom: tap **예시: 검찰 사칭**, then **확인하기** | "Mom gets a text from the 'prosecutor's office' telling her to move money to a safe account and tell no one. She forwards it to Scam Shield." |
| 0:25–0:40 | Mom: scanning animation, then the red **사기 의심** card at risk 98 | "Our agent extracts indicators, scans for Korean scam playbook signals, and Claude reasons over that evidence. Risk 98: authority impersonation. The transfer is put on hold." |
| 0:40–0:58 | Joon: the red alert appears live, with a chime | "Her son Joon is in Singapore. He's alerted instantly, in English, with the red flags." |
| 0:58–1:08 | Joon: tap **Block transfer**. Mom's card turns to **가족이 차단했어요** | "He blocks it. Mom's screen changes immediately. The AI can hold money, but it can never release it. Only her real child, on his own verified device, can do that. That's how we prove you're human." |
| 1:08–1:22 | Mom: **예시: 일상 안부**, then 확인하기, which comes back green and safe. Joon gets no alert. | "A normal message from family? Risk 4, no alert. It doesn't cry wolf." |
| 1:22–1:42 | Open **AI 판단 과정 · 기록 보기** on the blocked check. Scroll through the agent trace and warning record. | "Every decision is auditable: perceive, tools, reason, policy, human. And this timestamped warning record is exactly what banks need under Korea's pending no-fault liability law." |
| 1:42–1:52 | Joon window | "SKT's alerts cover calls, one way. We cover KakaoTalk, SMS and calls, across every bank, and the family confirms before the money moves. Banks pay; families use it free. Scam Shield." |

## If something breaks while recording
- **Slow verdict:** keep talking over the scanning animation. It takes about 6 seconds.
- **No live update on Joon's screen:** refresh Joon's window once. The data is in Postgres.
- **Messed-up take:** reset with the command in Setup step 6 and record again.

## Upload
Upload to Loom or YouTube (unlisted is fine) and check that it's **2:00 or under**. Submit the video link and https://github.com/Samk208/scam-shield. Before submitting, either make the repo public or confirm the organisers can access a private one.
