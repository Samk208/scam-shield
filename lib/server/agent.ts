import "server-only";
import { analyzeMessage, type Verdict } from "@/lib/server/analyze";
import { HOLD_THRESHOLD, type AgentStep, type Channel, type Indicators } from "@/lib/types";

/**
 * Scam Shield Agent: Perceive -> Tools -> Reason -> Policy -> Human -> Audit.
 * The LLM only *reasons*; deterministic tools gather evidence and a deterministic policy decides the action.
 * The agent can HOLD but never RELEASE money: only the guardian (human) can release.
 */

// Tool 1: extract indicators (links, phone numbers, account-like numbers, amounts).
export function extractIndicators(text: string): Indicators {
  const uniq = (xs: string[]) => [...new Set(xs)].slice(0, 10);
  return {
    urls: uniq(text.match(/\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|kr|co\.kr|me|ly|xyz|top|site)\b\S*/gi) ?? []),
    phones: uniq(text.match(/\b0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}\b/g) ?? []),
    accounts: uniq((text.match(/\b\d{2,6}-\d{2,6}-\d{2,8}\b/g) ?? []).filter((x) => !/^0\d{1,2}-/.test(x))),
    amounts: uniq(text.match(/\d[\d,]*\s?(?:만\s?원|원|만원|억)/g) ?? []),
  };
}

// Tool 2: scan for known Korean scam playbook signals (from FSS / police public guidance patterns).
const SIGNALS: { id: string; label: string; re: RegExp }[] = [
  { id: "safe_account", label: "'안전계좌' 이체 요구", re: /안전\s*계좌|보호\s*계좌|국가\s*안전/ },
  { id: "authority", label: "검찰·경찰·금감원 사칭", re: /검찰|지검|수사관|경찰청|금융감독원|금감원|사이버수사/ },
  { id: "secrecy", label: "비밀 유지·가족에게 알리지 말라", re: /알리지\s*마|비밀|발설|아무에게도/ },
  { id: "remote_app", label: "원격·앱 설치 유도", re: /원격|앱\s*설치|팀뷰어|애니데스크|apk|어플\s*설치/i },
  { id: "credentials", label: "비밀번호·카드·신분증 요구", re: /비밀번호|카드\s*(사진|번호)|신분증|OTP|보안카드/i },
  { id: "new_phone", label: "'폰 고장·임시폰' 가족 사칭", re: /임시\s*폰|액정|폰\s*(고장|깨)|번호\s*바뀌/ },
  { id: "urgency", label: "오늘 중·즉시 등 재촉", re: /오늘\s*중|즉시|당장|급하|지금\s*바로/ },
  { id: "loan_fee", label: "대출 수수료·선입금 요구", re: /대출.*(수수료|선입금|보증금)|저금리.*(전환|대환)/ },
];

export function scanSignals(text: string) {
  return SIGNALS.filter((s) => s.re.test(text)).map(({ id, label }) => ({ id, label }));
}

// Policy: deterministic, auditable action from evidence + model score.
export function decidePolicy(v: Verdict, signals: { id: string }[]) {
  let risk = v.risk_score;
  let scamType = v.scam_type;
  // Evidence floor: two or more playbook signals cannot be talked down by the model (prompt-injection guard).
  if (signals.length >= 2 && risk < 70) {
    risk = 70;
    if (scamType === "legit") scamType = "other_scam";
  }
  const action = risk >= HOLD_THRESHOLD ? "hold_and_alert" : "mark_safe";
  return { risk, scamType, action } as const;
}

export async function runAgent(channel: Channel, content: string) {
  const trace: AgentStep[] = [];
  const step = async <T,>(name: AgentStep["step"], tool: string, fn: () => T | Promise<T>, summarize: (r: T) => string) => {
    const t = Date.now();
    const r = await fn();
    trace.push({ step: name, tool, summary: summarize(r), ms: Date.now() - t });
    return r;
  };

  await step("perceive", "ingest_untrusted_message", () => content.length, (n) => `${channel} · ${n} chars · treated as untrusted data`);
  const indicators = await step("tools", "extract_indicators", () => extractIndicators(content),
    (i) => `${i.urls.length} links · ${i.phones.length} phone numbers · ${i.accounts.length} account numbers · ${i.amounts.length} amounts`);
  const signals = await step("tools", "scan_scam_playbook", () => scanSignals(content),
    (s) => (s.length ? s.map((x) => x.label).join(", ") : "no playbook signals"));
  const verdict = await step("reason", "llm_classify (Claude)", () => analyzeMessage(channel, content, { indicators, signals }),
    (v) => `${v.scam_type} · model risk ${v.risk_score}`);
  const policy = await step("policy", "decide_action", () => decidePolicy(verdict, signals),
    (p) => (p.action === "hold_and_alert" ? `risk ${p.risk} ≥ ${HOLD_THRESHOLD} → HOLD transfer + alert guardian` : `risk ${p.risk} < ${HOLD_THRESHOLD} → mark safe, no alert`));

  return { verdict: { ...verdict, risk_score: policy.risk, scam_type: policy.scamType }, action: policy.action, indicators, trace };
}
