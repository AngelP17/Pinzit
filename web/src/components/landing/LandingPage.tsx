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
    <div className="bg-[#050505] text-zinc-100">
      <HeroSection onLaunch={onLaunch} />
      <HowItWorksSection />
      <WhyPinzitSection />
      <ShowcaseSection onLaunch={onLaunch} />
      <SealedSection />
      <FeaturesGrid />
      <ZeroTrustSection />
      <FinalCTA onLaunch={onLaunch} />
    </div>
  );
}
