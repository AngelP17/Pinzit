export function EvidenceSpanList({ spans }: { spans: string[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-zinc-300">Evidence Spans</h4>
      <div className="flex flex-wrap gap-2">
        {spans.length === 0 ? <span className="text-sm text-zinc-500">No spans</span> : spans.map((span) => (
          <span key={span} className="rounded-full border border-surface-600 bg-surface-700 px-2 py-0.5 text-xs">{span}</span>
        ))}
      </div>
    </div>
  );
}
