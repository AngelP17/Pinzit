export function CompatBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? 'bg-pass/20 text-pass' : 'bg-skip/20 text-skip'}`}>
      {ok ? 'Compatible' : 'Waiting Files'}
    </span>
  );
}
