import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Images } from 'lucide-react';
import type { InvitationSection } from '@/types/api';
import { GalleryLightbox } from '@/components/invitations/GalleryLightbox';
import {
  galleryAnimationClass,
  galleryHoverClass,
  galleryWidthToCss,
  getAlbumName,
  getAllDisplayImages,
  getFeaturedImages,
  getGridDisplayImages,
  parseGalleryDetails,
  shadowFromStyle,
  type GalleryDetailsContent,
  type GalleryImage,
} from '@/lib/gallerySection';
import { cn } from '@/lib/utils';

interface GallerySectionPreviewProps {
  section: InvitationSection;
}

const PREVIEW_BATCH = 12;

function ProgressiveImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      style={style}
      className={cn(
        'transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}

function GalleryImageTile({
  image,
  gallery,
  onOpen,
  className,
  aspectClass,
  showCaption,
}: {
  image: GalleryImage;
  gallery: GalleryDetailsContent;
  onOpen: () => void;
  className?: string;
  aspectClass?: string;
  showCaption?: boolean;
}) {
  const captionVisible = showCaption ?? gallery.captionPosition !== 'hidden';
  const isOverlay = gallery.captionPosition === 'overlay';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative block w-full overflow-hidden text-left',
        galleryHoverClass(gallery.hoverAnimation),
        className,
      )}
      style={{
        borderRadius: gallery.imageBorderRadius,
        boxShadow: shadowFromStyle(gallery.shadowStyle),
      }}
    >
      <ProgressiveImage
        src={image.url}
        alt={image.alt || image.caption || 'Gallery photo'}
        className={cn('w-full object-cover', aspectClass ?? 'aspect-square')}
      />
      {image.isFeatured && (
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
          style={{ backgroundColor: `${gallery.accentColor}cc` }}
        >
          Featured
        </span>
      )}
      {captionVisible && image.caption && (
        <p
          className={cn(
            'font-body leading-snug',
            isOverlay
              ? 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-3 text-white'
              : 'mt-2 px-1 opacity-85',
          )}
          style={{
            fontSize: `${gallery.captionFontSize}px`,
            color: isOverlay ? '#fff' : gallery.textColor,
          }}
        >
          {image.caption}
        </p>
      )}
    </button>
  );
}

