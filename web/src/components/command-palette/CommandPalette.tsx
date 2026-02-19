import { Command } from 'cmdk';
import { loadSampleFail, loadSamplePass } from '../../lib/sample-data';
import { useRunStore } from '../../store/run-store';

export function CommandPalette() {
  const open = useRunStore((s) => s.paletteOpen);
  const setOpen = useRunStore((s) => s.setPaletteOpen);
  const setTab = useRunStore((s) => s.setActiveTab);
  const setPrimary = useRunStore((s) => s.setPrimaryRun);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/50 p-4 pt-24" role="dialog" aria-modal="true" aria-label="Command palette" onClick={() => setOpen(false)}>
      <Command className="w-full max-w-xl rounded-xl border border-surface-600 bg-surface-800 p-2" onClick={(e) => e.stopPropagation()}>
        <Command.Input autoFocus placeholder="Type a command" className="w-full rounded-md bg-surface-700 px-3 py-2 outline-none" />
        <Command.List className="mt-2 max-h-72 overflow-auto">
          <Command.Item className="cursor-pointer rounded p-2" onSelect={() => { setTab('overview'); setOpen(false); }}>Go Overview</Command.Item>
          <Command.Item className="cursor-pointer rounded p-2" onSelect={() => { setTab('findings'); setOpen(false); }}>Go Findings</Command.Item>
          <Command.Item className="cursor-pointer rounded p-2" onSelect={() => { setTab('evidence'); setOpen(false); }}>Go Evidence</Command.Item>
          <Command.Item className="cursor-pointer rounded p-2" onSelect={() => { setPrimary(loadSamplePass()); setOpen(false); }}>Load sample PASS</Command.Item>
          <Command.Item className="cursor-pointer rounded p-2" onSelect={() => { setPrimary(loadSampleFail()); setOpen(false); }}>Load sample FAIL</Command.Item>
        </Command.List>
      </Command>
    </div>
  );
}
