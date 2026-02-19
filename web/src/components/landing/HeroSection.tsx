import { Suspense, lazy } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ConsolePreview } from './ConsolePreview';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

export function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate min-h-screen overflow-hidden px-6 pb-16 pt-24 md:px-12">
      <Suspense fallback={<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(0,240,255,.15),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(57,255,20,.12),transparent_55%)]" />}>
        <HeroCanvas />
      </Suspense>

      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00f0ff]"
        >
          Trace-Native Reliability Intelligence
        </motion.p>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 max-w-4xl font-display text-4xl leading-tight text-white md:text-6xl"
        >
          Pinzit turns raw telemetry into auditable, zero-trust verdicts.
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="mt-5 max-w-2xl text-base text-zinc-300 md:text-lg"
        >
          Upload the verdict + stats artifacts. Get instant, interactive reliability evidence with no servers and no data leaving your machine.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <button
            onClick={onLaunch}
            className="inline-flex items-center gap-2 rounded-md border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-5 py-3 text-sm font-semibold text-[#00f0ff] hover:bg-[#00f0ff]/20 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Launch Control Room <ArrowRight size={16} />
          </button>
          <a
            href="#how-it-works"
            className="rounded-md border border-white/20 px-5 py-3 text-sm text-zinc-200 hover:border-white/40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            See How It Works
          </a>
        </motion.div>

        <div className="mt-12">
          <ConsolePreview />
        </div>

        <div className="mt-10 overflow-hidden border-y border-white/10 py-2">
          <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.2em] text-zinc-400">
            PASS · FAIL · SKIPPED · deterministic evidence · client-only analysis · no uploads · zero trust by default ·
          </div>
        </div>
      </div>
    </section>
  );
}
