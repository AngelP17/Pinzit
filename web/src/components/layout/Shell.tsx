import type { ReactNode } from 'react';

export function Shell({ mode, children }: { mode: 'audit' | 'explore' | 'focus'; children: ReactNode }) {
  return (
    <div data-mode={mode} className="min-h-screen bg-gradient-to-b from-surface-900 via-surface-900 to-surface-800 px-4 pb-6 pt-4 md:px-8">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
