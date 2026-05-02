import { Suspense, lazy, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, GithubLogo, ArrowSquareOut } from '@phosphor-icons/react';
import { ConsolePreview } from './ConsolePreview';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

const navLinks = [
  { label: 'Manifest',     href: '#manifest' },
  { label: 'Evidence',     href: '#evidence' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Security',     href: '#security' },
];

export function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const consoleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const consoleOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.85, 0.4]);

  return (
    <section id="top" ref={sectionRef} className="hero-shell px-6 pb-24 pt-6 md:px-10">
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 -z-10 hero-vignette" />

      {/* Floating glass-pill nav */}
      <motion.nav
        initial={reduce ? false : { opacity: 0, y: -14 }}
        animate={reduce ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="sticky top-5 z-40 mx-auto max-w-6xl"
      >
        <div className="surface flex items-center justify-between rounded-full px-4 py-2.5 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-2 border border-white/10">
              <span className="block h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight">Pinzit</span>
            <span className="ml-2 hidden h-3 w-px bg-white/15 md:block" />
            <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2 md:block">v0.1.0</span>
          </div>
          <div className="hidden items-center gap-7 text-[13px] text-ink-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/AngelP17/Pinzit"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-ink-1 transition-colors hover:text-white"
            >
              <GithubLogo size={14} weight="duotone" /> GitHub
            </a>
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-0 px-3.5 py-1.5 text-[12px] font-medium text-paper-0 transition-transform hover:scale-[1.02]"
            >
              Launch <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero copy band — wide container, 2-line iron rule */}
      <div className="relative z-10 mx-auto mt-16 max-w-6xl md:mt-24">
        {/* Single restrained eyebrow — no stamp/badge spam */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="flex items-center gap-3"
        >
          <span className="block h-px w-10 bg-signal" />
          <span className="eyebrow-signal">Trace-native reliability intelligence</span>
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="display display-mega mt-7 max-w-6xl text-white"
        >
          Trace telemetry.
          <span className="ml-3 inline-block align-baseline">
            <span
              className="inline-img-block align-middle"
              style={{ backgroundImage: 'url(https://picsum.photos/seed/signal-trace/240/120)' }}
              aria-hidden="true"
            />
          </span>
          <br />
          <span className="text-ink-1">Verdict in </span>
          <span className="relative">
            seconds.
            <span className="absolute -bottom-2 left-0 h-[3px] w-full origin-left scale-x-0 bg-signal animate-sweepLine" style={{ animationDelay: '1.05s' }} />
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62 }}
          className="lede mt-9 text-ink-1"
        >
          Pinzit reads OpenTelemetry traces and returns deterministic
          PASS/FAIL verdicts with linked evidence. No backend. No model
          hallucinations. Auditor-grade by default.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.78 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={onLaunch}
            className="hero-cta-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.015]"
          >
            Launch Control Room <ArrowRight size={16} weight="bold" />
          </button>
          <a
            href="#manifest"
            className="hero-cta-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors"
          >
            Read the manifest <ArrowSquareOut size={14} weight="bold" />
          </a>
          <span className="ml-1 hidden items-center gap-2 text-[12px] text-ink-2 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-pass animate-pulseSoft" />
            client-only · no uploads · zero trust
          </span>
        </motion.div>

        {/* Trust ribbon — single inline row, not a card grid */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? {} : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.05 }}
          className="mt-16 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t border-white/10 pt-6"
        >
          <span className="eyebrow">Built for</span>
          <span className="font-mono text-[13px] text-ink-1">SRE</span>
          <span className="font-mono text-[13px] text-ink-1">Platform</span>
          <span className="font-mono text-[13px] text-ink-1">Observability</span>
          <span className="font-mono text-[13px] text-ink-1">Security Engineering</span>
          <span className="font-mono text-[13px] text-ink-1">Reliability Architecture</span>
        </motion.div>
      </div>

      {/* Live preview — offset to the right, scroll-driven parallax */}
      <motion.div
        style={reduce ? undefined : { y: consoleY, opacity: consoleOpacity }}
        className="relative z-10 mx-auto mt-20 max-w-6xl md:mt-28"
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <p className="eyebrow">Live sample run</p>
            <p className="mt-3 text-base text-ink-1">
              A deterministic verdict with constraint metrics, evidence spans,
              and severity — generated locally and wired into the dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-ink-2">
              <span><span className="text-pass">PASS</span> · 3 constraints</span>
              <span>295 spans</span>
              <span>1.03s recovery</span>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ConsolePreview />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
