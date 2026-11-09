import { HOLD_THRESHOLD, type Lang } from "@/lib/types";

export function RiskMeter({
  score,
  label = "Risk",
  lang = "en",
}: {
  score: number;
  label?: string;
  lang?: Lang;
}) {
  const isHigh = score >= HOLD_THRESHOLD;
  const isCaution = score >= 21 && score < HOLD_THRESHOLD;
  const barColor = isHigh ? "bg-danger" : isCaution ? "bg-warn" : "bg-safe";
  const badgeStyle = isHigh
    ? "bg-danger/12 text-danger-ink border-danger/30"
    : isCaution
      ? "bg-warn/12 text-warn border-warn/30"
      : "bg-safe/12 text-safe border-safe/30";
  const tierText = isHigh
    ? lang === "ko"
      ? "위험 · 즉시 보류"
      : "High risk · Hold"
    : isCaution
      ? lang === "ko"
        ? "주의 요망"
        : "Caution"
      : lang === "ko"
        ? "정상 범위"
        : "Low risk";

  return (
    <div
      className="w-full rounded-2xl border border-line/80 bg-surface/90 p-3.5"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
      aria-label={label}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
            {tierText}
          </span>
        </div>
        <span className="font-mono text-xl font-bold tabular-nums text-ink">
          {score}
          <span className="text-sm font-normal text-muted">/100</span>
        </span>
      </div>
      <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-700 ease-out`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-ink/60"
          style={{ left: `${HOLD_THRESHOLD}%` }}
          title={lang === "ko" ? `자동 보류 기준 (${HOLD_THRESHOLD}점)` : `Auto-hold threshold (${HOLD_THRESHOLD})`}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted tabular-nums">
        <span>0 ({lang === "ko" ? "안전" : "Safe"})</span>
        <span className="font-medium text-ink/75">
          ▲ {HOLD_THRESHOLD} {lang === "ko" ? "자동 보류 기준" : "Auto-hold"}
        </span>
        <span>100 ({lang === "ko" ? "사기 확실" : "Critical"})</span>
      </div>
    </div>
  );
}
