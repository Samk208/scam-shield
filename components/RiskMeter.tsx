import { HOLD_THRESHOLD } from "@/lib/types";

export function RiskMeter({ score, label = "Risk" }: { score: number; label?: string }) {
  const color = score >= HOLD_THRESHOLD ? "bg-danger" : score >= 21 ? "bg-warn" : "bg-safe";
  return (
    <div className="w-full" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={label}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-mono text-lg font-bold">{score}<span className="text-sm text-muted">/100</span></span>
      </div>
      <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${color} transition-[width] duration-700`} style={{ width: `${score}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-ink/40" style={{ left: `${HOLD_THRESHOLD}%` }} title="Hold threshold" />
      </div>
    </div>
  );
}
