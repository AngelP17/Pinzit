import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPreviewPackets } from '../../lib/demo-mock';

export function ConsolePreview() {
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 });
  const sy = useSpring(my, { stiffness: 140, damping: 18 });
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateX = useTransform(sy, [-50, 50], [7, -7]);
  const rotateY = useTransform(sx, [-50, 50], [-9, 9]);

  const packets = useMemo(() => createPreviewPackets(), []);
  const packet = packets[activeIndex];

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % packets.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [packets.length, reduceMotion]);

  if (!packet) return null;

  return (
    <motion.div
      style={reduceMotion ? {} : { rotateX, rotateY }}
      onMouseMove={(e) => {
        if (reduceMotion) return;
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        mx.set(e.clientX - (rect.left + rect.width / 2));
        my.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => {
        if (reduceMotion) return;
        mx.set(0);
        my.set(0);
      }}
      className="glass-panel relative max-w-3xl overflow-hidden rounded-2xl p-5 md:p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(0,240,255,0.18),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(57,255,20,0.08),transparent_45%)]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#39ff14]">Live Preview</p>
          <p
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
              packet.verdict === 'PASS'
                ? 'border-pass/50 bg-pass/20 text-pass'
                : 'border-fail/50 bg-fail/20 text-fail'
            }`}
          >
            {packet.verdict}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-400 md:grid-cols-4">
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="block text-[10px] text-zinc-500">Run</span>
            <span className="mt-1 block font-mono text-zinc-200">{packet.runId.slice(0, 14)}</span>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="block text-[10px] text-zinc-500">Env</span>
            <span className="mt-1 block font-mono text-zinc-200">{packet.environment}</span>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="block text-[10px] text-zinc-500">Latency</span>
            <span className="mt-1 block font-mono text-zinc-200">{packet.latencyMs}ms</span>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="block text-[10px] text-zinc-500">Verdict</span>
            <span className="mt-1 block font-mono text-zinc-200">{packet.verdict}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-3 space-y-2 font-mono text-sm text-zinc-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={packet.runId}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="space-y-2"
          >
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              run_id={packet.runId}
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              profile={packet.profile} loaded_at="{packet.timestamp}"
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              summary parsed_span_count={packet.spanCount} signal_loss_events={packet.signalLossEvents}{' '}
              evidence_spans={packet.evidenceCount}
            </div>
            {packet.lines.map((line) => (
              <div
                key={`${packet.runId}-${line}`}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                {line}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
