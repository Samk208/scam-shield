import { Brain, Check as CheckIcon, Clock, Eye, Scale, UserCheck, Wrench } from "lucide-react";
import type { Check } from "@/lib/types";

// Compact, always-visible agent loop: Perceive -> Tools -> Reason -> Policy -> Human.
export function AgentPipeline({ check, lang }: { check: Check; lang: "ko" | "en" }) {
  const isAnalyzing = check.status === "analyzing";
  if (!check.agent_trace?.length && !isAnalyzing) return null;

  const totalMs = check.agent_trace?.reduce((sum, s) => sum + (s.ms ?? 0), 0) ?? 0;
  const humanDone = check.status === "blocked" || check.status === "released" || check.status === "safe";
  const humanWaiting = check.status === "held";

  const steps = [
    { Icon: Eye, ko: "인지", en: "Perceive", done: !isAnalyzing, active: isAnalyzing },
    { Icon: Wrench, ko: "도구", en: "Tools", done: !isAnalyzing, active: false },
    { Icon: Brain, ko: "AI 추론", en: "Reason", done: !isAnalyzing, active: isAnalyzing },
    { Icon: Scale, ko: "정책", en: "Policy", done: !isAnalyzing, active: false },
    { Icon: UserCheck, ko: "가족 확인", en: "Human", done: humanDone, waiting: humanWaiting, active: false },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-line/80 bg-surface/85 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span className="font-semibold text-ink/80">
          {lang === "ko" ? "AI 에이전트 보안 단계" : "AI Agent Security Pipeline"}
        </span>
        {totalMs > 0 && (
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Clock className="size-3" aria-hidden />
            {(totalMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      <ol
        className="flex items-center justify-between gap-1"
        aria-label={lang === "ko" ? "AI 에이전트 단계" : "AI agent steps"}
      >
        {steps.map(({ Icon, ko, en, done, waiting, active }, i) => (
          <li key={en} className="flex flex-1 items-center gap-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`relative grid size-9 place-items-center rounded-full transition-colors ${
                  waiting
                    ? "bg-danger text-white ss-pulse"
                    : active
                      ? "bg-navy-2 text-white animate-pulse"
                      : done
                        ? "bg-navy text-white"
                        : "bg-line text-muted"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {done && !waiting && (
                  <CheckIcon
                    className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-safe p-0.5 text-white ring-2 ring-surface"
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={`text-xs font-medium ${
                  waiting ? "font-bold text-danger-ink" : "text-muted"
                }`}
              >
                {lang === "ko" ? ko : en}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`mb-5 h-0.5 flex-1 rounded ${done ? "bg-navy/40" : "bg-line"}`}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
