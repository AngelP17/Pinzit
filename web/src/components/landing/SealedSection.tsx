export function SealedSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-12">
      <div className="panel border-[#00f0ff]/20 bg-gradient-to-r from-[#00f0ff]/10 via-[#00f0ff]/5 to-transparent p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#00f0ff]">Cryptographic Traceability</p>
        <h3 className="mt-3 font-display text-2xl text-white">Sealed evidence chain</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Hash-linked checkpoints verify every verdict decision from raw trace input to signed output.
        </p>
        <svg viewBox="0 0 700 220" className="mt-6 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="traceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#39ff14" />
              <stop offset="60%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#ff2e63" />
            </linearGradient>
            <filter id="traceGlow">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g strokeLinecap="round">
            <line x1="90" y1="110" x2="220" y2="70" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <line x1="220" y1="70" x2="350" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <line x1="220" y1="150" x2="350" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <line x1="350" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <line x1="480" y1="110" x2="610" y2="110" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
            <line x1="220" y1="70" x2="220" y2="150" stroke="rgba(255,255,255,0.10)" strokeWidth="3" />
          </g>

          <g strokeLinecap="round" filter="url(#traceGlow)">
            <line x1="90" y1="110" x2="220" y2="70" stroke="url(#traceGradient)" strokeWidth="2.8" />
            <line x1="220" y1="70" x2="350" y2="110" stroke="#00f0ff" strokeWidth="2.8" />
            <line x1="220" y1="150" x2="350" y2="110" stroke="#00f0ff" strokeWidth="2.8" />
            <line x1="350" y1="110" x2="480" y2="110" stroke="#00f0ff" strokeWidth="2.8" />
            <line x1="480" y1="110" x2="610" y2="110" stroke="#00f0ff" strokeWidth="2.8" />
            <line x1="220" y1="70" x2="220" y2="150" stroke="#00f0ff" strokeWidth="2.2" opacity="0.8" />
          </g>

          <circle cx="90" cy="110" r="14" fill="#39ff14" />
          <circle cx="220" cy="70" r="14" fill="#00f0ff" />
          <circle cx="220" cy="150" r="14" fill="#00f0ff" />
          <circle cx="350" cy="110" r="16" fill="#ff2e63" />
          <circle cx="480" cy="110" r="14" fill="#00f0ff" />
          <circle cx="610" cy="110" r="16" fill="#00f0ff" />

          <circle cx="350" cy="110" r="5" fill="#39ff14" />

          <text x="74" y="140" fill="#9ca3af" fontSize="12">Input</text>
          <text x="198" y="50" fill="#9ca3af" fontSize="12">Merkle A</text>
          <text x="198" y="178" fill="#9ca3af" fontSize="12">Merkle B</text>
          <text x="334" y="142" fill="#9ca3af" fontSize="12">Seal</text>
          <text x="462" y="142" fill="#9ca3af" fontSize="12">Proof</text>
          <text x="590" y="142" fill="#9ca3af" fontSize="12">Verdict</text>
        </svg>
      </div>
    </section>
  );
}