function FeaturedHeroCarousel({
  images,
  gallery,
  onOpen,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const slideshow = gallery.slideshow;

  useEffect(() => {
    if (!slideshow.enabled || images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((value) => {
        const next = value + 1;
        if (next >= images.length) return slideshow.loop ? 0 : value;
        return next;
      });
    }, Math.max(slideshow.slideDuration, 2) * 1000);
    return () => window.clearInterval(timer);
  }, [slideshow.enabled, slideshow.slideDuration, slideshow.loop, images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className="mb-6 overflow-hidden"
      style={{ borderRadius: gallery.imageBorderRadius }}
      onMouseEnter={() => {
        if (slideshow.pauseOnHover) setActive((v) => v);
      }}
    >
      <GalleryImageTile
        image={images[active]}
        gallery={gallery}
        onOpen={() => onOpen(active)}
        aspectClass="aspect-[16/10]"
        showCaption
      />
      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === active ? 'w-5' : 'w-1.5 bg-[#e8dfd6]',
              )}
              style={index === active ? { backgroundColor: gallery.accentColor } : undefined}
              aria-label={`Featured slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedGrid({
  images,
  gallery,
  onOpen,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div
      className="mb-6 grid grid-cols-3 gap-2"
      style={{ gap: gallery.imageSpacing }}
    >
      {images.slice(0, 3).map((image, index) => (
        <GalleryImageTile
          key={image.id}
          image={image}
          gallery={gallery}
          onOpen={() => onOpen(index)}
          aspectClass={index === 0 ? 'aspect-[4/5]' : 'aspect-square'}
          className={index === 0 ? 'col-span-2 row-span-2' : ''}
          showCaption
        />
      ))}
    </div>
  );
}

function HighlightSection({
  images,
  gallery,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
}) {
  if (images.length === 0) return null;

  return (
    <div
      className="mb-6 rounded-2xl border px-4 py-3 backdrop-blur-sm"
      style={{
        borderColor: `${gallery.accentColor}40`,
        backgroundColor: `${gallery.accentColor}12`,
      }}
    >
      <p
        className="font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: gallery.accentColor }}
      >
        Highlights
      </p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {images.slice(0, 6).map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt={image.alt || ''}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
            style={{ boxShadow: shadowFromStyle(gallery.shadowStyle) }}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselLayout({
  images,
  gallery,
  onOpen,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideshow = gallery.slideshow;

  useEffect(() => {
    if (!slideshow.enabled || images.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActive((value) => {
        const next = value + 1;
        if (next >= images.length) return slideshow.loop ? 0 : value;
        return next;
      });
    }, Math.max(slideshow.slideDuration, 2) * 1000);
    return () => window.clearInterval(timer);
  }, [slideshow.enabled, slideshow.slideDuration, slideshow.loop, images.length, paused]);

  if (images.length === 0) return null;
  const image = images[active];

  return (
    <div
      className="mt-6"
      onMouseEnter={() => slideshow.pauseOnHover && setPaused(true)}
      onMouseLeave={() => slideshow.pauseOnHover && setPaused(false)}
    >
      <div
        className="overflow-hidden transition-opacity"
        style={{
          transitionDuration: `${slideshow.transitionSpeed}ms`,
          borderRadius: gallery.imageBorderRadius,
        }}
      >
        <GalleryImageTile image={image} gallery={gallery} onOpen={() => onOpen(active)} aspectClass="aspect-[4/3]" />
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {images.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              index === active ? 'w-5' : 'w-1.5 bg-[#e8dfd6]',
            )}
            style={index === active ? { backgroundColor: gallery.accentColor } : undefined}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function GridLayout({
  images,
  gallery,
  onOpen,
  masonry = false,
  startIndex = 0,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
  masonry?: boolean;
  startIndex?: number;
}) {
  const columns = Math.min(Math.max(gallery.columns, 1), 4);

  if (masonry) {
    return (
      <div
        className="mt-6"
        style={{ columnCount: columns, columnGap: gallery.imageSpacing }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="break-inside-avoid"
            style={{ marginBottom: gallery.imageSpacing }}
          >
            <GalleryImageTile
              image={image}
              gallery={gallery}
              onOpen={() => onOpen(startIndex + index)}
              aspectClass={index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="mt-6 grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: gallery.imageSpacing,
      }}
    >
      {images.map((image, index) => (
        <GalleryImageTile
          key={image.id}
          image={image}
          gallery={gallery}
          onOpen={() => onOpen(startIndex + index)}
        />
      ))}
    </div>
  );
}

function HorizontalSlider({
  images,
  gallery,
  onOpen,
  startIndex = 0,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
  startIndex?: number;
}) {
  return (
    <div className="mt-6 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2 snap-x snap-mandatory">
      {images.map((image, index) => (
        <div key={image.id} className="w-[180px] shrink-0 snap-center">
          <GalleryImageTile
            image={image}
            gallery={gallery}
            onOpen={() => onOpen(startIndex + index)}
            aspectClass="aspect-[4/5]"
          />
        </div>
      ))}
    </div>
  );
}

function PolaroidLayout({
  images,
  gallery,
  onOpen,
  startIndex = 0,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
  startIndex?: number;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => onOpen(startIndex + index)}
          className={cn(
            'bg-white p-2 pb-6 text-left shadow-md transition-transform',
            galleryHoverClass(gallery.hoverAnimation),
            index % 2 === 1 && 'rotate-1',
            index % 2 === 0 && '-rotate-1',
          )}
          style={{ borderRadius: gallery.imageBorderRadius }}
        >
          <ProgressiveImage
            src={image.url}
            alt={image.alt || ''}
            className="aspect-square w-full object-cover"
          />
          {image.caption && gallery.captionPosition !== 'hidden' && (
            <p
              className="mt-3 text-center font-body italic"
              style={{ fontSize: `${gallery.captionFontSize}px`, color: gallery.textColor }}
            >
              {image.caption}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

function ElegantCardsLayout({
  images,
  gallery,
  onOpen,
  startIndex = 0,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
  startIndex?: number;
}) {
  return (
    <div className="mt-6 space-y-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => onOpen(startIndex + index)}
          className={cn(
            'flex w-full gap-3 overflow-hidden border border-[#e8dfd6]/60 bg-white/80 p-3 text-left backdrop-blur-sm transition-transform',
            galleryHoverClass(gallery.hoverAnimation),
          )}
          style={{
            borderRadius: gallery.imageBorderRadius,
            boxShadow: shadowFromStyle(gallery.shadowStyle),
          }}
        >
          <ProgressiveImage
            src={image.url}
            alt={image.alt || ''}
            className="h-24 w-24 shrink-0 object-cover"
            style={{ borderRadius: Math.max(gallery.imageBorderRadius - 4, 0) }}
          />
          <div className="min-w-0 flex-1 py-1">
            {image.caption && (
              <p
                className="font-display leading-snug"
                style={{ fontSize: `${gallery.captionFontSize + 2}px`, color: gallery.textColor }}
              >
                {image.caption}
              </p>
            )}
            {image.alt && (
              <p className="mt-1 font-body text-xs opacity-60" style={{ color: gallery.textColor }}>
                {image.alt}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function MagazineLayout({
  images,
  gallery,
  onOpen,
  startIndex = 0,
}: {
  images: GalleryImage[];
  gallery: GalleryDetailsContent;
  onOpen: (index: number) => void;
  startIndex?: number;
}) {
  return (
    <div className="mt-6 space-y-3">
      {images.map((image, index) => {
        const isHero = index % 5 === 0;
        return (
          <button
            key={image.id}
            type="button"
            onClick={() => onOpen(startIndex + index)}
            className={cn(
              'block w-full overflow-hidden text-left',
              galleryHoverClass(gallery.hoverAnimation),
              isHero ? '' : index % 2 === 0 ? 'pr-8' : 'pl-8',
            )}
            style={{
              borderRadius: gallery.imageBorderRadius,
              boxShadow: shadowFromStyle(gallery.shadowStyle),
            }}
          >
            <ProgressiveImage
              src={image.url}
              alt={image.alt || ''}
              className={cn('w-full object-cover', isHero ? 'aspect-[16/9]' : 'aspect-[4/3]')}
            />
            {image.caption && gallery.captionPosition !== 'hidden' && (
              <p
                className="px-2 py-2 font-display italic"
                style={{ fontSize: `${gallery.captionFontSize}px`, color: gallery.textColor }}
              >
                {image.caption}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function GalleryEmptyState({ gallery }: { gallery: GalleryDetailsContent }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-[#e8dfd6] bg-white/40 px-6 py-10 backdrop-blur-sm">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${gallery.accentColor}20` }}
      >
        <Images className="h-7 w-7" style={{ color: gallery.accentColor }} />
      </div>
      <p
        className="mt-4 font-display text-base"
        style={{ color: gallery.textColor }}
      >
        Your gallery awaits
      </p>
      <p
        className="mt-2 max-w-[220px] text-center font-body text-xs leading-relaxed opacity-60"
        style={{ color: gallery.textColor }}
      >
        Upload photos to bring your love story to life.
      </p>
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className={cn('gallery-skeleton rounded-xl', item === 0 && 'col-span-2 aspect-[16/9]')} />
      ))}
    </div>
  );
}

