import { X, Check } from '@phosphor-icons/react';

export function FileChip({
  label,
  loaded,
  fileMeta,
  onRemove,
}: {
  label: string;
  loaded: boolean;
  fileMeta?: { size: number; modifiedAt: string } | null;
  onRemove?: () => void;
}) {
  const title = fileMeta
    ? `${Math.round(fileMeta.size / 1024)} KB — ${fileMeta.modifiedAt}`
    : 'No file loaded';
  return (
    <div
      title={title}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
        loaded ? 'border-pass/50 text-pass' : 'border-surface-600 text-zinc-300'
      }`}
    >
      {loaded ? <Check size={10} weight="bold" className="text-pass" /> : <span className="text-zinc-500">-</span>} {label}
      {loaded && onRemove ? (
        <button
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-surface-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X size={12} weight="bold" />
        </button>
      ) : null}
    </div>
  );
}
