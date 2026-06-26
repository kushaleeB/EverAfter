import { useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BillingPeriod = 'monthly' | 'yearly';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For intimate gatherings.',
    monthlyPrice: 29,
    features: [
      '1 Premium Template',
      'RSVP Management (Up to 50 guests)',
      'Photo Gallery (100 images)',
      'Standard Support',
    ],
    cta: 'Choose Starter',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'The complete luxury experience.',
    monthlyPrice: 79,
    features: [
      'All Premium Templates',
      'Unlimited RSVP Management',
      'Unlimited Photo & Video Gallery',
      'Custom Domain Name',
      'Priority Support',
    ],
    cta: 'Choose Premium',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'forever',
    name: 'Forever',
    description: 'A timeless archive of your day.',
    monthlyPrice: 199,
    features: [
      'Everything in Premium',
      'Lifetime Hosting',
      'Bespoke Design Consultation',
      'Physical Memory Book',
    ],
    cta: 'Choose Forever',
    highlighted: false,
  },
];

function formatPrice(monthly: number, period: BillingPeriod) {
  const value = period === 'yearly' ? Math.round(monthly * 0.8) : monthly;
  return value;
}

export function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="px-6 pb-12 pt-14 text-center md:px-16 md:pb-16 md:pt-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl tracking-tight text-[#4e342e] md:text-5xl lg:text-[3.25rem]">
              Invest in Your Memories
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
              Choose the perfect tier to document your luxury wedding experience. Every plan
              includes our ethereal design templates and secure, timeless hosting.
            </p>

            {/* Billing toggle */}
            <div className="mx-auto mt-10 inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[#e8dfd6] bg-[#faf7f2] p-1">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={cn(
                  'rounded-[var(--radius-pill)] px-5 py-2 font-body text-sm font-medium transition-colors',
                  billing === 'monthly'
                    ? 'bg-white text-[#4e342e] shadow-sm'
                    : 'text-[#6d625a] hover:text-[#4e342e]',
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={cn(
                  'rounded-[var(--radius-pill)] px-5 py-2 font-body text-sm font-medium transition-colors',
                  billing === 'yearly'
                    ? 'bg-white text-[#4e342e] shadow-sm'
                    : 'text-[#6d625a] hover:text-[#4e342e]',
                )}
              >
                Yearly{' '}
                <span className="text-[#a1887f]">(Save 20%)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-6 pb-20 md:px-16 md:pb-28">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan) => {
              const price = formatPrice(plan.monthlyPrice, billing);
              return (
                <article
                  key={plan.id}
                  className={cn(
                    'relative flex flex-col rounded-2xl bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)]',
                    plan.highlighted && 'border-2 border-[#705639] lg:scale-[1.02] lg:shadow-[0_12px_48px_rgba(0,0,0,0.1)]',
                  )}
                >
                  {plan.badge && (
                    <span className="absolute -top-px right-6 rounded-b-lg bg-[#a1887f] px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white">
                      {plan.badge}
                    </span>
                  )}

                  <h2 className="font-display text-2xl text-[#4e342e]">{plan.name}</h2>
                  <p className="mt-2 font-body text-sm text-[#6d625a]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-5xl text-[#705639]">${price}</span>
                    <span className="font-body text-sm text-[#6d625a]">/mo</span>
                  </div>
                  {billing === 'yearly' && (
                    <p className="mt-1 font-body text-xs text-[#a1887f]">Billed annually</p>
                  )}

                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#705639]"
                          strokeWidth={2}
                        />
                        <span className="font-body text-sm text-[#4e342e]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.highlighted ? (
                    <Button
                      className="mt-8 w-full bg-[#705639] text-white hover:bg-[#4e342e]"
                      size="lg"
                      asChild
                    >
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="glass"
                      className="mt-8 w-full border-[#705639] text-[#705639] hover:bg-[#faf7f2]"
                      size="lg"
                      asChild
                    >
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
