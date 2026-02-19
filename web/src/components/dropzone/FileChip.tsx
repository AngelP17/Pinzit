export function FileChip({ label, loaded }: { label: string; loaded: boolean }) {
  return (
    <div className="rounded-full border border-surface-600 px-3 py-1 text-xs">
      {loaded ? '✓' : '•'} {label}
    </div>
  );
}
