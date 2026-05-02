import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';

const evidenceFrames = [
  {
    label: 'Origin',
    span: 'trace.span.signal_loss_watchdog',
    metric: 'observed: 0ms',
    note: 'No unsafe action observed after telemetry loss within window.',
    seed: 'pinzit-evidence-origin',
  },
  {
    label: 'Recovery',
    span: 'trace.span.system.recovery',
    metric: 'observed: 1030ms · ceiling 30000ms',
    note: 'Stability check satisfied within bounded recovery envelope.',
    seed: 'pinzit-evidence-recovery',
  },
  {
    label: 'Containment',
    span: 'trace.span.fault.isolation',
    metric: 'hops: 2 · max 2',
    note: 'Failure stayed inside isolation boundary. Bulkhead intact.',
    seed: 'pinzit-evidence-containment',
  },
];

export function ShowcaseSection({ onLaunch }: { onLaunch: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const ribbonScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="evidence"
      ref={ref}
      className="relative mx-auto max-w-6xl px-6 py-32 md:px-10 md:py-44"
      style={{ minHeight: reduce ? undefined : '170vh' }}
    >
      <div className="grid grid-cols-12 gap-x-10 gap-y-10">
        {/* Pinned left column */}
        <div className="col-span-12 md:col-span-5 md:sticky md:top-32 md:self-start">
          <span className="eyebrow">Evidence in motion</span>
          <h2 className="display display-lg mt-4 text-white">
            Every verdict points back to a span you can read.
          </h2>
          <p className="lede mt-6">
            Pinzit doesn't summarize. It cites. Each constraint result is anchored
            to a specific evidence span in the original trace — with the metric,
            the threshold, and the recommendation rendered side by side.
          </p>

          <div className="mt-8 h-px w-full bg-white/10">
            <motion.div
              style={reduce ? undefined : { scaleX: ribbonScale }}
              className="pin-ribbon-progress"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onLaunch}
              className="hero-cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Open in Control Room <ArrowRight size={14} weight="bold" />
            </button>
            <a href="#architecture" className="text-sm text-ink-1 underline-offset-4 hover:text-white hover:underline">
              See the architecture
            </a>
          </div>
        </div>

        {/* Scrolling right column */}
        <div className="col-span-12 md:col-span-7">
          <div className="space-y-8">
            {evidenceFrames.map((frame, idx) => (
              <motion.figure
                key={frame.label}
                initial={reduce ? false : { opacity: 0.25, y: 24, scale: 0.97 }}
                whileInView={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, margin: '-25%' }}
                transition={{ duration: 0.55, delay: idx * 0.04 }}
                className="surface overflow-hidden"
              >
                <div className="flex items-baseline justify-between border-b border-white/10 px-5 py-3">
                  <span className="font-mono text-[11px] tracking-[0.18em] text-ink-2">
                    EVIDENCE / {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] text-pass">PASS</span>
                </div>
                <div
                  className="relative h-44 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(12,17,24,0.85) 100%), url(https://picsum.photos/seed/${frame.seed}/1280/520)`,
                    filter: 'grayscale(0.45) contrast(1.05)',
                  }}
                >
                  <p className="absolute bottom-3 left-5 font-mono text-[12px] text-white/85">{frame.span}</p>
                </div>
                <figcaption className="grid grid-cols-12 gap-4 px-5 py-5">
                  <div className="col-span-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{frame.label}</p>
                    <p className="mt-1 font-mono text-[12.5px] text-white">{frame.metric}</p>
                  </div>
                  <p className="col-span-8 text-[14px] leading-relaxed text-ink-1">{frame.note}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
