import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function ZeroTrustSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.08, 0.95]);

  return (
    <section id="security" ref={ref} className="mx-auto max-w-6xl px-6 py-20 md:px-12">
      <div className="glass-panel flex flex-col items-center rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#39ff14]">Zero Trust</p>
        <h3 className="mt-2 font-display text-3xl text-white">Your trace data never leaves the browser</h3>
        <motion.svg style={{ scale }} viewBox="0 0 80 80" className="mt-6 h-20 w-20" aria-hidden="true">
          <rect x="18" y="34" width="44" height="32" rx="6" fill="#141416" stroke="#39ff14" />
          <path d="M26 34v-8a14 14 0 0 1 28 0v8" stroke="#39ff14" strokeWidth="4" fill="none" />
        </motion.svg>
      </div>
    </section>
  );
}
