export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}
