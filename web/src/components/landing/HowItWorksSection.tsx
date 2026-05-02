import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    title: 'Drop a verdict bundle.',
    body: 'pinzit_verdict.json plus pinzit_stats.csv. Files never leave the browser. Schema is validated locally.',
  },
  {
    n: '02',
    title: 'Constraints evaluate the trace.',
    body: 'SLFS-001, RTCB-002, BRC-003 read parsed spans, compare against thresholds, and emit deterministic verdicts.',
  },
  {
    n: '03',
    title: 'Operators ship with evidence.',
    body: 'Linked spans, severity, recovery rulers and copyable PR summary land directly in the control room — exit code in two clicks.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="manifest" className="mx-auto max-w-6xl px-6 py-32 md:px-10 md:py-44">
      <div className="grid grid-cols-12 gap-x-10 gap-y-10">
        <div className="col-span-12 md:col-span-4">
          <span className="eyebrow">The manifest</span>
          <h2 className="display display-lg mt-4 text-white">
            One read pass. Three constraints. Zero hallucinations.
          </h2>
        </div>

        <div className="col-span-12 md:col-span-8">
          <ol className="divide-y divide-white/10">
            {steps.map((step, idx) => (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="grid grid-cols-12 gap-6 py-7"
              >
                <span className="col-span-2 font-mono text-[12px] tracking-[0.18em] text-ink-2">{step.n}</span>
                <div className="col-span-10">
                  <h3 className="text-xl font-medium text-white tracking-tight">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-ink-1">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
