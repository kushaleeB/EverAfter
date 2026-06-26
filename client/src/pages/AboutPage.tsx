import { motion } from 'framer-motion';
import { Diamond, Eye, Heart } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const pillars = [
  {
    icon: Diamond,
    title: 'Quiet Luxury',
    description:
      'Understated elegance over ostentation. We design for couples who value refinement, restraint, and the power of subtle beauty.',
  },
  {
    icon: Eye,
    title: 'Timeless Elegance',
    description:
      'Trends fade; love endures. Every template and interaction is crafted to feel as relevant in decades as it does on your wedding day.',
  },
  {
    icon: Heart,
    title: 'Exquisite Quality',
    description:
      'From typography to hosting infrastructure, we obsess over every detail so your digital experience feels as precious as fine stationery.',
  },
];

const journey = [
  {
    year: '2020',
    title: 'The Seed',
    description:
      'EverAfter began as a personal project — born from the frustration of finding wedding tools that felt anything but beautiful.',
    align: 'left' as const,
  },
  {
    year: '2021',
    title: 'The Start',
    description:
      'Our first collection of ethereal templates launched to a small community of design-conscious couples who shared our vision.',
    align: 'right' as const,
  },
  {
    year: '2022',
    title: 'The Platform',
    description:
      'We evolved into a full platform — RSVP management, guest insights, and bespoke domains — without ever compromising on aesthetics.',
    align: 'left' as const,
  },
];

const artisans = [
  {
    name: 'Emma Stone',
    role: 'Founder & Creative Director',
    image: '/img/about/person_1.png',
  },
  {
    name: 'Julian Ross',
    role: 'Lead Designer',
    image: '/img/about/person_2.png',
  },
  {
    name: 'Clara Lin',
    role: 'Product Designer',
    image: '/img/about/person_3.png',
  },
  {
    name: 'Marcus Thorne',
    role: 'Client Experience',
    image: '/img/about/person_4.png',
    compact: true,
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="px-6 pb-12 pt-14 text-center md:px-16 md:pb-16 md:pt-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl leading-snug text-[#4e342e] md:text-4xl lg:text-5xl lg:leading-tight">
              Preserving the ephemeral beauty of your most cherished moments.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
              EverAfter exists at the intersection of artistry and technology — a digital sanctuary
              where your wedding story is told with the grace it deserves.
            </p>
          </div>
        </section>

        {/* Vision & Mission — light */}
        <section className="px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-2xl text-[#4e342e] md:text-3xl">Our Vision</h2>
              <p className="mt-4 font-body text-base leading-relaxed text-[#6d625a] md:text-[17px]">
                We believe every love story deserves a canvas as unique as the bond itself. Our
                vision is a world where digital wedding experiences rival the tactile beauty of the
                finest printed invitations — without sacrificing convenience or connection.
              </p>

              <h2 className="mt-10 font-display text-2xl text-[#4e342e] md:text-3xl">
                Our Mission
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-[#6d625a] md:text-[17px]">
                To empower couples with tools that blend artistry and ease, so they can focus on
                what matters most: celebrating love surrounded by the people who matter most to
                them.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
              <img
                src="/img/about/vision.png"
                alt="Flowing silk fabric in golden-beige tones"
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Pillars */}
        <section className="bg-white px-6 py-16 md:px-16 md:py-24">
          <h2 className="text-center font-display text-3xl text-[#4e342e] md:text-4xl">
            Our Pillars
          </h2>

          <div className="mx-auto mt-14 grid max-w-[1000px] gap-12 md:grid-cols-3 md:gap-8">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#e8dfd6] bg-[#faf7f2]">
                  <Icon className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-display text-xl text-[#4e342e]">{title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-[#6d625a]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Journey — light */}
        <section className="px-6 py-16 md:px-16 md:py-24">
          <h2 className="text-center font-display text-3xl text-[#4e342e] md:text-4xl">
            Our Journey
          </h2>

          <div className="relative mx-auto mt-14 max-w-[700px]">
            <div
              className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#e8dfd6] md:block"
              aria-hidden
            />

            <div className="space-y-12 md:space-y-16">
              {journey.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'relative grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8',
                    item.align === 'right' &&
                      'md:[&>div:first-child]:order-3 md:[&>div:last-child]:order-1',
                  )}
                >
                  <div
                    className={cn(
                      'md:text-right',
                      item.align === 'right' ? 'md:order-3 md:text-left' : 'md:text-right',
                    )}
                  >
                    <h3 className="font-display text-xl text-[#4e342e]">{item.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#705639] bg-white md:order-2">
                    <span className="font-display text-lg text-[#4e342e]">{item.year}</span>
                  </div>

                  <div className="hidden md:block" aria-hidden />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Artisans */}
        <section className="bg-[#faf7f2] px-6 py-16 md:px-16 md:py-24">
          <div className="mx-auto max-w-[1100px] text-center">
            <h2 className="font-display text-3xl text-[#4e342e] md:text-4xl">The Artisans</h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-sm text-[#6d625a] md:text-base">
              The passionate team behind every pixel, every interaction, and every unforgettable
              experience.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-[1100px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {artisans.map((person, index) => (
              <motion.article
                key={person.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={cn(
                  'text-center',
                  person.compact && 'flex flex-col items-center justify-center',
                )}
              >
                <div
                  className={cn(
                    'mx-auto overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]',
                    person.compact
                      ? 'h-24 w-24 rounded-full border-2 border-[#e8dfd6]'
                      : 'aspect-[3/4] w-full max-w-[220px] rounded-2xl',
                  )}
                >
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-5 font-display text-lg text-[#4e342e]">{person.name}</h3>
                <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a1887f]">
                  {person.role}
                </p>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
