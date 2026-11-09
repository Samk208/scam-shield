import { Suspense } from "react";

// Signed-in screens are fully dynamic; Suspense lets Next 16 prerender the shell.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="ss-skeleton h-40 rounded-3xl lg:col-span-7" />
            <div className="ss-skeleton h-40 rounded-3xl lg:col-span-5" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="ss-skeleton h-96 rounded-3xl lg:col-span-7" />
            <div className="ss-skeleton h-96 rounded-3xl lg:col-span-5" />
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
