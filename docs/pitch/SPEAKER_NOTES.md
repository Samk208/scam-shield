# Scam Shield: 3-minute pitch script and judge Q&A

Deck: https://claude.ai/artifact/UeMWaML5GiuVXecrQqgKGX (13 slides; speaker notes are in each slide too). Export to PPTX or PDF from the deck's download menu.

## Script (3:00)

| Time | Slide | Say |
|---|---|---|
| 0:00–0:10 | 1 Cover | In 2025, Koreans lost a record 1.26 trillion won to voice phishing. Scammers win by cutting parents off from their families. Scam Shield puts the family back in the loop: Mom forwards anything suspicious, our AI agent holds the transfer, and only her real child can release it. |
| 0:10–0:30 | 2 Problem | Losses were up 47 percent, about 54 million won per case. 78.6 percent came from people impersonating prosecutors and the FSS. Victims in their 60s rose 85 percent. The playbook: isolate the parent. "Secret investigation. Don't tell your family." |
| 0:30–0:45 | 3 Why now | Today banks almost never pay: 18 claims out of 173. A no-fault bill is pending; the FSC estimates banks would pay 110 to 281 billion won a year. A bank is exempt if it sufficiently warned the customer, and the bank must prove it. |
| 0:45–1:05 | 4 Solution | The real app. Mom forwards a fake prosecutor text: risk 98, transfer on hold. Joon in Singapore is alerted live and taps Block. Mom's screen changes instantly. The hold is simulated; the messages are synthetic. |
| 1:05–1:25 | 5 How it works | One agent loop. Deterministic tools extract indicators and scan eight Korean scam signals; Claude reasons; a fixed policy decides: risk 60+ means hold. The AI can hold money, never release it. |
| 1:25–1:40 | 6 Demo | Every decision is auditable: the agent trace and a timestamped warning record. A normal "did you eat dinner?" scores safe, no alert. |
| 1:40–1:55 | 7 Why us | SKT alerts guardians for calls only, one-way. Banks are piloting alerts, each for its own customers. Nobody lets the family confirm before money moves, across every channel and bank. |
| 1:55–2:10 | 8 Model | Banks pay; families use it free. Our record is the "sufficient warning" evidence. Pricing gets set in a bank pilot. |
| 2:10–2:22 | 9 Market | 1.26 trillion won of harm; 988 billion is authority impersonation. Bank payout pool 110–281 billion. Each 1% avoided = 1.1–2.8 billion won. Arithmetic, not a forecast. |
| 2:22–2:35 | 10 YC RFS | AI for the Aging Population: Mom learns nothing new. Proving You're Human: a scammer can fake a text or a voice, not the real son confirming from his own device. |
| 2:35–2:45 | 11 Roadmap | Today the full loop works, 11/11 e2e tests. Next: phone/Kakao login, family invites. Then a bank pilot with a real hold. |
| 2:45–2:52 | 12 Team | We're two founders based in Seoul, and we built this today. Sam built the backend, the security and the agent. Casimir has been an entrepreneur in Korea for over ten years and builds communities; he leads go-to-market. |
| 2:52–3:00 | 13 Ask | Scammers isolate parents. We put the family back in the loop. We're looking for a bank partner for a sandbox pilot. Thank you. |

## Judge Q&A (from PRD §15; answer in ≤20 s, never argue)
1. **SKT already does this?** Calls only, and one-way. We cover KakaoTalk, SMS and call transcripts, work across banks, and the child blocks *before* money moves.
2. **Who pays?** Banks. The liability bill exempts a bank that sufficiently warned the customer, and our timestamped record is that proof.
3. **False positives?** The benign demo case scores safe with no alert. Next: threshold tuning and family feedback.
4. **Privacy?** We only check what Mom chooses to forward. Nothing is read automatically.
5. **Why not just call Mom?** Scammers control her phone and tell her not to call. A verdict plus a block from the child's own device breaks the isolation.
6. **Prompt injection?** Pasted text is fenced as untrusted data; two or more playbook signals floor the risk at 70, so a planted "this is safe" can't release a hold.

## Open items (TO CONFIRM)
- Casimir's role label ("go-to-market, community, demo") is my wording from his LinkedIn headline; change it if you split roles differently.
- Price per protected customer: deliberately not set (no sourced benchmark for Korea).

## Sources used in the deck
- NPA via Rep. Kwon Young-jin, iNews24 2026-09-23 (₩1.2578조, +47.2%, 23,360 cases, ₩5,384만/case, 78.6% / ₩9,884억 authority impersonation)
- Kyungbuk Maeil 2025-09-30 (60s victims +85.4%, Jan–Jul 2025)
- Money Today 2026-09-15 (FSC ₩1,098억–2,811억/yr; exemption; burden of proof); BizWatch 2026-11-05 (bill not yet law)
- Kyunghyang / Kukinews 2025-10-10 (18 of 173 voluntary claims paid)
- SKT Newsroom 2026-04-27; Herald Biz (bank pilot); Byline Network 2026-02-12; Financial News 2026-10-06; CUInsight (Carefull)

## Screenshots (this folder)
`01-mom-risk98.jpg`, `02-joon-alert-block.jpg` (+ `02a-joon-alert-top.jpg`), `03-mom-blocked.jpg`, `04a-agent-trace.jpg`, `04b-warning-record.jpg`, `04c-check-detail-top.jpg`, `00-login.jpg`. Captured 2026-11-09 at 375×812; demo data reset afterwards.
