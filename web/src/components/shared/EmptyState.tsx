export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <svg
        viewBox="0 0 220 120"
        className="mb-4 h-24 w-44"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="18" width="200" height="84" rx="10" fill="#141416" stroke="#26262b" strokeWidth="2" />
        <rect x="28" y="38" width="164" height="8" rx="4" fill="#26262b" />
        <rect x="28" y="54" width="122" height="8" rx="4" fill="#1f2937" />
        <circle cx="44" cy="84" r="6" fill="#22c55e" />
        <circle cx="64" cy="84" r="6" fill="#f59e0b" />
        <circle cx="84" cy="84" r="6" fill="#ef4444" />
      </svg>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      <p className="mt-2 text-xs text-zinc-500">Drop your verdict + stats or click samples below. Cmd/Ctrl + K for actions.</p>
    </div>
  );
}
