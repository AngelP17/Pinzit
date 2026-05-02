import type { ReactNode } from 'react';

export function Shell({ mode, children }: { mode: 'audit' | 'explore' | 'focus'; children: ReactNode }) {
  return (
    <div data-mode={mode} className="min-h-[100dvh] bg-paper-0 text-ink-0">
      <div className="mx-auto w-full max-w-[1320px] px-5 pb-12 pt-5 md:px-8">
        {children}
      </div>
    </div>
  );
}
