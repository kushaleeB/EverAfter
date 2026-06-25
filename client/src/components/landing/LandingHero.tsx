import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LandingTrustBar } from '@/components/landing/LandingTrustBar';

export function LandingHero() {
  return (
    <section id="top" className="relative flex min-h-[85vh] flex-col overflow-hidden md:min-h-[90vh]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/img/hero_img.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/45 to-[#fcf8f5]/90"
          aria-hidden
        />
      </div>

      {/* Hero content — vertically centered */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex max-w-3xl flex-col items-center text-center"
        >
          <span className="rounded-[var(--radius-pill)] bg-[#f5f5f0] px-5 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface md:text-[11px]">
            The new standard in wedding elegance
          </span>

          <h1 className="mt-8 font-display text-[2.75rem] leading-[1.08] tracking-tight text-[#8b734b] md:text-[3.75rem] lg:text-[4.25rem]">
            Your Forever Story
            <br />
            Begins Here.
          </h1>

          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
            Create elegant digital wedding invitations, beautifully manage your guests, and
            celebrate every moment effortlessly with a touch of modern luxury.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#8b734b] px-8 text-[#f5f5f0] hover:bg-[#745a34]"
              asChild
            >
              <Link to="/register">
                Create Your Invitation
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>

            <Link
              to="/features"
              className="inline-flex items-center gap-2.5 font-body text-sm font-medium text-[#8b734b] transition-opacity hover:opacity-80"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8b734b]/60">
                <Play className="h-3.5 w-3.5 fill-[#8b734b] text-[#8b734b]" strokeWidth={0} />
              </span>
              Watch Demo
            </Link>
          </div>
        </motion.div>
      </div>

      <LandingTrustBar />
    </section>
  );
}
