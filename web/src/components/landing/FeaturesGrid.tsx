import { motion } from 'framer-motion';

const cards = [
  'Client-only processing',
  'Deterministic recommendations',
  'Constraint-level diffing',
  'Exportable audit artifacts',
  'Keyboard-first operator flow',
  'Zero-trust data boundaries',
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
      <h3 className="font-display text-3xl text-white">Why teams adopt Pinzit</h3>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel rounded-xl p-4"
          >
            <p className="text-sm text-zinc-200">{card}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
