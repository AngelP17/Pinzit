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
    <div className="landing-root text-zinc-100">
      <HeroSection onLaunch={onLaunch} />
      <div className="landing-content">
        <HowItWorksSection />
        <ShowcaseSection onLaunch={onLaunch} />
        <SealedSection />
        <WhyPinzitSection />
        <FeaturesGrid />
        <ZeroTrustSection />
        <FinalCTA onLaunch={onLaunch} />
      </div>
    </div>
  );
}
