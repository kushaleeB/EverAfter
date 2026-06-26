import { useMemo, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { cn } from '@/lib/utils';

const categories = [
  'ALL DESIGNS',
  'CLASSIC',
  'MINIMAL',
  'FLORAL',
  'MODERN',
  'ROYAL',
  'DESTINATION',
] as const;

type Category = (typeof categories)[number];

const templates = [
  { id: 1, image: '/img/templates/Card%201.png', name: 'Timeless Serif', category: 'CLASSIC' as const },
  { id: 2, image: '/img/templates/Card%202.png', name: 'Garden Rose', category: 'FLORAL' as const },
  { id: 3, image: '/img/templates/Card%203.png', name: 'Modern Noir', category: 'MODERN' as const },
  { id: 4, image: '/img/templates/Card%204.png', name: 'Royal Crest', category: 'ROYAL' as const },
  { id: 5, image: '/img/templates/Card%205.png', name: 'Coastal Breeze', category: 'DESTINATION' as const },
  { id: 6, image: '/img/templates/Card%206.png', name: 'Pure Minimal', category: 'MINIMAL' as const },
];

const INITIAL_VISIBLE = 3;

export function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL DESIGNS');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchesCategory =
        activeCategory === 'ALL DESIGNS' || t.category === activeCategory;
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <LandingNavbar />

      <main>
        {/* Hero */}
        <section className="px-6 pb-10 pt-14 text-center md:px-16 md:pb-12 md:pt-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-4xl tracking-tight text-[#4e342e] md:text-5xl">
              Curated Elegance
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-[#6d625a] md:text-lg">
              Discover our gallery of meticulously crafted digital invitations. From timeless
              classics to modern minimalism, find the perfect prelude to your love story.
            </p>

            {/* Search */}
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex flex-1 items-center">
                <Search
                  className="pointer-events-none absolute left-4 h-4 w-4 text-[#9e8e82]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                  placeholder="Search themes, styles, or colors..."
                  className="h-12 w-full rounded-[var(--radius-pill)] border border-[#e0d5cc] bg-white pl-11 pr-4 font-body text-sm text-[#3e2723] placeholder:text-[#9e8e82] focus:border-[#4e342e]/40 focus:outline-none focus:ring-2 focus:ring-[#4e342e]/10"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[#e0d5cc] bg-white px-6 font-body text-sm font-medium text-[#4e342e] transition-colors hover:bg-[#f5f0eb]"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                Filters
              </button>
            </div>
          </div>
        </section>

        {/* Category filters */}
        <section className="px-6 pb-8 md:px-16">
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setVisibleCount(INITIAL_VISIBLE);
                }}
                className={cn(
                  'rounded-[var(--radius-pill)] border px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors md:px-5 md:text-xs',
                  activeCategory === cat
                    ? 'border-[#4e342e] bg-[#4e342e] text-white'
                    : 'border-[#d7ccc8] bg-white text-[#4e342e] hover:border-[#a1887f]',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Template grid */}
        <section className="px-6 pb-16 md:px-16 md:pb-20">
          <div className="mx-auto max-w-[1280px]">
            {visible.length === 0 ? (
              <p className="py-16 text-center font-body text-[#6d625a]">
                No templates match your search. Try another theme or category.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {visible.map((template) => (
                  <article
                    key={template.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-[#f0ebe6]">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[#d7ccc8] bg-white px-8 py-3 font-body text-sm font-medium text-[#4e342e] transition-colors hover:bg-[#f5f0eb]"
                >
                  Load More Designs
                  <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
