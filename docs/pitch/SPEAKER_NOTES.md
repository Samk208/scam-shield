# Scam Shield: 3-minute pitch script and judge Q&A

Generated from the deck's speaker notes. Deck: https://claude.ai/artifact/UeMWaML5GiuVXecrQqgKGX · files: Scam_Shield_Pitch_Deck.pptx / .pdf

**One-line pitch:** We help Korean banks stop voice-phishing transfers by customers over 65. Our AI flags the risky transfer, the bank holds it, and the customer's own child confirms or blocks it.

## 1. cover
(0:00–0:10) In 2025, Koreans lost a record 1.26 trillion won to voice phishing. Scammers win by cutting parents off from their families. Scam Shield helps banks stop these transfers. Our AI flags a risky transfer, the bank holds it, and the customer's own child confirms or blocks it from their phone.

## 2. contents
(skip aloud) Contents slide: show for a beat, then go straight to the problem.

## 3. problem
(0:10–0:30) Losses hit 1.26 trillion won last year, up 47 percent, about 54 million won per case. 78.6 percent came from people impersonating prosecutors and the FSS. And victims in their 60s rose 85 percent. The playbook is always the same: isolate the parent. "This is a secret investigation. Don't tell your family." Then a malicious app takes over the phone.

## 4. whynow
(0:30–0:45) Why now? Today banks almost never pay: 18 claims out of 173 under the voluntary scheme. A no-fault liability bill is pending, and the FSC estimates banks would pay 110 to 281 billion won a year. But a bank is exempt if it sufficiently warned the customer, and the bank has to prove it. That proof is what we produce.

## 5. solution
(0:45–1:05) Scam Shield works at the moment money moves. When a customer over 65 sends a large sum to a new payee, the bank calls our agent. It reads the transfer and any suspicious message or call on file, scores it, and the bank holds the money. Her son Joon gets the alert and taps Block. Mom's screen updates instantly. Next, incoming texts are screened automatically, and anyone can still forward one. In the demo the bank API is simulated.

## 6. agent
(1:05–1:25) Under the hood is one agent loop. The bank sends the transfer attempt with its context. Deterministic tools pull out indicators and scan for eight Korean scam signals. Claude reasons over that evidence. Then a fixed policy, not the model, decides: risk 60 or above, or any large transfer to a new payee, means hold and alert. The AI can hold money, but it can never release it. Only a human, the real child, can do that.

## 7. demo
(1:25–1:40) In the demo, Mom taps 이체하기 to send 30 million won to a "safe account" she has never paid before. Our simulated bank API calls the agent: new payee, large amount, safe-account wording. Claude says authority impersonation, risk 98, and the transfer is held. Joon blocks it. A 200,000 won allowance to her son goes straight through. Every step is in the trace and a timestamped warning record.

## 8. compete
(1:40–1:55) Family alerts already exist, and we say so. SKT alerts guardians, but for calls only, and one-way. The big-5 banks are piloting family alerts, each for its own customers. Nobody lets the family confirm before the money moves, across every channel and every bank. That's our wedge.

## 9. model
(1:55–2:10) Who pays? Banks: they own the transfer, so they call our agent. Under the bill they'd face 110 to 281 billion won a year in payouts, and our hold plus warning record cuts both the losses and the liability. Families use it free: telcos already give detection away, so charging Mom would lose. Pricing we'll set in a bank pilot, not on a slide.

## 10. market
(2:10–2:22) Market: 1.26 trillion won in harm a year; 988 billion of it is the authority-impersonation scam our family loop is built for. The bank payout pool is 110 to 281 billion won a year. Every one percent of that we help banks avoid is 1.1 to 2.8 billion won. That's arithmetic, not a forecast.

## 11. rfs
(2:22–2:35) This hits two YC requests. AI for the aging population: victims in their 60s rose 85 percent, and Mom doesn't have to do anything: her bank checks for her. And proving you're human: a scammer can fake a text or clone a voice, but they can't fake the real son confirming from his own logged-in device.

## 12. roadmap
(2:35–2:45) Today: the full loop works, including the transfer intercept on a simulated bank API. Next: automatic screening of incoming texts, phone and Kakao login, and family invites. Then a bank pilot, where the hold becomes a real hold and our warning record goes into the bank's case file.

## 13. team
(2:45–2:52) We're two founders based in Seoul, and we built this today. Sam built the backend, the security and the agent. Casimir has been an entrepreneur in Korea for over ten years and builds communities; he leads go-to-market.

## 14. close
(2:52–3:00) Scammers win by isolating parents. Scam Shield stops the transfer before the money leaves, puts the family in the decision, and gives banks the proof they warned. We're looking for a bank partner for a sandbox pilot. Thank you.

JUDGE Q&A (answer in 20 seconds or less; never argue):
1. Isn't this manual? Mom is the one being fooled. No: the main trigger is the bank. When a 65+ customer sends a large sum to a new payee, the bank calls our agent and holds the transfer. Mom does nothing. Automatic message screening is next; forwarding is only a fallback.
2. SKT already does this? Calls only, and one-way. We act at the transfer, across banks, and the child blocks before money moves.
3. Who pays? Banks. They own the transfer, and the liability bill exempts a bank that sufficiently warned the customer. Our timestamped record is that proof.
4. False positives? A normal family message scores safe with no alert, and only risky transfers (new payee, large amount) are checked at all. Next: tune the threshold on real pilot data.
5. Privacy? In the bank flow we use only transfer data the bank already holds, under consent from both sides. Message screening will run on-device, as the telcos' detection does.
6. Why not just call Mom? Scammers control her phone and tell her not to call. A verdict plus a block from the child's own device breaks the isolation.
7. Prompt injection? Message text is fenced as untrusted data, and two or more playbook signals floor the risk at 70, so a planted "this is safe" can't release a hold.

## Sources
NPA via iNews24 (2026-09-23); Kyungbuk Maeil (2025-09-30); FSC via Money Today (2026-09-15); BizWatch (2026-11-05); Kyunghyang/Kukinews (2025-10-10); SKT Newsroom (2026-04-27); Herald Biz; Byline Network (2026-02-12); Financial News (2026-10-06); CUInsight.
