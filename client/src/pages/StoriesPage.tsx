import { ArrowRight, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const featuredStory = {
  image: '/img/stories/container_img.png',
  tag: 'Featured Story',
  location: 'Tuscany, Italy',
  names: 'Elena & Matteo',
  quote:
    'We wanted our invitations to feel like a whisper of the Tuscan breeze. EverAfter gave us a digital space that felt as tangible and precious as fine linen paper.',
  stats: [
    { value: '100%', label: 'RSVP Rate' },
    { value: '12', label: 'Hours Saved' },
  ],
};

const moreStories = [
  {
    id: 'nyc',
    image: '/img/stories/story_1.png',
    location: 'New York City',
    names: 'Sarah & James',
    quote:
      'Managing our guest list felt effortless. Every RSVP was tracked beautifully, and our families felt truly welcomed from the very first click.',
    linkLabel: 'Seamless Guest Management',
    imageAspect: 'aspect-[4/5]',
    imagePosition: 'object-cover object-[72%_center]',
  },
  {
    id: 'loire',
    image: '/img/stories/story_2.png',
    location: 'Loire Valley, France',
    names: 'Amélie & Thomas',
    quote:
      'Planning a destination wedding from abroad was daunting — until we found EverAfter. Our guests had everything they needed in one elegant place.',
    linkLabel: 'Destination Planning Tool',
    imageAspect: 'aspect-[4/5]',
    imagePosition: 'object-cover object-center',
  },
  {
    id: 'bigsur',
    image: '/img/stories/story_3.png',
    location: 'Big Sur, California',
    names: 'Chloe & David',
    quote:
      'The templates captured the raw beauty of our coastal ceremony perfectly. It felt bespoke, not templated — exactly what we envisioned.',
    linkLabel: 'Custom Domain & Design',
    imageAspect: 'aspect-[16/10]',
    imagePosition: 'object-cover object-center',
  },
];

export function StoriesPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="px-6 pb-12 pt-14 text-center md:px-16 md:pb-16 md:pt-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#a1887f]">
              Real Love, Beautifully Told
            </p>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-[#4e342e] md:text-5xl lg:text-[3.25rem]">
              Stories of EverAfter
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
              Discover how couples are using our ethereal design system to craft digital wedding
              experiences as memorable as the day itself.
            </p>
          </div>
        </section>

        {/* Featured story */}
        <section className="px-6 pb-16 md:px-16 md:pb-20">
          <article className="mx-auto max-w-[1100px] overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] lg:grid lg:grid-cols-2">
            <div className="aspect-[4/3] lg:aspect-auto">
              <img
                src={featuredStory.image}
                alt={`${featuredStory.names} wedding in ${featuredStory.location}`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a1887f]">
                {featuredStory.tag} &middot; {featuredStory.location}
              </p>
              <h2 className="mt-4 font-display text-3xl text-[#4e342e] md:text-4xl">
                {featuredStory.names}
              </h2>
              <blockquote className="mt-5 font-body text-base leading-relaxed text-[#6d625a] md:text-[17px]">
                &ldquo;{featuredStory.quote}&rdquo;
              </blockquote>

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-[#e8dfd6] pt-8">
                {featuredStory.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl text-[#4e342e] md:text-3xl">{stat.value}</p>
                    <p className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1887f]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to="#"
                className="mt-8 inline-flex items-center gap-1 font-body text-sm font-medium text-[#4e342e] transition-colors hover:text-[#705639]"
              >
                Read their story
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </section>

        {/* More love stories */}
        <section className="px-6 pb-20 md:px-16 md:pb-28">
          <h2 className="mx-auto mb-10 max-w-[1100px] text-center font-display text-2xl text-[#4e342e] md:mb-12 md:text-3xl">
            More Love Stories
          </h2>

          <div className="mx-auto grid max-w-[1100px] gap-8 md:grid-cols-2">
            {moreStories.map((story) => (
              <article
                key={story.id}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
              >
                <div className={cn('overflow-hidden', story.imageAspect)}>
                  <img
                    src={story.image}
                    alt={`${story.names} — ${story.location}`}
                    className={cn(
                      'h-full w-full transition-transform duration-500 hover:scale-[1.02]',
                      story.imagePosition,
                    )}
                  />
                </div>
                <div className="p-6 md:p-8">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a1887f]">
                    {story.location}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-[#4e342e]">{story.names}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-[#6d625a]">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <Link
                    to="#"
                    className="mt-5 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#4e342e] transition-colors hover:text-[#705639]"
                  >
                    {story.linkLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}

            {/* CTA card */}
            <article className="flex flex-col items-center justify-center rounded-2xl border border-[#e8dfd6] bg-[#faf7f2] p-8 text-center md:p-12">
              <Heart className="h-6 w-6 text-[#a1887f]" strokeWidth={1.5} />
              <p className="mt-5 max-w-xs font-body text-base leading-relaxed text-[#6d625a]">
                Ready to write yours? Start crafting your unforgettable digital experience today.
              </p>
              <Button
                className="mt-8 bg-[#4e342e] px-8 text-white hover:bg-[#3e2723]"
                size="lg"
                asChild
              >
                <Link to="/signup">Create Now</Link>
              </Button>
            </article>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
