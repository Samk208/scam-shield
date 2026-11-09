import Link from "next/link";
import type { Check, Lang } from "@/lib/types";
import { CHANNEL_LABEL, SCAM_TYPE_LABEL, STATUS_LABEL } from "@/lib/labels";

const tone: Record<Check["status"], string> = {
  analyzing: "border-zinc-300 bg-zinc-50",
  safe: "border-green-400 bg-green-50",
  held: "border-red-500 bg-red-50",
  blocked: "border-red-700 bg-red-100",
  released: "border-green-500 bg-green-50",
  failed: "border-amber-400 bg-amber-50",
};

// Skeleton card shared by both screens. Frontend owner restyles.
export function CheckCard({ check, lang, children }: { check: Check; lang: Lang; children?: React.ReactNode }) {
  const explanation = lang === "ko" ? check.explanation_ko : check.explanation_en;
  return (
    <div className={`rounded-xl border-2 p-4 ${tone[check.status]}`}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold">{STATUS_LABEL[check.status][lang]}</span>
        {check.risk_score !== null && <span className="font-mono">risk {check.risk_score}</span>}
      </div>
      {check.scam_type && <p className="mt-1 text-lg font-bold">{SCAM_TYPE_LABEL[check.scam_type][lang]}</p>}
      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-zinc-700">
        {CHANNEL_LABEL[check.channel][lang]} · {check.content}
      </p>
      {explanation && <p className="mt-2">{explanation}</p>}
      {check.red_flags.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {check.red_flags.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      {lang === "ko" && check.safe_action_ko && check.status !== "safe" && (
        <p className="mt-2 font-semibold">👉 {check.safe_action_ko}</p>
      )}
      {children}
      <Link className="mt-3 block text-sm underline" href={`/checks/${check.id}`}>
        {lang === "ko" ? "기록 보기" : "Warning record"}
      </Link>
    </div>
  );
}
