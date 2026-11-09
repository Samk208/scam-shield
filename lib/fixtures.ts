// Fictional demo data for building UI before the backend is wired. Not used in production paths.
import type { AuditEvent, Check, Member } from "./types";

export const FAMILY_ID = "00000000-0000-0000-0000-000000000001";

export const fixtureMembers: Member[] = [
  { family_id: FAMILY_ID, user_id: "u-mom", role: "parent", display_name: "엄마 (김영자)", lang: "ko" },
  { family_id: FAMILY_ID, user_id: "u-joon", role: "guardian", display_name: "Joon (Singapore)", lang: "en" },
];

const now = new Date("2026-11-09T13:00:00+09:00").toISOString();

export const fixtureChecks: Check[] = [
  {
    id: "c-held",
    family_id: FAMILY_ID,
    submitted_by: "u-mom",
    channel: "sms",
    content:
      "[서울중앙지검] 김영자님 명의 계좌가 범죄에 연루되어 수사 중입니다. 자산 보호를 위해 오늘 중 안전계좌로 이체하시고 이 사실은 가족에게도 알리지 마십시오.",
    status: "held",
    risk_score: 92,
    scam_type: "impersonation_authority",
    red_flags: ["검찰은 문자로 이체를 요구하지 않습니다", "'안전계좌' 이체 요구", "가족에게 알리지 말라는 비밀 유지 요구"],
    explanation_ko: "검찰·금융기관을 사칭해 '안전계좌'로 이체를 유도하는 전형적인 기관사칭형 보이스피싱입니다.",
    explanation_en: "Classic prosecutor impersonation: asks for a transfer to a 'safe account' and tells her to keep it secret.",
    safe_action_ko: "송금하지 마시고, 문자 속 번호로 전화하지 마세요. 가족이나 112에 확인하세요.",
    decided_by: null,
    decided_at: null,
    error: null,
    agent_trace: [],
    transfer: null,
    indicators: {},
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
    explanation_ko: "금전·개인정보 요구가 없는 일상적인 안부 메시지입니다.",
    explanation_en: "Ordinary check-in message with no request for money or personal data.",
    safe_action_ko: null,
    decided_by: null,
    decided_at: null,
    error: null,
    agent_trace: [],
    transfer: null,
    indicators: {},
    created_at: now,
    updated_at: now,
  },
];

export const fixtureEvents: AuditEvent[] = [
  { id: "e1", family_id: FAMILY_ID, check_id: "c-held", actor_id: "u-mom", actor_type: "user", event_type: "submitted", created_at: now },
  { id: "e2", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "ai", event_type: "ai_verdict", created_at: now },
  { id: "e3", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "system", event_type: "held", created_at: now },
  { id: "e4", family_id: FAMILY_ID, check_id: "c-held", actor_id: null, actor_type: "system", event_type: "guardian_alerted", created_at: now },
];
