import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { Verdict } from '../../types/pinzit';

export function PassFailDonut({ verdict }: { verdict: Verdict }) {
  const values = Object.values(verdict.constraints).map((v) => v.verdict);
  const counts = {
    PASS: values.filter((v) => v === 'PASS').length,
    FAIL: values.filter((v) => v === 'FAIL').length,
    SKIPPED: values.filter((v) => v === 'SKIPPED').length,
  };
  const total = counts.PASS + counts.FAIL + counts.SKIPPED;
  const data = [
    { name: 'PASS',    value: counts.PASS,    color: '#6dd58c' },
    { name: 'FAIL',    value: counts.FAIL,    color: '#ff6a6a' },
    { name: 'SKIPPED', value: counts.SKIPPED, color: '#f5b04a' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">DISTRIBUTION</span>
        <span className="font-mono text-[11px] text-ink-2">n={total}</span>
      </div>
      <div className="relative mt-2 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={1}>
              {data.map((item) => <Cell key={item.name} fill={item.color} stroke="rgba(0,0,0,0)" />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-mono text-[24px] font-medium text-white leading-none">{counts.PASS}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">passing</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pass" />pass</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-fail" />fail</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-skip" />skip</span>
      </div>
    </div>
  );
}
