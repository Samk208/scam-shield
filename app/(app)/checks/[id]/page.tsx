"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check as CheckIcon,
  Copy,
  Cpu,
  Download,
  FileCheck2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { AgentTrace } from "@/components/AgentTrace";
import { AppHeader, DemoFooter } from "@/components/AppHeader";
import { CheckCard } from "@/components/CheckCard";
import { useCheckAudit, useMe } from "@/lib/hooks";
import { EVENT_LABEL } from "@/lib/labels";
import type { AuditEvent, Lang } from "@/lib/types";

export default function CheckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { me, family } = useMe();
  const { check, events, loading } = useCheckAudit(id);
  const [langOverride, setLangOverride] = useState<Lang | null>(null);
  const [copied, setCopied] = useState(false);

  const lang: Lang = langOverride ?? me?.lang ?? "en";
  const name = (uid: string | null) => family.find((m) => m.user_id === uid)?.display_name;

  function buildRecordPayload() {
    return {
      record_type: "scam_shield_warning_record",
      version: 1,
      exported_at: new Date().toISOString(),
      check,
      events,
    };
  }

  function exportRecord() {
    const record = buildRecordPayload();
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warning-record-${id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyRecordSummary() {
    if (!check) return;
    const summary = [
      `[Scam Shield Warning Record] ID: ${check.id}`,
      `Status: ${check.status.toUpperCase()} | Risk Score: ${check.risk_score ?? "N/A"}/100 | Type: ${check.scam_type ?? "N/A"}`,
      `Channel: ${check.channel} | Created: ${check.created_at}`,
      `Audit Trail: ${events.map((e) => `${e.event_type} (${new Date(e.created_at).toISOString()})`).join(" -> ")}`,
    ].join("\n");
    await navigator.clipboard.writeText(summary).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatEventDescription(e: AuditEvent) {
    if (e.event_type === "submitted" && check?.channel === "bank_transfer") {
      return lang === "ko"
        ? "은행 이체 시도 — Scam Shield 자동 보안 확인 시작"
        : "Bank transfer initiated — intercepted automatically by Scam Shield";
    }
    return EVENT_LABEL[e.event_type]?.[lang] ?? e.event_type;
  }

  function formatActorLabel(e: AuditEvent) {
    if (e.actor_type === "user" && name(e.actor_id)) {
      return ` — ${name(e.actor_id)}`;
    }
    if (e.actor_type === "ai") {
      return lang === "ko" ? " — AI 에이전트" : " — AI agent";
    }
    return lang === "ko" ? " — 시스템" : " — system";
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AppHeader
        me={me}
        lang={lang}
        onLangChange={setLangOverride}
        subtitle={lang === "ko" ? "AI 판단 과정 · 은행 경고 기록" : "Warning record & AI audit"}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={me?.role === "parent" ? "/parent" : "/guardian"}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-bold text-navy shadow-2xs hover:border-navy"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span>{lang === "ko" ? "대시보드로 돌아가기" : "Back to dashboard"}</span>
            </Link>
            {check && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-3.5 py-1.5 font-mono text-xs font-bold text-navy">
                <ShieldCheck className="size-4" aria-hidden />
                RECORD ID: {check.id}
              </span>
            )}
          </div>

          {check && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportRecord}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-navy px-4 text-xs font-bold text-white shadow-2xs hover:bg-navy-2"
              >
                <Download className="size-4" aria-hidden />
                <span>{lang === "ko" ? "JSON 경고 기록 다운로드" : "Export JSON Record"}</span>
              </button>
              <button
                type="button"
                onClick={copyRecordSummary}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink hover:border-navy"
              >
                {copied ? (
                  <CheckIcon className="size-4 text-safe" aria-hidden />
                ) : (
                  <Copy className="size-4" aria-hidden />
                )}
                <span>
                  {copied
                    ? lang === "ko"
                      ? "복사됨!"
                      : "Copied!"
                    : lang === "ko"
                      ? "요약 복사"
                      : "Copy Summary"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink hover:border-navy"
              >
                <Printer className="size-4" aria-hidden />
                <span>{lang === "ko" ? "인쇄 / PDF 저장" : "Print / Save PDF"}</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="ss-skeleton h-96 rounded-3xl lg:col-span-6" />
            <div className="ss-skeleton h-96 rounded-3xl lg:col-span-6" />
          </div>
        ) : !check ? (
          <div className="rounded-3xl border border-line bg-surface p-12 text-center">
            <p className="text-xl font-bold text-ink">
              {lang === "ko" ? "기록을 찾을 수 없습니다." : "Record not found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* LEFT 6 COLUMNS: VERDICT CARD & FORENSIC EVIDENCE */}
            <div className="flex flex-col gap-6 lg:col-span-6">
              <CheckCard check={check} lang={lang} detailView />

              {/* Raw JSON Certificate Preview */}
              <section className="rounded-3xl border border-line bg-[#0b192c] p-5 text-white shadow-sm">
                <div className="mb-3 flex items-center justify-between border-b border-white/15 pb-2.5">
                  <span className="font-mono text-xs font-bold text-[#32d583]">
                    warning-record-{check.id}.json
                  </span>
                  <span className="font-mono text-[11px] text-white/60">
                    NO-FAULT LIABILITY ACT EVIDENCE
                  </span>
                </div>
                <pre className="max-h-72 overflow-auto font-mono text-xs leading-relaxed text-[#93c5fd]">
                  {JSON.stringify(
                    {
                      record_type: "scam_shield_warning_record",
                      version: 1,
                      check_id: check.id,
                      channel: check.channel,
                      status: check.status,
                      risk_score: check.risk_score,
                      scam_type: check.scam_type,
                      transfer: check.transfer,
                      events: events.map((e) => ({
                        event: e.event_type,
                        actor: e.actor_type,
                        timestamp: e.created_at,
                      })),
                    },
                    null,
                    2,
                  )}
                </pre>
              </section>
            </div>

            {/* RIGHT 6 COLUMNS: AGENT TRACE + TIMESTAMPED WARNING RECORD */}
            <div className="flex flex-col gap-6 lg:col-span-6">
              <section className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="mb-1 flex items-center gap-2">
                  <Cpu className="size-5 text-navy" aria-hidden />
                  <h2 className="text-lg font-extrabold text-ink">
                    {lang === "ko"
                      ? "AI 에이전트 판단 과정 (Agent Trace)"
                      : "How the AI Agent Decided (Step-by-Step Trace)"}
                  </h2>
                </div>
                <p className="mb-4 text-sm text-muted">
                  {lang === "ko"
                    ? "결정적 보안 도구와 AI 추론, 정책 게이트, 가족 확인까지 모든 단계가 기록됩니다."
                    : "Every deterministic tool call, model reasoning step, policy gate, and human confirmation is recorded."}
                </p>
                <AgentTrace check={check} lang={lang} />
              </section>

              <section className="rounded-3xl border border-line bg-surface p-6 shadow-xs">
                <div className="mb-1 flex items-center gap-2">
                  <FileCheck2 className="size-5 text-navy" aria-hidden />
                  <h2 className="text-lg font-extrabold text-ink">
                    {lang === "ko"
                      ? "은행 제출용 타임스탬프 경고 기록 (Warning Record)"
                      : "Warning Record (Bank Liability Evidence)"}
                  </h2>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted">
                  {lang === "ko"
                    ? "보이스피싱 무과실 배상책임 법안 기준에 맞춘 고객 사전 경고 및 가족 확인 증빙 로그입니다."
                    : "Timestamped evidence that the customer was warned and the family confirmed — designed for bank liability review."}
                </p>

                <ol className="flex flex-col gap-3 rounded-2xl border border-line bg-bg/60 p-4">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-baseline gap-3 text-sm sm:text-[15px]">
                      <span className="w-24 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted">
                        {new Date(e.created_at).toLocaleTimeString(
                          lang === "ko" ? "ko-KR" : "en-US",
                          { hour: "2-digit", minute: "2-digit", second: "2-digit" },
                        )}
                      </span>
                      <span className="font-medium text-ink">
                        {formatEventDescription(e)}
                        <span className="font-normal text-muted">{formatActorLabel(e)}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={exportRecord}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-navy px-4 text-sm font-bold text-white shadow-xs hover:bg-navy-2"
                  >
                    <Download className="size-4" aria-hidden />
                    <span>
                      {lang === "ko" ? "경고 기록 내려받기 (JSON)" : "Export warning record (JSON)"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={copyRecordSummary}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm font-bold text-ink hover:border-navy"
                  >
                    {copied ? (
                      <CheckIcon className="size-4 text-safe" aria-hidden />
                    ) : (
                      <Copy className="size-4" aria-hidden />
                    )}
                    <span>
                      {copied
                        ? lang === "ko"
                          ? "복사 완료!"
                          : "Copied!"
                        : lang === "ko"
                          ? "요약 복사하기"
                          : "Copy audit summary"}
                    </span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
      <DemoFooter />
    </div>
  );
}
