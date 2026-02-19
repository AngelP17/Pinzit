import { MetricRow } from '../shared/MetricRow';

export function MetricsTable({ metrics }: { metrics: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-300">Metrics</h4>
      {Object.entries(metrics).map(([k, v]) => (
        <MetricRow key={k} label={k} value={String(v)} />
      ))}
    </div>
  );
}
