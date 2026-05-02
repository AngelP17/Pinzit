import { Warning, Prohibit, ClipboardText, Bug, PuzzlePiece, Monitor } from '@phosphor-icons/react';

export function InvalidArtifactState({ reason }: { reason: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <Prohibit size={48} weight="duotone" className="mb-4 text-fail" />
      <h3 className="text-xl font-semibold text-white">Invalid Artifact</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{reason}</p>
    </div>
  );
}

export function PartialArtifactState({ missing }: { missing: string[] }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <PuzzlePiece size={48} weight="duotone" className="mb-4 text-skip" />
      <h3 className="text-xl font-semibold text-white">Partial Artifact</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        Some expected fields are missing. Results may be incomplete.
      </p>
      <ul className="mt-3 text-xs text-zinc-500">
        {missing.map((m) => (
          <li key={m}>- {m}</li>
        ))}
      </ul>
    </div>
  );
}

export function ParseErrorState({ message }: { message: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <Bug size={48} weight="duotone" className="mb-4 text-fail" />
      <h3 className="text-xl font-semibold text-white">Parse Error</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{message}</p>
    </div>
  );
}

export function SchemaMismatchState({ details }: { details: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <ClipboardText size={48} weight="duotone" className="mb-4 text-skip" />
      <h3 className="text-xl font-semibold text-white">Schema Mismatch</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">{details}</p>
    </div>
  );
}

export function DegradedCanvasState({ fallback }: { fallback?: React.ReactNode }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <Monitor size={48} weight="duotone" className="mb-4 text-zinc-500" />
      <h3 className="text-xl font-semibold text-white">Degraded View</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        The interactive canvas could not be initialized. A simplified view is shown below.
      </p>
      {fallback ? <div className="mt-4">{fallback}</div> : null}
    </div>
  );
}

export function EmptyRunState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <Warning size={48} weight="duotone" className="mb-4 text-zinc-500" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      <p className="mt-2 text-xs text-zinc-500">Drop your verdict + stats or click samples below. Cmd/Ctrl + K for actions.</p>
    </div>
  );
}
