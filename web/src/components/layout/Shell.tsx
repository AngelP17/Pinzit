import type { ReactNode } from 'react';

export function Shell({ mode, children }: { mode: 'audit' | 'explore' | 'focus'; children: ReactNode }) {
  return (
    <div
      data-mode={mode}
      className="min-h-screen bg-[radial-gradient(circle_at_15%_-10%,rgba(16,42,67,.75),transparent_38%),linear-gradient(180deg,#070c13_0%,#0a0a0b_40%,#141416_100%)] px-4 pb-6 pt-4 md:px-8"
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
