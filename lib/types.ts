// Shared contract between frontend and backend. Change only with both owners agreeing.

export type Role = "parent" | "guardian";
export type Lang = "ko" | "en";
export type Channel = "sms" | "kakao" | "call_transcript";
export type CheckStatus = "analyzing" | "safe" | "held" | "blocked" | "released" | "failed";
export type ScamType =
  | "impersonation_authority"
  | "impersonation_family"
  | "loan_fraud"
  | "other_scam"
  | "legit";
export type Decision = "block" | "release";

export interface Member {
  family_id: string;
  user_id: string;
  role: Role;
  display_name: string;
  lang: Lang;
}

export interface Indicators { urls: string[]; phones: string[]; accounts: string[]; amounts: string[] }

// One step of the Scam Shield agent (perceive -> tools -> reason -> policy).
export interface AgentStep {
  step: "perceive" | "tools" | "reason" | "policy";
  tool: string;
  summary: string;
  ms: number;
}

export interface Check {
  id: string;
  family_id: string;
  submitted_by: string;
  channel: Channel;
  content: string;
  status: CheckStatus;
  risk_score: number | null;
  scam_type: ScamType | null;
  red_flags: string[];
  explanation_ko: string | null;
  explanation_en: string | null;
  safe_action_ko: string | null;
  decided_by: string | null;
  decided_at: string | null;
  error: string | null;
  agent_trace: AgentStep[];
  indicators: Indicators | Record<string, never>;
  created_at: string;
  updated_at: string;
}

export type AuditEventType =
  | "submitted"
  | "ai_verdict"
  | "held"
  | "guardian_alerted"
  | "marked_safe"
  | "blocked"
  | "released"
  | "failed";

export interface AuditEvent {
  id: string;
  family_id: string;
  check_id: string;
  actor_id: string | null;
  actor_type: "user" | "ai" | "system";
  event_type: AuditEventType;
  created_at: string;
}

// API shapes
export interface CreateCheckBody { channel: Channel; content: string }
export interface CheckResponse { check: Check }
export interface DecisionBody { decision: Decision }
export interface MeResponse { me: Member; family: Member[] }
export interface ApiError { error: string; check?: Check }

export const HOLD_THRESHOLD = 60;
