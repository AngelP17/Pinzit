export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="surface flex min-h-64 flex-col items-center justify-center px-8 py-12 text-center">
      <span className="font-mono text-[10px] tracking-[0.22em] text-ink-2">EMPTY STATE</span>
      <h3 className="mt-3 text-xl font-medium tracking-tight text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-ink-1">{subtitle}</p>
      <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-ink-2">
        Cmd / Ctrl + K · open command palette
      </p>
    </div>
  );
}
