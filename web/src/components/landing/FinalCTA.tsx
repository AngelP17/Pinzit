import { ArrowRight, GithubLogo } from '@phosphor-icons/react';

export function FinalCTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="launch" className="mx-auto max-w-6xl px-6 pb-32 pt-20 md:px-10 md:pb-44">
      <div className="grid grid-cols-12 gap-x-10 gap-y-12">
        <div className="col-span-12 md:col-span-8">
          <span className="eyebrow-signal">Action</span>
          <h2 className="display display-xl mt-4 text-white">
            Audit reliability the way auditors actually read systems.
          </h2>
          <p className="lede mt-7">
            Open the Control Room with a deterministic sample run. Then bring
            your own pinzit_verdict.json and pinzit_stats.csv. No backend, no
            account, no telemetry.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={onLaunch}
              className="hero-cta-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.015]"
            >
              Launch Control Room <ArrowRight size={16} weight="bold" />
            </button>
            <a
              href="https://github.com/AngelP17/Pinzit"
              target="_blank"
              rel="noreferrer"
              className="hero-cta-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            >
              <GithubLogo size={16} weight="bold" /> View source
            </a>
          </div>
        </div>

        <aside className="col-span-12 md:col-span-4 md:pt-2">
          <p className="eyebrow">Exit codes</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-baseline justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-pass">0</span>
              <span className="text-[13.5px] text-ink-1">PASS — all constraints satisfied</span>
            </li>
            <li className="flex items-baseline justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-fail">1</span>
              <span className="text-[13.5px] text-ink-1">FAIL — at least one constraint violated</span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="font-mono text-skip">2</span>
              <span className="text-[13.5px] text-ink-1">ERROR — config or parse failure</span>
            </li>
          </ul>

          <p className="mt-10 font-mono text-[11px] tracking-[0.18em] text-ink-2">
            Pinzit · v0.1.0 · MIT
          </p>
        </aside>
      </div>
    </section>
  );
}
