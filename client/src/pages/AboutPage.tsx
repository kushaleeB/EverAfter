import { Diamond, Eye, Heart } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

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
      </main>

      <LandingFooter />
    </div>
  );
}
