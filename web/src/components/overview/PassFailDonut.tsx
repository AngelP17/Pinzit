import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { Verdict } from '../../types/pinzit';

export function PassFailDonut({ verdict }: { verdict: Verdict }) {
  const values = Object.values(verdict.constraints).map((v) => v.verdict);
  const counts = {
    PASS: values.filter((v) => v === 'PASS').length,
    FAIL: values.filter((v) => v === 'FAIL').length,
    SKIPPED: values.filter((v) => v === 'SKIPPED').length,
  };

  const data = [
    { name: 'PASS', value: counts.PASS, color: '#22c55e' },
    { name: 'FAIL', value: counts.FAIL, color: '#ef4444' },
    { name: 'SKIPPED', value: counts.SKIPPED, color: '#f59e0b' },
  ];

  return (
    <div className="panel h-72 p-4">
      <h3 className="mb-2 text-sm font-semibold text-zinc-300">Constraint Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
