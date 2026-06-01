import { ArrowRight, GithubLogo } from '@phosphor-icons/react';

export function FinalCTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="launch" className="mx-auto max-w-6xl px-6 pb-32 pt-20 md:px-10 md:pb-44">
      <h2 className="display display-xl max-w-4xl text-white">
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

      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="surface p-5">
          <span className="font-mono text-[24px] text-pass">0</span>
          <p className="mt-1 text-[13.5px] text-ink-1">PASS, all constraints satisfied</p>
        </div>
        <div className="surface p-5">
          <span className="font-mono text-[24px] text-fail">1</span>
          <p className="mt-1 text-[13.5px] text-ink-1">FAIL, at least one constraint violated</p>
        </div>
        <div className="surface p-5">
          <span className="font-mono text-[24px] text-skip">2</span>
          <p className="mt-1 text-[13.5px] text-ink-1">ERROR, config or parse failure</p>
        </div>
      </div>

      <p className="mt-12 font-mono text-[11px] tracking-[0.18em] text-ink-2">
        MIT License
      </p>
    </section>
  );
}
