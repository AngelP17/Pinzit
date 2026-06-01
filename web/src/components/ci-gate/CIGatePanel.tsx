import { useState } from 'react';
import { Check, Copy } from '@phosphor-icons/react';
import type { RunBundle } from '../../types/pinzit';

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
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-ink-1 transition-colors hover:border-white/30 hover:text-white"
    >
      {copied ? <Check size={11} weight="bold" className="text-pass" /> : <Copy size={11} weight="bold" />}
      {copied ? 'COPIED' : 'COPY'}
    </button>
  );
}

export function CIGatePanel({ run }: { run: RunBundle | null }) {
  const verdict = run?.verdict.overall_verdict ?? 'UNKNOWN';
  const exitCode = verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2;
  const tone = verdict === 'PASS' ? 'text-pass' : verdict === 'FAIL' ? 'text-fail' : 'text-skip';

  const failedConstraints = run
    ? Object.entries(run.verdict.constraints)
        .filter(([, v]) => v.verdict === 'FAIL')
        .map(([k]) => `- ${k}`)
        .join('\n') || '- None'
    : '- None';

  const prSummary = `## Pinzit Reliability Verdict: ${verdict}

Exit code: ${exitCode}

Failed constraints:
${failedConstraints}

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
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">CI GATE</span>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            Decision surface: exit code, PR summary, workflow
          </h2>
          <p className="mt-1 text-sm text-ink-1">Copyable artifacts ready for your delivery pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Exit code — editorial banner */}
        <section className="surface col-span-12 p-7 lg:col-span-4">
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">EXIT CODE</span>
          <p className={`display display-mega mt-3 ${tone}`}>{exitCode}</p>
          <p className={`mt-3 text-sm ${tone}`}>
            {exitCode === 0 && 'PASS, all constraints satisfied'}
            {exitCode === 1 && 'FAIL, one or more constraints violated'}
            {exitCode === 2 && 'ERROR, config or parse issue'}
          </p>
          <p className="mt-6 border-t border-white/10 pt-4 text-[12.5px] text-ink-1">
            Pinzit emits exit codes suitable for use as a CI gate. No backend, no orchestration.
          </p>
        </section>

        {/* PR Summary */}
        <section className="surface col-span-12 p-6 lg:col-span-8">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">PR SUMMARY</span>
            <CopyButton text={prSummary} />
          </div>
          <pre className="mt-4 max-h-56 overflow-auto rounded-lg bg-paper-2 p-4 font-mono text-[12.5px] leading-relaxed text-ink-1">
{prSummary}
          </pre>
        </section>

        {/* Workflow */}
        <section className="surface col-span-12 p-6">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">GITHUB ACTIONS WORKFLOW</span>
            <CopyButton text={workflowYaml} />
          </div>
          <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-paper-2 p-4 font-mono text-[12.5px] leading-relaxed text-ink-1">
{workflowYaml}
          </pre>
        </section>

        {/* Artifacts */}
        <section className="surface col-span-12 grid grid-cols-3 gap-px bg-white/5">
          {[
            { label: 'pinzit_verdict.json', tag: 'JSON' },
            { label: 'pinzit_stats.csv', tag: 'CSV' },
            { label: 'pinzit_report.html', tag: 'HTML' },
          ].map((a) => (
            <div key={a.label} className="bg-paper-1 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{a.tag}</p>
              <p className="mt-1 font-mono text-[12.5px] text-white break-all">{a.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
