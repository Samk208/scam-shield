import { Brain, Check as CheckIcon, Eye, Scale, UserCheck, Wrench } from "lucide-react";
import type { Check } from "@/lib/types";

// Compact, always-visible agent loop: Perceive -> Tools -> Reason -> Policy -> Human.
export function AgentPipeline({ check, lang }: { check: Check; lang: "ko" | "en" }) {
  if (!check.agent_trace?.length) return null;
  const humanDone = check.status === "blocked" || check.status === "released" || check.status === "safe";
  const humanWaiting = check.status === "held";
  const steps = [
    { Icon: Eye, ko: "인지", en: "Perceive", done: true },
    { Icon: Wrench, ko: "도구", en: "Tools", done: true },
    { Icon: Brain, ko: "AI 추론", en: "Reason", done: true },
    { Icon: Scale, ko: "정책", en: "Policy", done: true },
    { Icon: UserCheck, ko: "가족", en: "Human", done: humanDone, waiting: humanWaiting },
  ];
  return (
    <ol className="mt-4 flex items-center justify-between gap-1" aria-label={lang === "ko" ? "AI 에이전트 단계" : "AI agent steps"}>
      {steps.map(({ Icon, ko, en, done, waiting }, i) => (
        <li key={en} className="flex flex-1 items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <span className={`relative grid size-9 place-items-center rounded-full ${waiting ? "bg-danger text-white ss-pulse" : done ? "bg-navy text-white" : "bg-line text-muted"}`}>
              <Icon className="size-4" aria-hidden />
              {done && !waiting && <CheckIcon className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-safe p-0.5 text-white" aria-hidden />}
            </span>
            <span className="text-xs font-medium text-muted">{lang === "ko" ? ko : en}</span>
          </div>
          {i < steps.length - 1 && <span className="mb-5 h-0.5 flex-1 rounded bg-navy/30" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
