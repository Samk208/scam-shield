// Fictional demo data for building UI and running in offline local demo mode when .env.local is absent.
import type { AuditEvent, Check, Member } from "./types";

export const FAMILY_ID = "00000000-0000-0000-0000-000000000001";

export const fixtureMembers: Member[] = [
  { family_id: FAMILY_ID, user_id: "u-mom", role: "parent", display_name: "엄마 (김영자)", lang: "ko" },
  { family_id: FAMILY_ID, user_id: "u-joon", role: "guardian", display_name: "Joon (Singapore)", lang: "en" },
];

const now = new Date("2026-11-09T13:00:00+09:00").toISOString();
const earlier = new Date("2026-11-09T11:30:00+09:00").toISOString();

export const fixtureChecks: Check[] = [
  {
    id: "c-held",
    family_id: FAMILY_ID,
    submitted_by: "u-mom",
    channel: "bank_transfer",
    content: "[은행 이체 시도] 30,000,000원 → 금융보안 안전계좌 (352-1234-5678-90) · 처음 보내는 계좌 · 메모: 수사관 지시 자산보호",
    status: "held",
    risk_score: 98,
    scam_type: "impersonation_authority",
    red_flags: [
      "'안전계좌'로 3,000만 원을 보내려고 합니다. 진짜 기관은 안전계좌를 만들지 않습니다.",
      "이체 메모에 '수사관 지시'라고 적혀 있습니다. 검찰·경찰은 돈을 옮기라고 시키지 않습니다.",
      "처음 보내는 계좌인데 이체 금액이 매우 큽니다.",
      "검찰·금감원을 사칭하는 전형적인 기관사칭형 보이스피싱 수법입니다.",
    ],
    explanation_ko:
      "수사관이 시켜서 '안전계좌'로 큰돈을 보내는 것은 전형적인 기관사칭형 보이스피싱입니다. 이체하면 돈을 되찾기 어려우니 지금 바로 멈추고 자녀의 확인을 기다리세요.",
    explanation_en:
      "This transfer of ₩30,000,000 to a 'safe account' under an 'investigator's instruction' matches the classic prosecutor-impersonation scam pattern. The bank has paused the transfer until you confirm or block.",
    safe_action_ko:
      "이체를 지금 바로 멈추고, 통화 중인 사람과 연락을 끊은 뒤 자녀나 경찰청(112), 금융감독원(1332)에 직접 전화해 확인하세요.",
    decided_by: null,
    decided_at: null,
    error: null,
    agent_trace: [
      {
        step: "perceive",
        tool: "ingest_untrusted_message",
        summary: "bank_transfer · 83 chars · treated as untrusted data",
        ms: 1,
      },
      {
        step: "tools",
        tool: "extract_indicators",
        summary: "0 links · 0 phone numbers · 1 account numbers · 1 amounts",
        ms: 1,
      },
      {
        step: "tools",
        tool: "scan_scam_playbook",
        summary: "'안전계좌' 이체 요구, 검찰·경찰·금감원 사칭",
        ms: 1,
      },
      {
        step: "tools",
        tool: "assess_transfer",
        summary: "new_payee, large_amount, safe_account_payee",
        ms: 1,
      },
      {
        step: "reason",
        tool: "llm_classify (Claude)",
        summary: "impersonation_authority · model risk 98",
        ms: 4820,
      },
      {
        step: "policy",
        tool: "decide_action",
        summary: "risk 98 ≥ 60 → HOLD transfer + alert guardian",
        ms: 1,
      },
    ],
    transfer: {
      amount: 30_000_000,
      payee_name: "금융보안 안전계좌",
      payee_account: "352-1234-5678-90",
      new_payee: true,
      memo: "수사관 지시 자산보호",
    },
    indicators: {
      urls: [],
      phones: [],
      accounts: ["352-1234-5678"],
      amounts: ["30,000,000원"],
    },
    created_at: now,
    updated_at: now,
  },
  {
    id: "c-safe",
    family_id: FAMILY_ID,
    submitted_by: "u-mom",
    channel: "kakao",
    content: "엄마 저녁 먹었어? 이번 주말에 갈게",
    status: "safe",
    risk_score: 4,
    scam_type: "legit",
    red_flags: [],
    explanation_ko: "금전이나 개인정보 요구가 없는 일상적인 가족 안부 메시지입니다.",
    explanation_en: "Ordinary family check-in message with no request for money or sensitive credentials.",
    safe_action_ko: null,
    decided_by: null,
    decided_at: null,
    error: null,
    agent_trace: [
      {
        step: "perceive",
        tool: "ingest_untrusted_message",
        summary: "kakao · 18 chars · treated as untrusted data",
        ms: 1,
      },
      {
        step: "tools",
        tool: "extract_indicators",
        summary: "0 links · 0 phone numbers · 0 account numbers · 0 amounts",
        ms: 1,
      },
      {
        step: "tools",
        tool: "scan_scam_playbook",
        summary: "no playbook signals",
        ms: 1,
      },
      {
        step: "reason",
        tool: "llm_classify (Claude)",
        summary: "legit · model risk 4",
        ms: 2150,
      },
      {
        step: "policy",
        tool: "decide_action",
        summary: "risk 4 < 60 → mark safe, no alert",
        ms: 1,
      },
    ],
    transfer: null,
    indicators: { urls: [], phones: [], accounts: [], amounts: [] },
    created_at: earlier,
    updated_at: earlier,
  },
];

export const fixtureEvents: AuditEvent[] = [
  { id: "e1", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "system", event_type: "submitted", created_at: now },
  { id: "e2", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "ai", event_type: "ai_verdict", created_at: now },
  { id: "e3", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "system", event_type: "held", created_at: now },
  { id: "e4", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "system", event_type: "guardian_alerted", created_at: now },
  { id: "e5", family_id: FAMILY_ID, check_id: "c-safe", actor_id: "u-mom", actor_type: "user", event_type: "submitted", created_at: earlier },
  { id: "e6", family_id: FAMILY_ID, check_id: "c-safe", actor_id: null, actor_type: "ai", event_type: "ai_verdict", created_at: earlier },
  { id: "e7", family_id: FAMILY_ID, check_id: "c-safe", actor_id: null, actor_type: "system", event_type: "marked_safe", created_at: earlier },
];
