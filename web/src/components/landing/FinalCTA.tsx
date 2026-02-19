import { ArrowRight, Github } from 'lucide-react';

export function FinalCTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:px-12">
      <div className="glass-panel rounded-2xl bg-gradient-to-r from-[#00f0ff]/11 via-transparent to-[#39ff14]/12 p-8 text-center">
        <h3 className="font-display text-3xl text-white">Ready to audit reliability in seconds?</h3>
        <p className="mt-2 text-zinc-300">Launch the control room with sample data, then bring your own Pinzit artifacts.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-2 rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-5 py-3 text-sm font-semibold text-[#00f0ff] hover:bg-[#00f0ff]/20 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Launch Control Room <ArrowRight size={16} />
          </button>
          <a
            href="https://github.com/AngelP17/Pinzit"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm text-zinc-100 hover:border-white/40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Github size={16} /> GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
