import type { Channel, CheckStatus, ScamType } from "./types";

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

export const DEMO_LABEL = "Demo: synthetic messages · simulated bank hold · no real accounts";
