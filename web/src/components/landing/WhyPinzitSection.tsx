import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const differentiators = [
  {
    title: 'Deterministic by design',
    body: 'Same inputs always produce the same verdict and evidence trail, making audits reproducible and defensible.',
  },
  {
    title: 'Client-only execution',
    body: 'Trace artifacts stay on-device. No uploads, no server dependency, no exposure of sensitive telemetry.',
  },
  {
    title: 'Constraint-native intelligence',
    body: 'Built around SLFS-001, RTCB-002, and BRC-003 so teams can reason directly against reliability controls.',
  },
  {
    title: 'Operator-speed UX',
    body: 'Keyboard-first navigation, comparison mode, and export-ready outputs reduce time-to-decision during reviews.',
  },
];

export function WhyPinzitSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
      <div className="panel border-[#00f0ff]/20 bg-gradient-to-br from-[#00f0ff]/10 via-transparent to-[#39ff14]/10 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#00f0ff]">What Pinzit Is</p>
        <h3 className="mt-3 font-display text-3xl text-white md:text-4xl">
          Pinzit is a trace-native reliability verdict engine for modern delivery teams.
        </h3>
        <p className="mt-4 max-w-3xl text-zinc-300">
          It transforms OpenTelemetry trace artifacts into PASS/FAIL/SKIPPED decisions with
          linked evidence, then presents everything in an interactive control room that is fast,
          explainable, and safe for production workflows.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {differentiators.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-lg border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-[#39ff14]" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="mt-1 text-sm text-zinc-300">{item.body}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-[#00f0ff]/25 bg-[#00f0ff]/10 p-4">
          <p className="text-sm text-zinc-100">
            Why this is the optimal solution: Pinzit balances strict reproducibility, zero-trust
            data handling, and high operator throughput in one workflow, without adding backend
            infrastructure or operational overhead.
          </p>
        </div>
      </div>
    </section>
  );
}
