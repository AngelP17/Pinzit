import { motion } from 'framer-motion';

const steps = [
  {
    title: 'Drop a verdict bundle.',
    body: 'pinzit_verdict.json plus pinzit_stats.csv. Files never leave the browser. Schema is validated locally.',
  },
  {
    title: 'Constraints evaluate the trace.',
    body: 'SLFS-001, RTCB-002, BRC-003 read parsed spans, compare against thresholds, and emit deterministic verdicts.',
  },
  {
    title: 'Operators ship with evidence.',
    body: 'Linked spans, severity, recovery rulers and copyable PR summary land directly in the control room. Exit code in two clicks.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="manifest" className="mx-auto max-w-6xl px-6 py-32 md:px-10 md:py-44">
      <h2 className="display display-lg max-w-3xl text-white">
        One read pass. Three constraints. Zero hallucinations.
      </h2>
      <ol className="mt-14 divide-y divide-white/10">
        {steps.map((step, idx) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            className="py-7"
          >
            <h3 className="text-xl font-medium text-white tracking-tight">{step.title}</h3>
            <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-ink-1">{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
