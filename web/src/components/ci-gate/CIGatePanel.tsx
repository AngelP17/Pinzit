import type { RunBundle } from '../../types/pinzit';
import { Copy, Check, Terminal, FileText, FileCsv, FileHtml } from '@phosphor-icons/react';
import { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-surface-600 px-2 py-1 text-xs hover:border-pass focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {copied ? <Check size={12} weight="bold" className="text-pass" /> : <Copy size={12} weight="duotone" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function CIGatePanel({ run }: { run: RunBundle | null }) {
  const verdict = run?.verdict.overall_verdict ?? 'UNKNOWN';
  const exitCode = verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2;

  const prSummary = `## Pinzit Reliability Verdict: ${verdict}

Exit code: ${exitCode}

Failed constraints:
${run ? Object.entries(run.verdict.constraints)
  .filter(([, v]) => v.verdict === 'FAIL')
  .map(([k]) => `- ${k}`)
  .join('\n') || '- None' : '- None'}

Artifacts:
- pinzit_verdict.json
- pinzit_stats.csv
- pinzit_report.html

Recommended action:
Review recovery timeout and containment boundary evidence before merge.
`;

  const workflowYaml = `name: Pinzit Verdict
on: [pull_request]

jobs:
  pinzit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo build --release
      - run: |
          cargo run --release -- \\
            --trace ./trace.json \\
            --config ./pinzit.toml \\
            --outdir ./pinzit_out
      - uses: actions/upload-artifact@v4
        with:
          name: pinzit-report
          path: ./pinzit_out/
`;

  return (
    <div className="space-y-[var(--density-gap)]">
      <div className="tab-header">
        <div>
          <h2 className="tab-title">CI Gate</h2>
          <p className="tab-subtitle">Exit code preview, GitHub Actions snippet, and copyable PR summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Terminal size={18} weight="duotone" className="text-[#00f0ff]" />
            <h3 className="text-sm font-semibold text-white">Exit Code</h3>
          </div>
          <p className="mt-3 text-4xl font-bold text-white">{exitCode}</p>
          <p className={`mt-1 text-sm ${exitCode === 0 ? 'text-pass' : exitCode === 1 ? 'text-fail' : 'text-skip'}`}>
            {exitCode === 0 ? 'PASS — All constraints satisfied' : exitCode === 1 ? 'FAIL — One or more constraints violated' : 'ERROR — Config or parse issue'}
          </p>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} weight="duotone" className="text-[#00f0ff]" />
              <h3 className="text-sm font-semibold text-white">PR Summary</h3>
            </div>
            <CopyButton text={prSummary} />
          </div>
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-surface-900 p-3 text-xs text-zinc-300">{prSummary}</pre>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} weight="duotone" className="text-[#00f0ff]" />
            <h3 className="text-sm font-semibold text-white">GitHub Actions Workflow</h3>
          </div>
          <CopyButton text={workflowYaml} />
        </div>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-surface-900 p-3 text-xs text-zinc-300">{workflowYaml}</pre>
      </div>

      <div className="panel p-5">
        <h3 className="text-sm font-semibold text-white">Artifacts</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-surface-600 px-3 py-2 text-xs text-zinc-300">
            <FileText size={14} weight="duotone" /> pinzit_verdict.json
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-surface-600 px-3 py-2 text-xs text-zinc-300">
            <FileCsv size={14} weight="duotone" /> pinzit_stats.csv
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-surface-600 px-3 py-2 text-xs text-zinc-300">
            <FileHtml size={14} weight="duotone" /> pinzit_report.html
          </div>
        </div>
      </div>
    </div>
  );
}
