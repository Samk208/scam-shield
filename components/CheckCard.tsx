import Link from "next/link";
import { AlertTriangle, ArrowRightCircle, CheckCircle2, ChevronRight, Loader2, ShieldAlert, ShieldX, XCircle } from "lucide-react";
import type { Check, Lang } from "@/lib/types";
import { CHANNEL_LABEL, SCAM_TYPE_LABEL } from "@/lib/labels";
import { AgentPipeline } from "./AgentPipeline";
import { RiskMeter } from "./RiskMeter";

export const STATUS_STYLE: Record<Check["status"], { box: string; icon: typeof ShieldX; iconColor: string }> = {
  analyzing: { box: "border-line bg-surface", icon: Loader2, iconColor: "text-muted animate-spin" },
  safe: { box: "border-safe/30 bg-safe-bg", icon: CheckCircle2, iconColor: "text-safe" },
  held: { box: "border-danger bg-danger-bg ss-pulse", icon: ShieldAlert, iconColor: "text-danger" },
  blocked: { box: "border-danger-ink bg-danger-bg", icon: ShieldX, iconColor: "text-danger-ink" },
  released: { box: "border-safe/30 bg-safe-bg", icon: CheckCircle2, iconColor: "text-safe" },
  failed: { box: "border-warn/40 bg-warn-bg", icon: XCircle, iconColor: "text-warn" },
};

const TITLE: Record<Check["status"], { ko: string; en: string }> = {
  analyzing: { ko: "AI가 확인 중이에요…", en: "AI agent analysing…" },
  safe: { ko: "안전한 메시지로 보여요", en: "Looks safe — no action needed" },
  held: { ko: "사기 의심! 송금하지 마세요", en: "Likely scam — transfer ON HOLD" },
  blocked: { ko: "가족이 차단했어요. 절대 송금하지 마세요", en: "You blocked this transfer" },
  released: { ko: "가족이 안전하다고 확인했어요", en: "You confirmed it is safe" },
  failed: { ko: "확인에 실패했어요. 다시 시도해 주세요", en: "Analysis failed — ask Mom to retry" },
};

// Bank-triggered checks: Mom did nothing; the bank paused her transfer automatically.
const TRANSFER_TITLE: Partial<Record<Check["status"], { ko: string; en: string }>> = {
  analyzing: { ko: "은행이 이체를 확인 중이에요…", en: "Bank is screening Mom's transfer…" },
  safe: { ko: "이체가 완료됐어요", en: "Transfer looked normal — sent" },
  held: { ko: "이체가 보류됐어요. 자녀 확인을 기다리는 중이에요", en: "Mom's transfer is ON HOLD — confirm or block" },
  blocked: { ko: "자녀가 이체를 막았어요. 사기일 가능성이 높아요", en: "You blocked Mom's transfer" },
  released: { ko: "자녀가 확인했어요. 이체가 진행됩니다", en: "You approved the transfer" },
};

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function CheckCard({ check, lang, compact, children }: { check: Check; lang: Lang; compact?: boolean; children?: React.ReactNode }) {
  const s = STATUS_STYLE[check.status];
  const Icon = s.icon;
  const explanation = lang === "ko" ? check.explanation_ko : check.explanation_en;

  if (compact) {
    return (
      <Link href={`/checks/${check.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 hover:bg-bg">
        <Icon className={`size-6 shrink-0 ${s.iconColor}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{check.scam_type ? SCAM_TYPE_LABEL[check.scam_type][lang] : TITLE[check.status][lang]}</p>
          <p className="truncate text-sm text-muted">{CHANNEL_LABEL[check.channel][lang]} · {check.content}</p>
        </div>
        <span className="text-xs text-muted">{timeLabel(check.created_at)}</span>
        <ChevronRight className="size-4 text-muted" />
      </Link>
    );
  }

  return (
    <article className={`ss-pop rounded-3xl border-2 p-5 shadow-sm ${s.box}`} aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon className={`size-9 shrink-0 ${s.iconColor}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className={`font-bold leading-snug ${lang === "ko" ? "text-2xl" : "text-xl"}`}>{(check.channel === "bank_transfer" && TRANSFER_TITLE[check.status] ? TRANSFER_TITLE[check.status]! : TITLE[check.status])[lang]}</h2>
          {check.scam_type && check.scam_type !== "legit" && (
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-danger px-3 py-0.5 text-sm font-semibold text-white">
              <AlertTriangle className="size-3.5" /> {SCAM_TYPE_LABEL[check.scam_type][lang]}
            </p>
          )}
        </div>
      </div>

      <AgentPipeline check={check} lang={lang} />

      {check.risk_score !== null && <div className="mt-4"><RiskMeter score={check.risk_score} label={lang === "ko" ? "위험도" : "Risk score"} /></div>}

      {explanation && <p className={`mt-4 ${lang === "ko" ? "text-lg" : ""}`}>{explanation}</p>}

      {check.red_flags.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {check.red_flags.map((f) => (
            <li key={f} className="flex gap-2 text-base leading-relaxed"><AlertTriangle className="mt-1 size-4 shrink-0 text-danger" aria-hidden /><span>{f}</span></li>
          ))}
        </ul>
      )}

      {lang === "ko" && check.safe_action_ko && ["held", "blocked"].includes(check.status) && (
        <p className="mt-4 flex gap-2 rounded-2xl border border-line bg-surface p-3 text-lg font-semibold leading-relaxed"><ArrowRightCircle className="mt-1 size-5 shrink-0 text-navy" aria-hidden />{check.safe_action_ko}</p>
      )}

      <details className="mt-4 text-sm text-muted">
        <summary className="cursor-pointer select-none">{lang === "ko" ? "받은 메시지 보기" : "Original message"} · {CHANNEL_LABEL[check.channel][lang]} · {timeLabel(check.created_at)}</summary>
        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface p-3 text-ink">{check.content}</p>
      </details>

      {children}

      <Link href={`/checks/${check.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-2 underline-offset-4 hover:underline">
        {lang === "ko" ? "AI 판단 과정 · 기록 보기" : "How the agent decided · warning record"} <ChevronRight className="size-4" />
      </Link>
    </article>
  );
}
