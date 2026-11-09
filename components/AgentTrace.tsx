import { Brain, Eye, Scale, UserCheck, Wrench } from "lucide-react";
import type { Check } from "@/lib/types";

const ICON = { perceive: Eye, tools: Wrench, reason: Brain, policy: Scale } as const;
const NAME = { perceive: "Perceive", tools: "Tools", reason: "Reason", policy: "Policy" } as const;

// Visualises the agent loop: Perceive -> Tools -> Reason -> Policy -> Human.
export function AgentTrace({ check }: { check: Check }) {
  if (!check.agent_trace?.length) return null;
  const human =
    check.status === "blocked" ? "Guardian BLOCKED the transfer"
    : check.status === "released" ? "Guardian confirmed it is safe"
    : check.status === "held" ? "Waiting for guardian decision — AI can hold, never release"
    : "No human action needed";
  return (
    <ol className="flex flex-col gap-0">
      {check.agent_trace.map((s, i) => {
        const Icon = ICON[s.step];
        return (
          <li key={i} className="relative flex gap-3 pb-3">
            <span className="absolute left-[15px] top-8 h-full w-px bg-line" aria-hidden />
            <span className="z-0 grid size-8 shrink-0 place-items-center rounded-full bg-navy text-white"><Icon className="size-4" /></span>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {NAME[s.step]} · <span className="font-mono normal-case">{s.tool}</span> · {s.ms}ms
              </p>
              <p className="text-sm">{s.summary}</p>
            </div>
          </li>
        );
      })}
      <li className="flex gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-white ${check.status === "held" ? "bg-danger ss-pulse" : "bg-safe"}`}>
          <UserCheck className="size-4" />
        </span>
        <div className="pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Human in the loop</p>
          <p className="text-sm">{human}</p>
        </div>
      </li>
    </ol>
  );
}
