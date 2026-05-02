import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPreviewPackets } from '../../lib/demo-mock';

export function ConsolePreview() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const packets = useMemo(() => createPreviewPackets(), []);
  const packet = packets[activeIndex];

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % packets.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [packets.length, reduceMotion]);

  if (!packet) return null;

  return (
    <div className="console-preview overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="block h-2.5 w-2.5 rounded-full bg-fail/70" />
          <span className="block h-2.5 w-2.5 rounded-full bg-skip/70" />
          <span className="block h-2.5 w-2.5 rounded-full bg-pass/70" />
          <span className="ml-3 text-[11px] uppercase tracking-[0.18em] text-ink-2">pinzit_verdict.json</span>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em] ${
            packet.verdict === 'PASS'
              ? 'border-pass/40 bg-pass/10 text-pass'
              : 'border-fail/40 bg-fail/10 text-fail'
          }`}
        >
          {packet.verdict}
        </span>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">
        <Metric label="Run" value={packet.runId.slice(0, 14)} />
        <Metric label="Env" value={packet.environment} />
        <Metric label="Latency" value={`${packet.latencyMs}ms`} />
        <Metric label="Spans" value={String(packet.spanCount)} />
      </div>

      {/* Live log */}
      <div className="px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={packet.runId}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32 }}
            className="space-y-2 font-mono text-[12.5px] leading-relaxed text-ink-1"
          >
            <Line>$ pinzit --trace ./trace.json --config ./pinzit.toml</Line>
            <Line muted>loaded {packet.spanCount} spans · profile={packet.profile}</Line>
            <Line muted>signal_loss_events={packet.signalLossEvents} · evidence_spans={packet.evidenceCount}</Line>
            {packet.lines.map((line) => (
              <Line key={line}>{line}</Line>
            ))}
            <div className="mt-3 border-t border-white/10 pt-3">
              <Line accent>verdict={packet.verdict} · exit={packet.verdict === 'PASS' ? 0 : 1}</Line>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper-2 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{label}</p>
      <p className="mt-1 font-mono text-[12.5px] text-white">{value}</p>
    </div>
  );
}

function Line({ children, muted, accent }: { children: React.ReactNode; muted?: boolean; accent?: boolean }) {
  return (
    <p className={accent ? 'text-signal' : muted ? 'text-ink-2' : 'text-ink-1'}>
      <span className="mr-2 select-none text-ink-2/60">›</span>
      {children}
    </p>
  );
}
