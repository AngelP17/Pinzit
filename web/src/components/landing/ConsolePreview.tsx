import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMemo } from 'react';

export function ConsolePreview() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 18 });
  const sy = useSpring(my, { stiffness: 140, damping: 18 });

  const rotateX = useTransform(sy, [-50, 50], [7, -7]);
  const rotateY = useTransform(sx, [-50, 50], [-9, 9]);

  const rows = useMemo(
    () => [
      'overall_verdict=PASS',
      'slfs_001.unsafe_after_loss_count=0',
      'rtcb_002.max_recovery_ms_seen=1000',
      'brc_003.boundary_detected=true',
    ],
    []
  );

  return (
    <motion.div
      style={{ rotateX, rotateY }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        mx.set(e.clientX - (rect.left + rect.width / 2));
        my.set(e.clientY - (rect.top + rect.height / 2));
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="panel max-w-3xl cursor-pointer rounded-2xl border border-[#00f0ff]/20 bg-black/60 p-5"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[#39ff14]">Live Preview</p>
      <div className="mt-3 space-y-2 font-mono text-sm text-zinc-200">
        {rows.map((row) => (
          <div key={row} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
            {row}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
