import { useEffect } from 'react';
import { useRunStore } from '../../store/run-store';

type Tone = 'success' | 'error' | 'info';

const toneClasses: Record<Tone, string> = {
  success: 'border-pass/50 bg-pass/10 text-pass',
  error: 'border-fail/50 bg-fail/10 text-fail',
  info: 'border-surface-500 bg-surface-800 text-zinc-200',
};

export function ToastViewport() {
  const toasts = useRunStore((s) => s.toasts);
  const removeToast = useRunStore((s) => s.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.durationMs ?? 2600)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [removeToast, toasts]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-panel ${toneClasses[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
