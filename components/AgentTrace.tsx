import { Brain, Eye, Scale, UserCheck, Wrench } from "lucide-react";
import type { Check, Lang } from "@/lib/types";

const ICON = { perceive: Eye, tools: Wrench, reason: Brain, policy: Scale } as const;
const NAME: Record<
  "perceive" | "tools" | "reason" | "policy",
  { ko: string; en: string }
> = {
  perceive: { ko: "1단계 · 입력 인지", en: "Step 1 · Perceive" },
  tools: { ko: "2단계 · 결정적 도구 검사", en: "Step 2 · Deterministic Tools" },
  reason: { ko: "3단계 · AI 추론", en: "Step 3 · AI Reasoning" },
  policy: { ko: "4단계 · 보호 정책 판단", en: "Step 4 · Policy Gate" },
};

// Visualises the agent loop: Perceive -> Tools -> Reason -> Policy -> Human.
export function AgentTrace({ check, lang = "en" }: { check: Check; lang?: Lang }) {
  if (!check.agent_trace?.length) return null;

  const humanText =
    check.status === "blocked"
      ? lang === "ko"
        ? "보호자(자녀)가 이체를 차단함 — 송금 불가"
        : "Guardian BLOCKED the transfer — funds protected"
      : check.status === "released"
        ? lang === "ko"
          ? "보호자(자녀)가 안전을 확인하여 보류 해제함"
          : "Guardian confirmed it is safe — hold released"
        : check.status === "held"
          ? lang === "ko"
            ? "보호자(자녀)의 최종 확인 대기 중 — AI는 보류만 가능하며 돈을 보낼 수 없습니다"
            : "Waiting for guardian decision — AI can hold, never release"
          : lang === "ko"
            ? "위험 신호 없음 — 추가 조치 불필요"
            : "No human action needed";

  return (
    <ol className="flex flex-col gap-0">
      {check.agent_trace.map((s, i) => {
        const Icon = ICON[s.step];
        return (
          <li key={`${s.step}-${s.tool}-${i}`} className="relative flex gap-3.5 pb-4">
            <span className="absolute left-[17px] top-9 h-full w-0.5 bg-line" aria-hidden />
            <span className="z-0 grid size-9 shrink-0 place-items-center rounded-full bg-navy text-white shadow-xs">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <span className="font-bold text-navy">{NAME[s.step][lang]}</span>
                <span aria-hidden>·</span>
                <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">
                  {s.tool}
                </code>
                <span aria-hidden>·</span>
                <span className="font-mono tabular-nums">{s.ms}ms</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink">{s.summary}</p>
            </div>
          </li>
        );
      })}
      <li className="flex gap-3.5">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full text-white shadow-xs ${
            check.status === "held"
              ? "bg-danger ss-pulse"
              : check.status === "blocked"
                ? "bg-danger-ink"
                : "bg-safe"
          }`}
        >
          <UserCheck className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-xs font-bold text-navy">
            {lang === "ko" ? "5단계 · 가족(사람) 최종 결정" : "Step 5 · Human in the Loop"}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{humanText}</p>
        </div>
      </li>
    </ol>
  );
}
