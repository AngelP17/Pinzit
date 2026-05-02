import { useEffect } from 'react';
import { useRunStore } from '../../store/run-store';

type Tone = 'success' | 'error' | 'info';

const toneClasses: Record<Tone, string> = {
  success: 'border-pass/40 bg-paper-1 text-pass',
  error:   'border-fail/40 bg-paper-1 text-fail',
  info:    'border-white/15 bg-paper-1 text-ink-1',
};

export function ToastViewport() {
  const toasts = useRunStore((s) => s.toasts);
  const removeToast = useRunStore((s) => s.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.durationMs ?? 2400),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [removeToast, toasts]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto rounded-full border px-4 py-2 font-mono text-[12px] tracking-tight shadow-panel ${toneClasses[toast.tone]}`}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle bg-current" />
          {toast.message}
        </div>
      ))}
    </div>
  );
}
