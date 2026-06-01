import {
  ArrowLeft,
  ArrowsLeftRight,
  Compass,
  DownloadSimple,
  Keyboard,
  ShieldCheck,
  Target,
} from '@phosphor-icons/react';
import { useRunStore } from '../../store/run-store';
import { exportCSV, exportJSON } from '../../lib/export';

export function Header({ onBack }: { onBack?: () => void }) {
  const run = useRunStore((s) => s.primaryRun);
  const setPaletteOpen = useRunStore((s) => s.setPaletteOpen);
  const setCompareModalOpen = useRunStore((s) => s.setCompareModalOpen);
  const viewMode = useRunStore((s) => s.viewMode);
  const setViewMode = useRunStore((s) => s.setViewMode);

  return (
    <header className="rule-b mb-7 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="flex items-center gap-5">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Back to landing page"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-ink-1 transition-colors hover:border-white/30 hover:text-white"
            >
              <ArrowLeft size={14} weight="bold" />
            </button>
          ) : null}
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-ink-2">PINZIT / CONTROL ROOM</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Reliability verdict workspace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeButton active={viewMode === 'audit'}   onClick={() => setViewMode('audit')}   icon={<ShieldCheck size={13} weight="bold" />} label="Audit" />
          <ModeButton active={viewMode === 'explore'} onClick={() => setViewMode('explore')} icon={<Compass size={13} weight="bold" />}     label="Explore" />
          <ModeButton active={viewMode === 'focus'}   onClick={() => setViewMode('focus')}   icon={<Target size={13} weight="bold" />}      label="Focus" />
          <span className="mx-1 h-5 w-px bg-white/10" />
          <ToolButton onClick={() => setPaletteOpen(true)} icon={<Keyboard size={13} weight="bold" />} label="Cmd+K" />
          <ToolButton onClick={() => setCompareModalOpen(true)} icon={<ArrowsLeftRight size={13} weight="bold" />} label="Compare" />
          <span className="mx-1 h-5 w-px bg-white/10" />
          <ExportButton disabled={!run} onClick={() => run && exportJSON(run.verdict)} label="JSON" />
          <ExportButton disabled={!run} onClick={() => run && exportCSV(run.csvRows)}  label="CSV" />
        </div>
      </div>
    </header>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
        active
          ? 'bg-ink-0 text-paper-0'
          : 'border border-white/10 text-ink-1 hover:border-white/30 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ToolButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-ink-1 transition-colors hover:border-white/30 hover:text-white"
    >
      {icon} {label}
    </button>
  );
}

function ExportButton({ disabled, onClick, label }: { disabled?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-ink-1 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
    >
      <DownloadSimple size={13} weight="bold" /> {label}
    </button>
  );
}
