import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

/*
 * Editorial bento manifest — 6 columns × 4 rows × grid-flow-dense.
 * Cells: A(3×2) + B(3×2) + C(2×2) + D(2×2) + E(2×2) = 18 col-units / 6 = 3 rows.
 * Plus a full-width footer ribbon. No empty cells.
 */
export function FeaturesGrid() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const sealScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const sealOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.4, 1, 0.6]);

  return (
    <section ref={ref} id="architecture" className="mx-auto max-w-6xl px-6 py-32 md:px-10 md:py-40">
      <div className="mb-14 grid grid-cols-12 gap-x-10 gap-y-6">
        <div className="col-span-12 md:col-span-7">
          <span className="eyebrow">What lives inside</span>
          <h2 className="display display-lg mt-4 text-white">
            A control room built around evidence — not opinion.
          </h2>
        </div>
        <div className="col-span-12 md:col-span-5 md:pt-2">
          <p className="lede">
            Every cell below maps to a real artifact in the verdict bundle.
            Hover to inspect the source-of-truth column for that surface.
          </p>
        </div>
      </div>

      <div className="bento">
        {/* A — Verdict pulse (3×2) */}
        <article className="bento-cell col-span-6 row-span-2 md:col-span-3">
          <div className="flex h-full flex-col justify-between">
            <div>
              <span className="eyebrow-signal">Overall verdict</span>
              <p className="display display-lg mt-5 text-white">PASS</p>
              <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink-1">
                Three constraints satisfied across 295 parsed spans. Critical
                path completed in 4.31s; recovery within bound.
              </p>
            </div>
            <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-2">EXIT</p>
                <p className="mt-1 font-mono text-2xl text-pass">0</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-2">RUN</p>
                <p className="mt-1 font-mono text-[12px] text-ink-1">pinzit_1714651200</p>
              </div>
            </div>
          </div>
        </article>

        {/* B — Constraint matrix (3×2) */}
        <article className="bento-cell col-span-6 row-span-2 md:col-span-3">
          <span className="eyebrow">Constraints</span>
          <ul className="mt-5 divide-y divide-white/10">
            {CONSTRAINTS.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between py-3">
                <div>
                  <p className="font-mono text-[12px] text-ink-2">{c.id}</p>
                  <p className="mt-0.5 text-[14px] text-white">{c.name}</p>
                </div>
                <span className={`font-mono text-[11px] tracking-[0.18em] ${c.tone === 'pass' ? 'text-pass' : c.tone === 'fail' ? 'text-fail' : 'text-skip'}`}>
                  {c.verdict}
                </span>
              </li>
            ))}
          </ul>
        </article>

        {/* C — Recovery ribbon (2×2) */}
        <article className="bento-cell col-span-6 row-span-2 md:col-span-2">
          <span className="eyebrow">Recovery</span>
          <p className="display display-lg mt-5 text-white">1.03<span className="text-ink-2 text-2xl ml-1">s</span></p>
          <p className="mt-1 text-[12px] text-ink-2">observed</p>
          <div className="mt-7">
            <div className="relative h-1.5 w-full rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '7%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute left-0 top-0 h-full rounded-full bg-pass"
              />
              <span className="absolute right-0 -top-5 font-mono text-[10px] text-ink-2">30s ceiling</span>
            </div>
            <p className="mt-4 text-[12px] text-ink-1">RTCB-002 — within bound.</p>
          </div>
        </article>

        {/* D — Image cell, large (4×2) */}
        <article
          className="bento-cell bento-cell-image col-span-6 row-span-2 md:col-span-4"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/pinzit-control-architecture/1280/720)' }}
        >
          <div className="relative z-10 flex h-full flex-col justify-end">
            <span className="eyebrow-signal">Causal graph</span>
            <p className="mt-3 text-2xl font-medium text-white tracking-tight">
              Reconstruct the chain of failure — span by span.
            </p>
            <p className="mt-2 max-w-md text-[13px] text-ink-1">
              The control room rebuilds the parent-child topology so a reviewer
              can trace propagation from origin to containment in one read.
            </p>
          </div>
        </article>

        {/* E — Sealed evidence (2×2) */}
        <article className="bento-cell col-span-6 row-span-2 md:col-span-2">
          <span className="eyebrow">Sealed evidence</span>
          <motion.svg
            style={{ scale: sealScale, opacity: sealOpacity }}
            viewBox="0 0 200 120"
            className="mt-6 w-full"
            aria-hidden="true"
          >
            <line x1="20" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="20" y1="60" x2="180" y2="60" stroke="#f5b04a" strokeWidth="1.4" strokeDasharray="4 6" />
            {[20, 60, 100, 140, 180].map((cx, i) => (
              <g key={cx}>
                <circle cx={cx} cy="60" r="6" fill={i === 2 ? '#f5b04a' : '#11171f'} stroke="#f5b04a" strokeWidth="1.2" />
              </g>
            ))}
            <text x="20" y="90" fontSize="9" fill="#8b8576" fontFamily="monospace" textAnchor="middle">trace</text>
            <text x="100" y="90" fontSize="9" fill="#8b8576" fontFamily="monospace" textAnchor="middle">seal</text>
            <text x="180" y="90" fontSize="9" fill="#8b8576" fontFamily="monospace" textAnchor="middle">verdict</text>
          </motion.svg>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-1">
            Hash-linked checkpoints make every verdict reproducible end-to-end.
          </p>
        </article>

        {/* F — Footer band, full width */}
        <article className="bento-cell col-span-6 row-span-1 md:col-span-6">
          <div className="grid grid-cols-12 items-center gap-6">
            <div className="col-span-12 md:col-span-4">
              <span className="eyebrow">Decision surface</span>
              <p className="mt-2 text-base text-white">CI gate · PR summary · exit code</p>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p className="text-[14px] leading-relaxed text-ink-1">
                Every verdict ships with a copyable PR summary block, a GitHub
                Actions snippet and a clean exit code. Pinzit's job ends where
                your delivery pipeline starts — no orchestration, no callbacks.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

const CONSTRAINTS = [
  { id: 'SLFS-001', name: 'Fail-Safe Fallback',       verdict: 'PASS', tone: 'pass' as const },
  { id: 'RTCB-002', name: 'Recovery Time Bound',      verdict: 'PASS', tone: 'pass' as const },
  { id: 'BRC-003',  name: 'Blast Radius Containment', verdict: 'PASS', tone: 'pass' as const },
];
