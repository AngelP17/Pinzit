import { motion } from 'framer-motion';
import { Aperture, ShieldCheck, Upload } from '@phosphor-icons/react';

const steps = [
  { title: 'Upload', body: 'Drop verdict + stats artifacts directly in browser.', icon: Upload },
  { title: 'Analyze', body: 'Pinzit evaluates SLFS-001, RTCB-002, and BRC-003.', icon: Aperture },
  { title: 'Decide', body: 'Review deterministic evidence and export CI-grade results.', icon: ShieldCheck },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 md:px-12">
      <h2 className="font-display text-3xl text-white md:text-4xl">How it works</h2>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Pinzit keeps operations simple: ingest artifacts, evaluate reliability constraints, and return decision-grade evidence in seconds.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <motion.article
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="glass-panel rounded-2xl p-5"
          >
            <step.icon className="text-[#00f0ff]" size={18} weight="duotone" />
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{step.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
