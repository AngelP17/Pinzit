/*
 * Trusted-by marquee — replaces the prior generic "Zero Trust" badge tile.
 * Single restrained accent, infinite scroll, no card spam.
 */
const ROLES = [
  'SRE',
  'Platform',
  'Observability',
  'Security Engineering',
  'Reliability Architecture',
  'Incident Response',
  'Compliance',
  'Audit',
];

export function ZeroTrustSection() {
  const items = [...ROLES, ...ROLES];
  return (
    <section className="overflow-hidden border-y border-white/10 bg-paper-1 py-10">
      <div className="marquee-track gap-16 px-6">
        {items.map((role, idx) => (
          <span
            key={`${role}-${idx}`}
            className="inline-flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.22em] text-ink-2"
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-signal" />
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}
