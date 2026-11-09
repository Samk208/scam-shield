import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightCircle,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Loader2,
  Phone,
  ShieldAlert,
  ShieldX,
  XCircle,
} from "lucide-react";
import type { Check, Indicators, Lang } from "@/lib/types";
import { CHANNEL_LABEL, SCAM_TYPE_LABEL } from "@/lib/labels";
import { AgentPipeline } from "./AgentPipeline";
import { RiskMeter } from "./RiskMeter";

export const STATUS_STYLE: Record<
  Check["status"],
  { box: string; icon: typeof ShieldX; iconColor: string; badge: string }
> = {
  analyzing: {
    box: "border-line bg-surface",
    icon: Loader2,
    iconColor: "text-navy animate-spin",
    badge: "bg-bg text-muted",
  },
  safe: {
    box: "border-safe/40 bg-safe-bg",
    icon: CheckCircle2,
    iconColor: "text-safe",
    badge: "bg-safe text-white",
  },
  held: {
    box: "border-danger bg-danger-bg ss-pulse",
    icon: ShieldAlert,
    iconColor: "text-danger",
    badge: "bg-danger text-white",
  },
  blocked: {
    box: "border-danger-ink bg-danger-bg",
    icon: ShieldX,
    iconColor: "text-danger-ink",
    badge: "bg-danger-ink text-white",
  },
  released: {
    box: "border-safe/40 bg-safe-bg",
    icon: CheckCircle2,
    iconColor: "text-safe",
    badge: "bg-safe text-white",
  },
  failed: {
    box: "border-warn/40 bg-warn-bg",
    icon: XCircle,
    iconColor: "text-warn",
    badge: "bg-warn text-white",
  },
};

const TITLE: Record<Check["status"], { ko: string; en: string }> = {
  analyzing: { ko: "AI가 확인 중이에요…", en: "AI agent analysing…" },
  safe: { ko: "안전한 메시지로 보여요", en: "Looks safe — no action needed" },
  held: { ko: "사기 의심! 송금하지 마세요", en: "Likely scam — transfer ON HOLD" },
  blocked: { ko: "가족이 차단했어요. 절대 송금하지 마세요", en: "Transfer BLOCKED by family" },
  released: { ko: "가족이 안전하다고 확인했어요", en: "Confirmed safe by family" },
  failed: { ko: "확인에 실패했어요. 다시 시도해 주세요", en: "Analysis failed — ask Mom to retry" },
};

// Bank-triggered checks: Mom did nothing; the bank paused her transfer automatically.
const TRANSFER_TITLE: Partial<Record<Check["status"], { ko: string; en: string }>> = {
  analyzing: { ko: "은행이 이체를 확인 중이에요…", en: "Bank is screening Mom's transfer…" },
  safe: { ko: "이체가 안전하게 완료됐어요", en: "Transfer looked normal — sent" },
  held: { ko: "이체가 보류됐어요. 자녀 확인을 기다리는 중이에요", en: "Mom's transfer is ON HOLD — confirm or block" },
  blocked: { ko: "자녀가 이체를 차단했어요! 절대 다시 보내지 마세요", en: "You BLOCKED Mom's transfer" },
  released: { ko: "자녀가 확인했어요. 이체가 정상 진행됩니다", en: "You approved the transfer" },
};

