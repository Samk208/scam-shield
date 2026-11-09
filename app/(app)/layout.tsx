import { Suspense } from "react";

// Signed-in screens are fully dynamic; Suspense lets Next 16 prerender the shell.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="p-4">Loading…</main>}>{children}</Suspense>;
}
