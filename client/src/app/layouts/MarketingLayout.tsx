import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingShowcase } from '@/components/landing/LandingShowcase';
import { LandingFooter } from '@/components/landing/LandingFooter';

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <LandingNavbar />
      <LandingHero />
      <main>
        <LandingShowcase />
      </main>
      <LandingFooter />
    </div>
  );
}
