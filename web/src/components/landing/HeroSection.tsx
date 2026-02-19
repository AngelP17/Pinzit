import { Suspense, lazy, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { ConsolePreview } from './ConsolePreview';
import heroAtmosphere from '../../assets/hero/hero-atmosphere.svg';

const HeroCanvas = lazy(() => import('./HeroCanvas'));
const navLinks = [
  { label: 'Overview', href: '#top' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Security', href: '#security' },
];

export function HeroSection({ onLaunch }: { onLaunch: () => void }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section id="top" ref={sectionRef} className="hero-shell relative isolate min-h-[108vh] overflow-hidden px-6 pb-20 pt-5 md:px-12">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-hero-sky-deep" />
      <motion.div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroAtmosphere})`, y: reduce ? undefined : bgY }}
      />
      <div className="hero-fog-layer pointer-events-none absolute inset-0 -z-10" />
      <div className="hero-grain-layer pointer-events-none absolute inset-0 -z-10" />
      <div className="hero-vignette-layer pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 bg-gradient-to-b from-transparent via-[#081323]/65 to-[#070d18]" />

      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>

      <div className="mx-auto max-w-6xl">
        <motion.nav
          initial={reduce ? false : { opacity: 0, y: -18 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="hero-nav sticky top-5 z-30"
        >
          <div className="glass-panel flex items-center justify-between rounded-xl px-4 py-3">
            <div className="inline-flex items-center gap-2">
              <img src="/LOGO.PNG" alt="Pinzit logo" className="h-8 w-8 rounded-md border border-white/20 object-cover" />
              <div>
                <p className="text-sm font-semibold text-white">Pinzit</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Control Room</p>
              </div>
            </div>
            <div className="hidden items-center gap-5 text-sm text-zinc-200 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/AngelP17/Pinzit"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/25 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:border-white/45 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="inline-flex items-center gap-1">
                  <Github size={12} /> GitHub
                </span>
              </a>
              <button
                onClick={onLaunch}
                className="rounded-md border border-[#00f0ff]/55 bg-[#00f0ff]/14 px-3 py-1.5 text-xs font-semibold text-[#9dedff] transition-colors hover:bg-[#00f0ff]/22 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </motion.nav>

        <motion.div
          style={reduce ? undefined : { scale: contentScale, y: contentY }}
          className="relative z-20 mt-14 md:mt-16"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-zinc-300">
              Sample run preview
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-zinc-300">
              Generated locally
            </span>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.3 }}
            className="inline-flex rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00f0ff]"
          >
            Trace-Native Reliability Intelligence
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.72 }}
            className="hero-headline mt-6 max-w-[11ch] text-white"
          >
            Pinzit turns raw telemetry into auditable, zero-trust verdicts.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.92 }}
            className="hero-body mt-6 max-w-2xl text-zinc-200"
          >
            Upload verdict and stats artifacts. Get instant reliability intelligence with deterministic evidence and no data leaving your machine.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-2 rounded-md border border-white/70 bg-white px-5 py-3 text-sm font-semibold text-[#102a43] shadow-[0_8px_24px_rgba(255,255,255,0.18)] transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Launch Control Room <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              className="rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm text-zinc-100 transition hover:border-white/45 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.34 }}
            className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.15em] text-zinc-300"
          >
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">Client-only</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">Deterministic</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1">No Uploads</span>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 1.48 }}
            className="mt-10 max-w-4xl md:mt-12"
          >
            <ConsolePreview />
          </motion.div>
        </motion.div>

        <div className="mt-10 overflow-hidden border-y border-white/10 py-2 md:mt-14">
          <div className="animate-marquee whitespace-nowrap text-xs uppercase tracking-[0.2em] text-zinc-400">
            PASS · FAIL · SKIPPED · deterministic evidence · client-only analysis · no uploads · zero trust by default ·
          </div>
        </div>
      </div>
    </section>
  );
}