function timeLabel(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasIndicators(ind: Check["indicators"]): ind is Indicators {
  if (!ind || !("urls" in ind)) return false;
  return (
    ind.urls.length > 0 ||
    ind.phones.length > 0 ||
    ind.accounts.length > 0 ||
    ind.amounts.length > 0
  );
}

const STATUS_BADGE_TEXT: Record<Check["status"], { ko: string; en: string }> = {
  analyzing: { ko: "분석 중", en: "Analyzing" },
  safe: { ko: "안전", en: "Safe" },
  held: { ko: "보류 중", en: "On Hold" },
  blocked: { ko: "차단됨", en: "Blocked" },
  released: { ko: "해제됨", en: "Released" },
  failed: { ko: "실패", en: "Failed" },
};

export function CheckCard({
  check,
  lang,
  compact,
  detailView,
  children,
}: {
  check: Check;
  lang: Lang;
  compact?: boolean;
  detailView?: boolean;
  children?: React.ReactNode;
}) {
  const s = STATUS_STYLE[check.status];
  const Icon = s.icon;
  const explanation = lang === "ko" ? check.explanation_ko : check.explanation_en;
  const titleText = (
    check.channel === "bank_transfer" && TRANSFER_TITLE[check.status]
      ? TRANSFER_TITLE[check.status]!
      : TITLE[check.status]
  )[lang];

  if (compact) {
    return (
      <Link
        href={`/checks/${check.id}`}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-2xs transition hover:border-navy/40 hover:bg-bg/60"
      >
        <Icon className={`size-6 shrink-0 ${s.iconColor}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.badge}`}>
              {STATUS_BADGE_TEXT[check.status][lang]}
            </span>
            <p className="truncate font-semibold text-ink">
              {check.scam_type ? SCAM_TYPE_LABEL[check.scam_type][lang] : titleText}
            </p>
            {check.risk_score !== null && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold tabular-nums ${
                  check.risk_score >= 60
                    ? "bg-danger-bg text-danger-ink"
                    : "bg-safe-bg text-safe"
                }`}
              >
                {check.risk_score}/100
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">
            {CHANNEL_LABEL[check.channel][lang]} · {check.content}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {timeLabel(check.created_at, lang)}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    );
  }

  return (
    <article
      className={`ss-pop overflow-hidden rounded-3xl border-2 shadow-sm ${s.box}`}
      aria-live="polite"
    >
      {/* Unmistakable top banner when BLOCKED by guardian */}
      {check.status === "blocked" && (
        <div className="flex items-center gap-2.5 bg-danger-ink px-5 py-3 text-white">
          <ShieldX className="size-6 shrink-0" aria-hidden />
          <p className="text-base font-bold">
            {lang === "ko"
              ? "가족이 송금을 차단했습니다 — 절대 돈을 보내지 마세요!"
              : "Blocked by guardian — bank transfer cancelled & funds protected"}
          </p>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 size-9 shrink-0 ${s.iconColor}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
                {CHANNEL_LABEL[check.channel][lang]} · {timeLabel(check.created_at, lang)}
              </span>
              {check.scam_type && check.scam_type !== "legit" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger px-3 py-0.5 text-xs font-bold text-white">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  {SCAM_TYPE_LABEL[check.scam_type][lang]}
                </span>
              )}
            </div>
            <h2
              className={`mt-1.5 font-bold leading-snug text-ink ${
                lang === "ko" ? "text-2xl" : "text-xl"
              }`}
            >
              {titleText}
            </h2>
          </div>
        </div>

        {/* Structured Transfer Summary when triggered by bank_transfer */}
        {check.transfer && (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy">
                <Landmark className="size-4" aria-hidden />
                {lang === "ko" ? "보류된 은행 이체 내역" : "Intercepted Bank Transfer"}
              </span>
              {check.transfer.new_payee && (
                <span className="rounded-full bg-warn-bg px-2.5 py-0.5 text-xs font-semibold text-warn ring-1 ring-warn/30">
                  {lang === "ko" ? "처음 보내는 계좌" : "New payee"}
                </span>
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-ink">{check.transfer.payee_name}</p>
                <p className="font-mono text-xs text-muted tabular-nums">
                  {check.transfer.payee_account}
                  {check.transfer.memo ? ` · ${check.transfer.memo}` : ""}
                </p>
              </div>
              <p className="font-mono text-xl font-bold tabular-nums text-danger-ink">
                ₩{check.transfer.amount.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        )}

        <AgentPipeline check={check} lang={lang} />

        {check.risk_score !== null && (
          <div className="mt-3">
            <RiskMeter
              score={check.risk_score}
              label={lang === "ko" ? "AI 위험도 점수" : "Risk score"}
              lang={lang}
            />
          </div>
        )}

        {explanation && (
          <p
            className={`mt-4 rounded-2xl bg-surface/90 p-3.5 leading-relaxed text-ink ${
              lang === "ko" ? "text-lg font-medium" : "text-base"
            }`}
          >
            {explanation}
          </p>
        )}

        {check.red_flags.length > 0 && (
          <div className="mt-3 rounded-2xl border border-danger/20 bg-surface/90 p-3.5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-danger-ink">
              {lang === "ko"
                ? "탐지된 보이스피싱 위험 신호"
                : "Detected Red Flags (from Korean message/transfer)"}
            </p>
            <ul className="flex flex-col gap-1.5">
              {check.red_flags.map((f) => (
                <li key={f} className="flex gap-2 text-base leading-relaxed text-ink">
                  <AlertTriangle
                    className="mt-1 size-4 shrink-0 text-danger"
                    aria-hidden
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracted forensic indicators */}
        {hasIndicators(check.indicators) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {check.indicators.phones.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted tabular-nums"
              >
                📞 {p}
              </span>
            ))}
            {check.indicators.accounts.map((a) => (
              <span
                key={a}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted tabular-nums"
              >
                🏦 {a}
              </span>
            ))}
            {check.indicators.amounts.map((m) => (
              <span
                key={m}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted tabular-nums"
              >
                💰 {m}
              </span>
            ))}
          </div>
        )}

        {lang === "ko" &&
          check.safe_action_ko &&
          ["held", "blocked"].includes(check.status) && (
            <div className="mt-4 rounded-2xl border-2 border-navy/20 bg-surface p-4">
              <p className="flex gap-2.5 text-lg font-bold leading-relaxed text-ink">
                <ArrowRightCircle
                  className="mt-1 size-5 shrink-0 text-navy"
                  aria-hidden
                />
                <span>{check.safe_action_ko}</span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="tel:112"
                  className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-navy px-3 text-sm font-bold text-white hover:bg-navy-2"
                >
                  <Phone className="size-4" aria-hidden /> 경찰청 112 확인
                </a>
                <a
                  href="tel:1332"
                  className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-line bg-bg px-3 text-sm font-bold text-ink hover:border-navy"
                >
                  <Phone className="size-4" aria-hidden /> 금감원 1332 상담
                </a>
              </div>
            </div>
          )}

        <details className="mt-4 rounded-2xl border border-line/80 bg-surface/80 px-3.5 py-2.5 text-sm text-muted">
          <summary className="cursor-pointer select-none font-medium text-ink/80">
            {lang === "ko" ? "원문 메시지·이체 기록 보기" : "View original message / raw transfer"} ·{" "}
            {CHANNEL_LABEL[check.channel][lang]}
          </summary>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-bg p-3 font-mono text-sm text-ink">
            {check.content}
          </p>
        </details>

        {children}

        {!detailView && (
          <div className="mt-4 border-t border-line/60 pt-3">
            <Link
              href={`/checks/${check.id}`}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-navy-2 underline-offset-4 hover:underline"
            >
              {lang === "ko"
                ? "AI 판단 과정 · 은행 제출용 경고 기록 보기"
                : "How the agent decided · Bank warning record"}{" "}
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
