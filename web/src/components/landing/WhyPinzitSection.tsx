import { motion } from 'framer-motion';

const tenets = [
  {
    title: 'Deterministic',
    body: 'Same inputs, same verdict, same evidence trail. Always.',
  },
  {
    title: 'Local-only',
    body: 'No uploads. No remote inference. The browser is the runtime.',
  },
  {
    title: 'Constraint-native',
    body: 'Built around SLFS, RTCB and BRC, not generic anomaly heuristics.',
  },
  {
    title: 'Auditor-grade',
    body: 'Every decision exports as JSON, CSV and HTML for review boards.',
  },
];

export function WhyPinzitSection() {
  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-32 md:px-10 md:py-44">
      <h2 className="display display-lg max-w-3xl text-white">
        Reliability evidence that survives an audit room.
      </h2>
      <p className="lede mt-6">
        Pinzit ships four non-negotiables. They shape every output, every
        verdict, every byte of telemetry the tool ever touches.
      </p>
      <ul className="mt-14">
        {tenets.map((tenet, idx) => (
          <motion.li
            key={tenet.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: idx * 0.06, duration: 0.5 }}
            className="border-b border-white/10 py-6 last:border-b-0"
          >
            <h3 className="text-xl font-medium tracking-tight text-white">{tenet.title}</h3>
            <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-ink-1">{tenet.body}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
