export function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-surface-600 bg-surface-700/40 px-3 py-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}
