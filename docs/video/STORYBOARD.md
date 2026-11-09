# Scam Shield: demo video storyboard

**File:** `docs/video/scam-shield-demo.mp4`. It runs 1:51.8 at 1920×1080 and 30 fps (H.264), with a silent AAC track.
**Rebuild it:** `python docs/video/make_video.py`. This needs Pillow, numpy and ffmpeg. It uses the screenshots in `docs/pitch/`.
**Captions:** all captions are burned into the frames, so the video works with the sound off. Sam can record the voiceover below over it in Loom, or use the YouTube editor.
**Honesty:** a footer on every app scene reads "Synthetic demo messages · bank hold is simulated". Every number in the video comes from `docs/PRD.md` §2 (National Police Agency, via iNews24 / Korea Herald).

## Lessons from mru-proof-of-trade (Midnight Korea Hackathon, Sept 2026; did not place)

Sources: the MRU memory (`midnight-proof-of-trade-strategy-2026-09-29`), brain page `projects/mru-midnight-hackathon-2026-09-27.md`, and the repo README. The video itself (youtu.be/KbR1AOeDbto) was not re-watched. Points 1–4 are documented; 5–6 are inferred from the README's "demo scenario, about 2.5 minutes, real proofs".

1. **No live product that judges could touch.** Judges needed WSL, Docker and compact 0.31.1 to run it. The winner had a hosted, wallet-free demo. **Here:** real app screens make up most of the video's middle, and the close shows the repo. Add the Vercel URL to the close card once it is live.
2. **The problem was not local.** It solved a West African problem at a Korea hackathon, while the winners solved Korean problems (public programs, jeonse). **Here:** the hook is a Korean statistic, ₩1.26조, and the scam is a Korean authority-impersonation text.
3. **The depth looked thin.** It had 94 lines and 9 tests against the winners' 145–1,290 lines and 58–118 tests. **Here:** a dedicated "What the AI does" card, the agent-loop diagram, the real agent trace, and "11/11 e2e tests" in the footer.
4. **"Next steps" were things rivals had already built.** **Here:** there is no roadmap slide. Every claim shown is already in the app.
5. **A protocol-first story.** Merkle trees and commitments come before a person. **Here:** a person (Mom, then Joon) appears in scene 4, and the mechanism follows the story.
6. **A long terminal-style demo** (the scenario alone ran about 2.5 minutes). **Here:** 111 seconds, 16 scenes, none longer than 9 seconds, one idea per scene, and big type.

## Timeline and voiceover (≈ 2.4 words/s; read at a calm pace)

| Time | Scene (on screen) | Voiceover (optional) |
|---|---|---|
| 0:00–0:06 | **₩1.26조**: lost to voice phishing in Korea in 2025, +47%, 23,360 cases | "In 2025, Koreans lost a record 1.26 trillion won to voice phishing. Up forty-seven percent." |
| 0:06–0:14 | "Scammers isolate parents." 78.6% authority impersonation; 60s victims +85.4% | "Scammers win by isolating parents. Most losses come from fake prosecutors, and victims in their sixties are up eighty-five percent." |
| 0:14–0:19.5 | Logo: Mom forwards it. AI holds the transfer. Her real child decides. | "This is Scam Shield." |
| 0:19.5–0:24.5 | App login (PWA): Mom and Joon on two devices | "Mom is in Seoul. Her son Joon is in Singapore." |
| 0:24.5–0:33.5 | Mom: risk 98, 기관사칭형, red flags | "Mom gets a fake prosecutor's text. She forwards it. Risk ninety-eight, authority impersonation, and the transfer goes on hold." |
| 0:33.5–0:40 | Joon: live alert, in English | "Joon is alerted instantly, in English." |
| 0:40–0:47.5 | Joon: Block transfer | "He blocks it. Only her real child, on his own device, can release a hold. A cloned voice can't." |
| 0:47.5–0:53.5 | Mom: 가족이 차단했어요 | "Mom's screen updates live." |
| 0:53.5–1:06 | Animated agent loop: Perceive → Tools → Reason → Policy → Human → Audit. Ends on "AI can hold money. It can never release it." | "Tools gather the evidence, Claude reasons, and a deterministic policy holds at sixty or above. A human decides. AI can hold money. It can never release it." |
| 1:06–1:13.5 | Real agent trace screen | "Every decision is on the record, step by step." |
| 1:13.5–1:19.5 | Warning-record timeline | "A timestamped proof that she was warned." |
| 1:19.5–1:28.5 | AI features list | "It classifies the scam, scores risk, explains in Korean and English, and resists prompt injection." |
| 1:28.5–1:36.5 | Why us vs SKT 에이닷 가족케어 | "SKT alerts on calls, one way. We cover every channel, across banks, before money moves." |
| 1:36.5–1:45.5 | Business: banks pay, no-fault bill "sufficiently warned" exemption; YC RFS badges | "Banks pay. The pending no-fault bill exempts banks that warned the customer, and our record is that proof." |
| 1:45.5–1:51.8 | Close: logo + github.com/Samk208/scam-shield | "Scam Shield." |

## Upload (Sam's step)

**YouTube, unlisted (recommended):**
1. Go to studio.youtube.com, then **Create → Upload videos**, and choose `C:\Users\Lenovo\Desktop\CaSam\scam-shield\docs\video\scam-shield-demo.mp4`.
2. **Title:** `Scam Shield — c0mpiled-17 Seoul demo`. **Description:** the repo URL, plus "Synthetic demo messages; bank hold is simulated."
3. **Audience:** "No, it's not made for kids". Click Next, Next, Next.
4. **Visibility:** **Unlisted**, then **Save**. Copy the `youtu.be/…` link.
5. Open the link in a private window to check that it plays and shows **1:51**.
6. **Optional voiceover:** the easiest way is Loom (below) while the MP4 plays full-screen. YouTube Studio's editor can only add music.

**Loom, with your voice:** Loom desktop → **Screen + Cam** (or Screen only) → **Full screen**, mic on. Play the MP4 full-screen and read the voiceover column. Stop at 1:52, then **Share → Copy link**. Check that the length is under 2:00.

**Submit:** the video link plus https://github.com/Samk208/scam-shield. The repo must be public, or the organisers must have access.
