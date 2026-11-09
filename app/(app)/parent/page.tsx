"use client";
import { useState } from "react";
import { CheckCard } from "@/components/CheckCard";
import { submitCheck, useFamilyChecks, useMe } from "@/lib/hooks";
import { CHANNEL_LABEL, DEMO_LABEL } from "@/lib/labels";
import type { Channel } from "@/lib/types";

// Skeleton: Mom's screen. Big text, Korean. Frontend owner restyles.
export default function ParentPage() {
  const { me } = useMe();
  const { checks } = useFamilyChecks(me?.family_id);
  const [channel, setChannel] = useState<Channel>("sms");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCheck() {
    setBusy(true);
    setError(null);
    const r = await submitCheck(channel, content);
    setBusy(false);
    if (r.error) setError("확인에 실패했습니다. 다시 시도해 주세요.");
    else setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 text-lg">
      <h1 className="text-2xl font-bold">🛡️ 의심 메시지 확인</h1>
      <p>{me?.display_name}님, 이상한 문자·카톡·전화 내용을 붙여넣으세요.</p>
      <div className="flex gap-2">
        {(Object.keys(CHANNEL_LABEL) as Channel[]).map((c) => (
          <button key={c} onClick={() => setChannel(c)}
            className={`flex-1 rounded-lg border-2 p-2 ${channel === c ? "border-black bg-black text-white" : ""}`}>
            {CHANNEL_LABEL[c].ko}
          </button>
        ))}
      </div>
      <textarea className="min-h-40 rounded-lg border-2 p-3" maxLength={4000} value={content}
        onChange={(e) => setContent(e.target.value)} placeholder="여기에 붙여넣기" />
      <button onClick={onCheck} disabled={busy || !content.trim()}
        className="rounded-xl bg-red-600 p-4 text-2xl font-bold text-white disabled:opacity-50">
        {busy ? "AI가 확인 중…" : "확인하기"}
      </button>
      {error && <p className="text-red-600">{error}</p>}
      <section className="flex flex-col gap-3">
        {checks.map((c) => <CheckCard key={c.id} check={c} lang="ko" />)}
      </section>
      <p className="text-xs text-zinc-500">{DEMO_LABEL}</p>
    </main>
  );
}
