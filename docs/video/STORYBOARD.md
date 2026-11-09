# Scam Shield: demo video storyboard (v3, real bank-trigger footage)

**File:** `docs/video/scam-shield-demo.mp4`. It runs **1:54.8** at 1920×1080 and 30 fps (H.264), with an **English AI voiceover** (`en-US-AndrewMultilingualNeural`, through the free Edge read-aloud voice; there is no API key or cost). Captions are burned in, and `voiceover.srt` holds closed captions to upload to YouTube.
**Rebuild it:** `python docs/video/make_video.py`. This needs Pillow, ffmpeg and `pip install edge-tts`. The voice clips are cached in `docs/video/.vo/`.
**Story change (v2, Sam's feedback):** the trigger is **automatic**. When Mom starts a transfer to a new payee, the bank asks Scam Shield and the transfer is held until her real child confirms. Message screening is shown as ROADMAP, and forwarding is shown as the FALLBACK, which is live today. Key line: "Mom doesn't have to recognise the scam. The money can't move until her real child confirms."
**Honesty:** footers say "bank integration simulated" and "Synthetic demo messages · bank hold is simulated". Scenes 2 and 6–8 and the trace are **real app screenshots** captured at 390px from localhost:3006 by `docs/video/capture_bank.py` into `docs/pitch/bank-*.jpg`. The bank itself is simulated inside the app. Only the opening SMS phone is drawn.

## Timeline

| Time | Scene | Voiceover (built in) |
|---|---|---|
| 00:00–00:07 | Hook: the scam SMS types itself onto Mom's phone (drawn) | Mom just got this text. A prosecutor says her account is linked to a crime. Move the money today. Tell no one. |
| 00:07–00:17 | LIVE APP: Mom's bank card sends ₩30,000,000 to a new payee → 은행이 확인 중… → 이체가 보류됐어요, risk 98 + TRANSFER HELD stamp | She believes it, and opens her bank app. Before the money moves, the bank asks Scam Shield. Risk ninety-eight. Transfer held. Mom didn't have to spot a thing. |
| 00:17–00:25 | ₩1.26조 counter, +47% | Scams like this cost Koreans a record one point two six trillion won last year. Up forty-seven percent. |
| 00:25–00:31 | 78.6% / +85.4% stats | Most losses come from fake authorities, and victims in their sixties are up eighty-five percent. |
| 00:31–00:41 | Three triggers: 1 bank intercept (PRIMARY, live in demo, simulated bank), 2 automatic screening (ROADMAP), 3 forward (FALLBACK) | Mom never has to spot the scam. Risky transfers trigger it at the bank. Next, messages get screened automatically. Forwarding is just the fallback. |
| 00:41–00:49 | LIVE APP: Joon's red banner, "Mom is trying to send ₩30,000,000…" | Her son Joon, in Singapore, is alerted live: Mom is trying to send thirty million won to a new account. |
| 00:49–00:56 | LIVE APP: Block transfer | He taps block. Only her real child, on his own signed-in device, can release a hold. A cloned voice can't. |
| 00:57–01:00 | LIVE APP: Mom's card reads 자녀가 이체를 막았어요 | Mom's bank screen updates instantly. |
| 01:00–01:12 | Animated agent loop + console with the real trace, including assess_transfer | Under the hood, deterministic tools extract indicators, scan a Korean scam playbook and assess the transfer. Claude reasons. Then a fixed policy holds anything at sixty or above. |
| 01:12–01:15 | AI can hold money. It can never release it. | So the AI can hold money. It can never release it. |
| 01:16–01:22 | Prompt-injection guard | And a prompt-injected 'this is safe' can't talk it down. Two playbook signals floor the risk at seventy. |
| 01:23–01:27 | LIVE APP: /checks/[id] trace scrolling into the warning record | Every step is saved as a timestamped warning record. |
| 01:27–01:34 | Tech stack + 14/14 tests | Built today: Next.js, Supabase Realtime and Claude. Fourteen of fourteen tests pass. |
| 01:35–01:41 | Why us vs SKT 에이닷 가족케어 | SKT's family care covers calls, one way. We sit at the transfer, across banks, before money moves. |
| 01:42–01:49 | Business + YC RFS | Banks pay. The pending no-fault bill exempts banks that sufficiently warned the customer. Our record is that proof. |
| 01:49–01:54 | Close | Scam Shield. Mom's money can't move until her real child confirms. |

## Lessons from mru-proof-of-trade (Midnight Korea Hackathon, Sept 2026; did not place)

Sources: the MRU memory (`midnight-proof-of-trade-strategy-2026-09-29`), brain page `projects/mru-midnight-hackathon-2026-09-27.md`, and the repo README. The video itself (youtu.be/KbR1AOeDbto) was not re-watched. Points 1–4 are documented; 5–6 are inferred from the README's "demo scenario, about 2.5 minutes, real proofs".

1. **No live product that judges could touch.** Judges needed WSL, Docker and compact 0.31.1 to run it. The winner had a hosted, wallet-free demo. **Here:** real app screens make up most of the video's middle, and the close shows the repo. Add the Vercel URL to the close card once it is live.
2. **The problem was not local.** It solved a West African problem at a Korea hackathon, while the winners solved Korean problems (public programs, jeonse). **Here:** the hook is a Korean statistic, ₩1.26조, and the scam is a Korean authority-impersonation text.
3. **The depth looked thin.** It had 94 lines and 9 tests against the winners' 145–1,290 lines and 58–118 tests. **Here:** a dedicated "What the AI does" card, the agent-loop diagram, the real agent trace, and "11/11 e2e tests" in the footer.
4. **"Next steps" were things rivals had already built.** **Here:** there is no roadmap slide. Every claim shown is already in the app.
5. **A protocol-first story.** Merkle trees and commitments come before a person. **Here:** a person (Mom, then Joon) appears in scene 4, and the mechanism follows the story.
6. **A long terminal-style demo** (the scenario alone ran about 2.5 minutes). **Here:** 115 seconds, 17 scenes, under 13 seconds each, with motion in every scene and a voiceover, one idea per scene, and big type.

## Upload (Sam's step)

**YouTube, unlisted (recommended):**
1. Go to studio.youtube.com, then **Create → Upload videos**, and choose `C:\Users\Lenovo\Desktop\CaSam\scam-shield\docs\video\scam-shield-demo.mp4`.
2. **Title:** `Scam Shield — c0mpiled-17 Seoul demo`. **Description:** the repo URL, plus "Synthetic demo messages; bank hold is simulated."
3. **Audience:** "No, it's not made for kids". Click Next, Next, Next.
4. **Visibility:** **Unlisted**, then **Save**. Copy the `youtu.be/…` link.
5. Open the link in a private window to check that it plays and shows **1:54**.
6. **Captions:** in Studio, go to Subtitles → Add language English → Upload file → With timing, and choose `docsideooiceover.srt`.

**Loom, if you'd rather use your own voice** (mute the built-in voiceover): Loom desktop → **Screen + Cam** (or Screen only) → **Full screen**, mic on. Play the MP4 full-screen and read the voiceover column. Stop at 1:55, then **Share → Copy link**. Check that the length is under 2:00.

**Submit:** the video link plus https://github.com/Samk208/scam-shield. The repo must be public, or the organisers must have access.
