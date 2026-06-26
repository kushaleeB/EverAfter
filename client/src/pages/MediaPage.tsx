import { useState } from 'react';
import { Heart, SlidersHorizontal, Upload } from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'all', label: 'All Photos' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'wedding-day', label: 'Wedding Day' },
  { id: 'favorites', label: 'Favorites', icon: Heart },
] as const;

type TabId = (typeof tabs)[number]['id'];

const photos = [
  {
    id: '1',
    src: '/img/media/img_1.png',
    alt: 'Couple silhouetted in a sunlit hallway',
    category: 'engagement' as const,
    favorite: false,
  },
  {
    id: '2',
    src: '/img/media/img_2.png',
    alt: 'Engagement ring on pink silk ribbon',
    category: 'engagement' as const,
    favorite: true,
  },
  {
    id: '3',
    src: '/img/media/img_3.png',
    alt: 'Couple laughing in formal wear',
    category: 'wedding-day' as const,
    favorite: true,
  },
];

export function MediaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filtered = photos.filter((photo) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'favorites') return photo.favorite;
    return photo.category === activeTab;
  });

  return (
    <DashboardLayout headerVariant="search">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#705639] md:text-4xl">Media Gallery</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Curate your perfect moments. Organize, view, and select the finest images for your
            wedding narrative.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            className="h-10 rounded-lg border border-[#e8dfd6] bg-white px-4 font-body text-sm font-medium text-[#4e342e] hover:bg-[#faf7f2]"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filter
          </Button>
          <Button className="h-10 rounded-lg bg-[#705639] px-5 font-body text-sm font-medium text-white hover:bg-[#4e342e]">
            <Upload className="h-4 w-4" strokeWidth={1.5} />
            Upload Photos
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-sm transition-colors',
              activeTab === id
                ? 'border-[#e8d8c3] bg-[#e8d8c3] font-medium text-[#4e342e]'
                : 'border-[#e8dfd6] bg-white text-[#6d625a] hover:border-[#e8d8c3] hover:bg-[#faf7f2]',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
            {label}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="group relative overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a67c]"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {photo.favorite && (
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <Heart className="h-4 w-4 fill-[#c5a67c] text-[#c5a67c]" strokeWidth={1.5} />
              </span>
            )}
          </button>
        ))}
      </section>
    </DashboardLayout>
  );
}
