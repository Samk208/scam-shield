import type { AuditEventType, Channel, CheckStatus, ScamType } from "./types";

export const SCAM_TYPE_LABEL: Record<ScamType, { ko: string; en: string }> = {
  impersonation_authority: { ko: "기관사칭형", en: "Authority impersonation" },
  impersonation_family: { ko: "가족·지인사칭 메신저피싱", en: "Family/friend impersonation" },
  loan_fraud: { ko: "대출빙자형", en: "Loan fraud" },
  other_scam: { ko: "기타 사기 의심", en: "Other suspected scam" },
  legit: { ko: "정상", en: "Looks legitimate" },
};

export const STATUS_LABEL: Record<CheckStatus, { ko: string; en: string }> = {
  analyzing: { ko: "확인 중…", en: "Analyzing…" },
  safe: { ko: "안전", en: "Safe" },
  held: { ko: "송금 보류 — 가족 확인 대기", en: "HELD — waiting for family" },
  blocked: { ko: "가족이 차단했습니다. 절대 송금하지 마세요.", en: "Blocked by family" },
  released: { ko: "가족이 안전하다고 확인했습니다", en: "Confirmed safe by family" },
  failed: { ko: "확인 실패 — 다시 시도하세요", en: "Check failed — retry" },
};

export const CHANNEL_LABEL: Record<Channel, { ko: string; en: string }> = {
  sms: { ko: "문자", en: "SMS" },
  kakao: { ko: "카카오톡", en: "KakaoTalk" },
  call_transcript: { ko: "통화 내용", en: "Call transcript" },
  bank_transfer: { ko: "은행 이체", en: "Bank transfer" },
};

export const EVENT_LABEL: Record<AuditEventType, { ko: string; en: string }> = {
  submitted: {
    ko: "보호 대상자 메시지 접수",
    en: "Message forwarded by parent",
  },
  ai_verdict: {
    ko: "AI 에이전트 위험도 판정 완료",
    en: "AI agent verdict recorded",
  },
  held: {
    ko: "이체 자동 보류 조치 (시뮬레이션)",
    en: "Transfer put on HOLD (simulated bank hold)",
  },
  guardian_alerted: {
    ko: "보호자(자녀)에게 실시간 알림 전송",
    en: "Guardian alerted in real time",
  },
  marked_safe: {
    ko: "정상 판정 — 별도 보류 없음",
    en: "Marked safe — no alert sent",
  },
  blocked: {
    ko: "보호자(자녀)가 이체를 최종 차단함",
    en: "Guardian BLOCKED the transfer",
  },
  released: {
    ko: "보호자(자녀)가 안전 확인 후 보류 해제함",
    en: "Guardian confirmed safe & released hold",
  },
  failed: {
    ko: "AI 분석 오류 발생",
    en: "AI analysis failed",
  },
};

export const DEMO_LABEL = "Demo: synthetic messages · simulated bank hold · no real accounts";
