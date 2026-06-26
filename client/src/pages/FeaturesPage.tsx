import { Check, X, Users, MailCheck, Paintbrush, Layers, Sparkles } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const studioFeatures = [
  { icon: Paintbrush, label: 'Curated serif typography palettes' },
  { icon: Layers, label: 'Translucent vellum layering effects' },
  { icon: Sparkles, label: 'Subtle entrance animations' },
];

const platformCapabilities = [
  { feature: 'Custom Domain Name', standard: false, premium: true },
  { feature: 'Advanced Guest Segmentation', standard: false, premium: true },
  { feature: 'RSVP Tracking & Insights', standard: true, premium: true },
  { feature: 'White-Glove Design Service', standard: false, premium: true },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a1887f]">
      {children}
    </p>
  );
}

export function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="bg-[#faf6f3] px-6 pb-16 pt-14 text-center md:px-16 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-4xl leading-tight tracking-tight text-[#8b734b] md:text-5xl lg:text-[3.25rem]">
              Masterpieces of Digital Hospitality
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
              Discover an intuitive suite of tools designed to orchestrate your perfect event with
              quiet luxury and unparalleled precision.
            </p>
          </div>
        </section>

        {/* Planning tools */}
        <section className="px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>The studio</SectionLabel>
              <h2 className="mt-3 font-display text-3xl text-[#3e2723] md:text-4xl">
                Bespoke Invitation Builder
              </h2>
              <p className="mt-5 font-body text-base leading-relaxed text-[#6d625a] md:text-[17px]">
                Craft an ethereal first impression. Our builder brings the tactile beauty of
                letterpress and foil stamping to the digital realm. Fine-tune every typographic
                detail and layout with absolute creative freedom.
              </p>
              <ul className="mt-8 space-y-5">
                {studioFeatures.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-4">
                    <Icon
                      className="h-5 w-5 shrink-0 text-[#c9a87c]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="font-body text-[15px] text-[#3e2723] md:text-base">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <img
                src="/img/features/tab.png"
                alt="Ever After planning dashboard on tablet"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Flawless management */}
        <section className="px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1280px]">
            <h2 className="text-center font-display text-3xl text-[#6d5c43] md:text-4xl">
              Flawless Management
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Intelligent guest lists */}
              <div className="rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a1887f]/20">
                  <Users className="h-5 w-5 text-[#6d5c43]" />
                </div>
                <h3 className="mt-5 font-display text-xl text-[#6d5c43] md:text-2xl">
                  Intelligent Guest Lists
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#6d625a] md:text-[15px]">
                  Organize your attendees with grace. Group by household, manage plus-ones
                  seamlessly, and segment lists for auxiliary events like rehearsal dinners and
                  post-wedding brunches.
                </p>
                <div className="mt-8 divide-y divide-[#e8dfd6] border-t border-[#e8dfd6]">
                  <div className="flex items-center justify-between py-4">
                    <span className="font-body text-sm text-[#3e2723] md:text-[15px]">
                      The Kensington Family
                    </span>
                    <span className="rounded-[var(--radius-pill)] bg-[#f0ebe6] px-3 py-1 font-body text-xs text-[#6d625a]">
                      4 Guests
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="font-body text-sm text-[#3e2723] md:text-[15px]">
                      Eleanor Vance & Guest
                    </span>
                    <span className="rounded-[var(--radius-pill)] bg-[#f0ebe6] px-3 py-1 font-body text-xs text-[#6d625a]">
                      2 Guests
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time RSVP tracking */}
              <div className="rounded-2xl bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a1887f]/20">
                  <MailCheck className="h-5 w-5 text-[#6d5c43]" />
                </div>
                <h3 className="mt-5 font-display text-xl text-[#6d5c43] md:text-2xl">
                  Real-Time RSVP Tracking
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#6d625a] md:text-[15px]">
                  Watch the responses gather effortlessly. Collect dietary restrictions, song
                  requests, and mailing addresses through a beautifully branded, frictionless flow
                  for your guests.
                </p>
                <div className="mt-8 flex items-center justify-around rounded-xl bg-[#f0ebe6] px-6 py-8">
                  <div className="text-center">
                    <p className="font-display text-5xl leading-none text-[#3e2723] md:text-6xl">
                      142
                    </p>
                    <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d625a]">
                      Attending
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-4xl leading-none text-[#3e2723] md:text-5xl">
                      18
                    </p>
                    <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d625a]">
                      Declined
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#a1887f] md:text-[13px]">
                The command center
              </p>
              <h2 className="mt-4 font-display text-3xl italic text-[#6d5c43] md:text-4xl">
                Insights at a Glance
              </h2>
              <p className="mt-5 font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
                Make informed decisions with beautifully visualized data, from catering headcounts
                to accommodation requirements.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-4xl md:mt-14">
              <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <img
                  src="/img/features/analytics_lap.png"
                  alt="Analytics dashboard on laptop"
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 max-w-[min(100%-2rem,340px)] rounded-2xl bg-[#FFF8F5] p-5 shadow-[0_12px_32px_rgba(31,27,24,0.1)] sm:bottom-6 sm:left-6 sm:p-6 md:bottom-8 md:left-8 md:max-w-[380px]">
                  <h3 className="font-display text-xl leading-snug text-[#8b734b] md:text-2xl">
                    Comprehensive Reporting
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-on-surface md:text-[15px]">
                    Export detailed manifests for your planner and vendors with a single click,
                    ensuring every detail is flawlessly executed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform capabilities */}
        <section className="px-6 py-20 md:px-16 md:pb-32">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-display text-4xl tracking-tight text-[#3e2723] md:text-[2.75rem]">
              Platform Capabilities
            </h2>

            <div className="relative mt-14 md:mt-16">
              {/* Premium column highlight — aligned to right column */}
              <div
                className="pointer-events-none absolute bottom-0 right-0 top-0 w-24 rounded-2xl bg-[#e6dfd6]/90 sm:w-28 md:w-32"
                aria-hidden
              />

              {/* Header */}
              <div className="flex items-end border-b border-[#d7ccc8] pb-5">
                <div className="min-w-0 flex-1 pr-4 font-display text-xl text-[#3e2723] md:text-[1.35rem]">
                  Features
                </div>
                <div className="w-24 shrink-0 text-center font-display text-xl text-[#3e2723] sm:w-28 md:w-32 md:text-[1.35rem]">
                  Standard
                </div>
                <div className="relative z-10 w-24 shrink-0 text-center font-display text-xl text-[#3e2723] sm:w-28 md:w-32 md:text-[1.35rem]">
                  Premium
                </div>
              </div>

              {/* Rows */}
              <ul>
                {platformCapabilities.map((row, i) => (
                  <li
                    key={row.feature}
                    className={`flex items-center py-5 md:py-6 ${
                      i < platformCapabilities.length - 1 ? 'border-b border-[#d7ccc8]' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1 pr-4 font-display text-base leading-snug text-[#3e2723] md:text-lg">
                      {row.feature}
                    </span>
                    <div className="flex w-24 shrink-0 justify-center sm:w-28 md:w-32">
                      {row.standard ? (
                        <Check
                          className="h-[1.125rem] w-[1.125rem] text-[#3e2723]"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <X
                          className="h-[1.125rem] w-[1.125rem] text-[#3e2723]"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                    <div className="relative z-10 flex w-24 shrink-0 justify-center sm:w-28 md:w-32">
                      {row.premium ? (
                        <Check
                          className="h-[1.125rem] w-[1.125rem] text-[#3e2723]"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <X
                          className="h-[1.125rem] w-[1.125rem] text-[#3e2723]"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
