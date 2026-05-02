import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { FeaturesGrid } from './FeaturesGrid';
import { FinalCTA } from './FinalCTA';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SealedSection } from './SealedSection';
import { ShowcaseSection } from './ShowcaseSection';
import { WhyPinzitSection } from './WhyPinzitSection';
import { ZeroTrustSection } from './ZeroTrustSection';

export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  useSmoothScroll();

  return (
    <main className="landing-root w-full overflow-x-hidden text-ink-0">
      {/* Attention */}
      <HeroSection onLaunch={onLaunch} />

      {/* Light divider — trusted-by marquee */}
      <ZeroTrustSection />

      {/* Interest 1 — manifest */}
      <HowItWorksSection />

      {/* Interest 2 — bento manifest, the visual centerpiece */}
      <FeaturesGrid />

      {/* Desire — pinned evidence scroll */}
      <ShowcaseSection onLaunch={onLaunch} />

      {/* Editorial pause — operating premise */}
      <SealedSection />

      {/* Tenets — security/operating */}
      <WhyPinzitSection />

      {/* Action */}
      <FinalCTA onLaunch={onLaunch} />
    </main>
  );
}