export function GallerySectionPreview({ section }: GallerySectionPreviewProps) {
  const gallery = parseGalleryDetails(section);
  const allImages = getAllDisplayImages(gallery);
  const featured = getFeaturedImages(gallery);
  const gridImages = getGridDisplayImages(gallery);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PREVIEW_BATCH);
  const [isLoading, setIsLoading] = useState(gridImages.length > 0 && gridImages.length > PREVIEW_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const animClass = galleryAnimationClass(gallery.animation);

  const visibleImages = gridImages.slice(0, visibleCount);
  const albumName = gallery.selectedAlbumId
    ? getAlbumName(gallery, gallery.selectedAlbumId)
    : undefined;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PREVIEW_BATCH, gridImages.length));
    setIsLoading(false);
  }, [gridImages.length]);

  useEffect(() => {
    setVisibleCount(PREVIEW_BATCH);
    setIsLoading(gridImages.length > PREVIEW_BATCH);
  }, [gridImages.length, gallery.selectedAlbumId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= gridImages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, visibleCount, gridImages.length]);

  function openLightbox(image: GalleryImage) {
    const index = allImages.findIndex((item) => item.id === image.id);
    setLightboxIndex(index >= 0 ? index : 0);
  }

  function renderLayout(images: GalleryImage[]) {
    const openAt = (index: number) => {
      const image = images[index];
      if (image) openLightbox(image);
    };

    switch (gallery.layout) {
      case 'carousel':
        return <CarouselLayout images={images} gallery={gallery} onOpen={openAt} />;
      case 'horizontal-slider':
        return (
          <HorizontalSlider images={images} gallery={gallery} onOpen={openAt} />
        );
      case 'classic-grid':
      case 'full-width':
        return (
          <GridLayout
            images={images}
            gallery={{
              ...gallery,
              columns: gallery.layout === 'full-width' ? 1 : gallery.columns,
            }}
            onOpen={openAt}
          />
        );
      case 'masonry-grid':
      case 'pinterest':
        return (
          <GridLayout
            images={images}
            gallery={gallery}
            onOpen={openAt}
            masonry
          />
        );
      case 'polaroid':
        return (
          <PolaroidLayout images={images} gallery={gallery} onOpen={openAt} />
        );
      case 'elegant-cards':
        return (
          <ElegantCardsLayout images={images} gallery={gallery} onOpen={openAt} />
        );
      case 'magazine-layout':
        return (
          <MagazineLayout images={images} gallery={gallery} onOpen={openAt} />
        );
      default:
        return (
          <GridLayout images={images} gallery={gallery} onOpen={openAt} masonry />
        );
    }
  }

  return (
    <>
      <section
        className={cn('relative overflow-hidden text-center', animClass)}
        style={{
          backgroundColor: gallery.backgroundColor,
          borderRadius: gallery.borderRadius,
          padding: gallery.sectionPadding,
        }}
      >
        {gallery.backgroundImageUrl && (
          <img
            src={gallery.backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {gallery.backgroundImageUrl && gallery.overlayOpacity > 0 && (
          <div className="absolute inset-0 bg-black" style={{ opacity: gallery.overlayOpacity }} />
        )}

        <div className="relative z-10 mx-auto" style={{ width: galleryWidthToCss(gallery.galleryWidth) }}>
          <p
            className="font-display leading-tight"
            style={{
              fontFamily: gallery.fontFamily,
              fontSize: `${gallery.headingFontSize}px`,
              color: gallery.textColor,
            }}
          >
            {gallery.sectionTitle}
          </p>

          {gallery.subtitle && (
            <p
              className="mt-2 font-body text-sm tracking-wide opacity-80"
              style={{ color: gallery.accentColor }}
            >
              {gallery.subtitle}
            </p>
          )}

          {gallery.description && (
            <p
              className="mx-auto mt-3 max-w-[280px] font-body text-xs leading-relaxed opacity-75"
              style={{ color: gallery.textColor }}
            >
              {gallery.description}
            </p>
          )}

          {gallery.introMessage && (
            <p
              className="mx-auto mt-4 max-w-[260px] font-display text-sm italic leading-relaxed opacity-85"
              style={{ color: gallery.textColor }}
            >
              &ldquo;{gallery.introMessage}&rdquo;
            </p>
          )}

          {allImages.length === 0 ? (
            <GalleryEmptyState gallery={gallery} />
          ) : (
            <>
              {gallery.featuredDisplayMode === 'hero-carousel' && (
                <FeaturedHeroCarousel
                  images={featured}
                  gallery={gallery}
                  onOpen={(index) => openLightbox(featured[index])}
                />
              )}
              {gallery.featuredDisplayMode === 'featured-grid' && (
                <FeaturedGrid
                  images={featured}
                  gallery={gallery}
                  onOpen={(index) => openLightbox(featured[index])}
                />
              )}
              {gallery.featuredDisplayMode === 'highlight-section' && (
                <HighlightSection images={featured} gallery={gallery} />
              )}

              {isLoading && visibleImages.length === 0 ? (
                <GallerySkeleton />
              ) : (
                visibleImages.length > 0 && renderLayout(visibleImages)
              )}

              {visibleCount < gridImages.length && (
                <div ref={sentinelRef} className="mt-4 flex justify-center">
                  <div className="gallery-skeleton h-8 w-24 rounded-full" />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          albumName={albumName}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
