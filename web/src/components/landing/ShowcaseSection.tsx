import { motion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';
import { ConsolePreview } from './ConsolePreview';

export function ShowcaseSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="features" className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:px-12">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#00f0ff]">Control Room UX</p>
        <h3 className="mt-3 font-display text-3xl text-white">See reliability posture before merge.</h3>
        <p className="mt-3 text-zinc-300">Compare baseline vs current runs, inspect evidence traces, and export ready-to-audit artifacts.</p>
        <button
          onClick={onLaunch}
          className="mt-6 inline-flex items-center gap-2 rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/12 px-4 py-2 text-sm text-[#9dedff] transition hover:bg-[#00f0ff]/18 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Open Dashboard <ArrowRight size={14} weight="duotone" />
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <ConsolePreview />
      </motion.div>
    </section>
  );
}
