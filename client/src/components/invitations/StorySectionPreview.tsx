import type { InvitationSection } from '@/types/api';
import {
  formatStoryDate,
  parseStoryDetails,
  storyAnimationClass,
  storyTextAlignClass,
  type StoryDetailsContent,
  type StoryGalleryImage,
  type StoryTimelineEvent,
} from '@/lib/storySection';
import { cn } from '@/lib/utils';

interface StorySectionPreviewProps {
  section: InvitationSection;
}

function stripHtmlSafe(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function StoryBody({ html, fontSize, color }: { html: string; fontSize: number; color: string }) {
  if (!stripHtmlSafe(html)) {
    return (
      <p className="font-body italic opacity-60" style={{ fontSize: `${fontSize}px`, color }}>
        Your story will appear here.
      </p>
    );
  }

  return (
    <div
      className="story-rich-text font-body leading-relaxed opacity-90 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4"
      style={{ fontSize: `${fontSize}px`, color }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function TimelineVertical({
  events,
  story,
}: {
  events: StoryTimelineEvent[];
  story: StoryDetailsContent;
}) {
  if (events.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4 pl-4">
          <div className="absolute bottom-0 left-[5px] top-0 w-px bg-[#e8dfd6]" />
          <div className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c5a67c]" />
          <div className="min-w-0 flex-1 pb-2">
            {event.date && (
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c5a67c]">
                {formatStoryDate(event.date)}
              </p>
            )}
            <p
              className="mt-1 font-display leading-snug"
              style={{ fontSize: `${story.titleFontSize - 8}px`, color: story.textColor }}
            >
              {event.title || `Milestone ${index + 1}`}
            </p>
            {event.location && (
              <p className="mt-1 font-body text-xs opacity-70" style={{ color: story.textColor }}>
                {event.location}
              </p>
            )}
            {event.description && (
              <p
                className="mt-2 font-body leading-relaxed opacity-85"
                style={{ fontSize: `${story.bodyFontSize}px`, color: story.textColor }}
              >
                {event.description}
              </p>
            )}
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt=""
                className="mt-3 w-full rounded-xl object-cover shadow-sm"
                style={{ maxHeight: 140 }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineHorizontal({
  events,
  story,
}: {
  events: StoryTimelineEvent[];
  story: StoryDetailsContent;
}) {
  if (events.length === 0) return null;

  return (
    <div className="mt-8 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
      {events.map((event, index) => (
        <div
          key={event.id}
          className="w-[200px] shrink-0 rounded-xl border border-[#e8dfd6] bg-white/80 p-4 shadow-sm backdrop-blur-sm"
        >
          {event.imageUrl && (
            <img src={event.imageUrl} alt="" className="mb-3 h-24 w-full rounded-lg object-cover" />
          )}
          {event.date && (
            <p className="font-body text-[9px] font-semibold uppercase tracking-[0.12em] text-[#c5a67c]">
              {formatStoryDate(event.date)}
            </p>
          )}
          <p
            className="mt-1 font-display leading-snug"
            style={{ fontSize: `${story.titleFontSize - 10}px`, color: story.textColor }}
          >
            {event.title || `Milestone ${index + 1}`}
          </p>
          {event.description && (
            <p
              className="mt-2 line-clamp-4 font-body leading-relaxed opacity-80"
              style={{ fontSize: `${story.bodyFontSize - 1}px`, color: story.textColor }}
            >
              {event.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function StoryCards({
  events,
  story,
}: {
  events: StoryTimelineEvent[];
  story: StoryDetailsContent;
}) {
  if (events.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {events.map((event, index) => (
        <article
          key={event.id}
          className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-[0_8px_24px_rgba(78,52,46,0.06)]"
        >
          {event.imageUrl && <img src={event.imageUrl} alt="" className="h-36 w-full object-cover" />}
          <div className="p-4">
            {event.date && (
              <p className="font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-[#c5a67c]">
                {formatStoryDate(event.date)}
              </p>
            )}
            <p
              className="mt-1 font-display"
              style={{ fontSize: `${story.titleFontSize - 8}px`, color: story.textColor }}
            >
              {event.title || `Chapter ${index + 1}`}
            </p>
            {event.location && (
              <p className="mt-1 font-body text-xs opacity-70" style={{ color: story.textColor }}>
                {event.location}
              </p>
            )}
            {event.description && (
              <p
                className="mt-2 font-body leading-relaxed opacity-85"
                style={{ fontSize: `${story.bodyFontSize}px`, color: story.textColor }}
              >
                {event.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function MasonryGallery({ gallery }: { gallery: StoryGalleryImage[] }) {
  if (gallery.length === 0) return null;

  return (
    <div className="mt-8 columns-2 gap-3 space-y-3">
      {gallery.map((image, index) => (
        <img
          key={image.id}
          src={image.url}
          alt={image.alt || ''}
          className={cn(
            'w-full break-inside-avoid rounded-xl object-cover shadow-sm',
            index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square',
          )}
        />
      ))}
    </div>
  );
}

export function StorySectionPreview({ section }: StorySectionPreviewProps) {
  const story = parseStoryDetails(section);
  const alignClass = storyTextAlignClass(story.textAlign);
  const animClass = storyAnimationClass(story.animation);

  return (
    <section
      className={cn('relative overflow-hidden', animClass)}
      style={{
        backgroundColor: story.backgroundColor,
        borderRadius: story.borderRadius,
        padding: story.sectionPadding,
      }}
    >
      {story.backgroundImageUrl && (
        <img
          src={story.backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {story.backgroundImageUrl && story.overlayOpacity > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: story.overlayOpacity }} />
      )}

      <div className={cn('relative z-10 flex flex-col', alignClass)}>
        <p
          className="font-display leading-tight"
          style={{
            fontFamily: story.fontFamily,
            fontSize: `${story.titleFontSize}px`,
            color: story.textColor,
          }}
        >
          {story.title}
        </p>

        {story.subtitle.trim() && (
          <p
            className="mt-2 font-body font-semibold uppercase tracking-[0.16em] opacity-80"
            style={{ fontSize: `${story.bodyFontSize}px`, color: story.textColor }}
          >
            {story.subtitle}
          </p>
        )}

        <div className="mt-5 w-full">
          <StoryBody html={story.body} fontSize={story.bodyFontSize} color={story.textColor} />
        </div>

        {story.layout === 'vertical-timeline' && (
          <TimelineVertical events={story.timeline} story={story} />
        )}
        {story.layout === 'horizontal-timeline' && (
          <TimelineHorizontal events={story.timeline} story={story} />
        )}
        {story.layout === 'story-cards' && <StoryCards events={story.timeline} story={story} />}
        {story.layout === 'masonry-gallery' && (
          <>
            <MasonryGallery gallery={story.gallery} />
            {story.timeline.length > 0 && (
              <TimelineVertical events={story.timeline} story={story} />
            )}
          </>
        )}

        {story.layout !== 'masonry-gallery' && story.gallery.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-2">
            {story.gallery.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.alt || ''}
                className="aspect-square w-full rounded-xl object-cover shadow-sm"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
