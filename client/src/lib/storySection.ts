import type { InvitationSection } from '@/types/api';
import { resolveOptionalMediaUrl, resolveRequiredMediaUrl } from '@/lib/mediaUrl';

export type StoryLayout =
  | 'vertical-timeline'
  | 'horizontal-timeline'
  | 'story-cards'
  | 'masonry-gallery';

export type StoryTextAlign = 'left' | 'center' | 'right';
export type StoryAnimation = 'fade-in' | 'slide-up' | 'none';

export interface StoryTimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string | null;
  location: string;
}

export interface StoryGalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface StoryDetailsContent {
  title: string;
  subtitle: string;
  body: string;
  timeline: StoryTimelineEvent[];
  gallery: StoryGalleryImage[];
  layout: StoryLayout;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  overlayOpacity: number;
  sectionPadding: number;
  borderRadius: number;
  fontFamily: string;
  titleFontSize: number;
  bodyFontSize: number;
  textColor: string;
  textAlign: StoryTextAlign;
  animation: StoryAnimation;
}

export const STORY_LAYOUT_OPTIONS: Array<{ label: string; value: StoryLayout }> = [
  { label: 'Vertical Timeline', value: 'vertical-timeline' },
  { label: 'Horizontal Timeline', value: 'horizontal-timeline' },
  { label: 'Story Cards', value: 'story-cards' },
  { label: 'Masonry Gallery', value: 'masonry-gallery' },
];

export const STORY_FONT_OPTIONS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

export const DEFAULT_STORY_DETAILS: StoryDetailsContent = {
  title: 'Our Story',
  subtitle: '',
  body: '',
  timeline: [],
  gallery: [],
  layout: 'vertical-timeline',
  backgroundColor: '#faf9f6',
  backgroundImageUrl: null,
  overlayOpacity: 0,
  sectionPadding: 32,
  borderRadius: 0,
  fontFamily: "'Playfair Display', serif",
  titleFontSize: 26,
  bodyFontSize: 13,
  textColor: '#4e342e',
  textAlign: 'center',
  animation: 'none',
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function parseTimeline(value: unknown): StoryTimelineEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const id = readString(record.id, `timeline-${index}`);
      return {
        id,
        title: readString(record.title),
        date: readString(record.date),
        description: readString(record.description),
        imageUrl: resolveOptionalMediaUrl(
          record.imageUrl === null
            ? null
            : typeof record.imageUrl === 'string' && record.imageUrl.length > 0
              ? record.imageUrl
              : null,
        ),
        location: readString(record.location),
      };
    })
    .filter((item): item is StoryTimelineEvent => item !== null);
}

function parseGallery(value: unknown): StoryGalleryImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const url = readString(record.url);
      if (!url) return null;
      return {
        id: readString(record.id, `gallery-${index}`),
        url: resolveRequiredMediaUrl(url),
        alt: readString(record.alt),
      };
    })
    .filter((item): item is StoryGalleryImage => item !== null);
}

export function parseStoryDetails(section: InvitationSection | undefined): StoryDetailsContent {
  const content = section?.content ?? {};

  const layoutRaw = readString(content.layout);
  const layout = STORY_LAYOUT_OPTIONS.some((option) => option.value === layoutRaw)
    ? (layoutRaw as StoryLayout)
    : DEFAULT_STORY_DETAILS.layout;

  const textAlignRaw = readString(content.textAlign);
  const textAlign =
    textAlignRaw === 'left' || textAlignRaw === 'right' || textAlignRaw === 'center'
      ? textAlignRaw
      : DEFAULT_STORY_DETAILS.textAlign;

  const animationRaw = readString(content.animation);
  const animation =
    animationRaw === 'fade-in' || animationRaw === 'slide-up' || animationRaw === 'none'
      ? animationRaw
      : DEFAULT_STORY_DETAILS.animation;

  const imageUrlRaw = content.backgroundImageUrl;
  const backgroundImageUrl = resolveOptionalMediaUrl(
    imageUrlRaw === null
      ? null
      : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
        ? imageUrlRaw
        : null,
  );

  return {
    title: readString(content.title, DEFAULT_STORY_DETAILS.title),
    subtitle: readString(content.subtitle, DEFAULT_STORY_DETAILS.subtitle),
    body: readString(content.body, DEFAULT_STORY_DETAILS.body),
    timeline: parseTimeline(content.timeline),
    gallery: parseGallery(content.gallery),
    layout,
    backgroundColor: readString(content.backgroundColor, DEFAULT_STORY_DETAILS.backgroundColor),
    backgroundImageUrl,
    overlayOpacity: readNumber(content.overlayOpacity, DEFAULT_STORY_DETAILS.overlayOpacity),
    sectionPadding: readNumber(content.sectionPadding, DEFAULT_STORY_DETAILS.sectionPadding),
    borderRadius: readNumber(content.borderRadius, DEFAULT_STORY_DETAILS.borderRadius),
    fontFamily: readString(content.fontFamily, DEFAULT_STORY_DETAILS.fontFamily),
    titleFontSize: readNumber(content.titleFontSize, DEFAULT_STORY_DETAILS.titleFontSize),
    bodyFontSize: readNumber(content.bodyFontSize, DEFAULT_STORY_DETAILS.bodyFontSize),
    textColor: readString(content.textColor, DEFAULT_STORY_DETAILS.textColor),
    textAlign,
    animation,
  };
}

export function storyDetailsToContent(details: StoryDetailsContent): Record<string, unknown> {
  return { ...details };
}

export function createTimelineEvent(): StoryTimelineEvent {
  return {
    id: crypto.randomUUID(),
    title: '',
    date: '',
    description: '',
    imageUrl: null,
    location: '',
  };
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export interface StoryValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    timelineEvents?: Record<string, { title?: string }>;
  };
  warnings: {
    noTimeline?: string;
  };
}

export function validateStoryDetails(section: InvitationSection | undefined): StoryValidationResult {
  const details = parseStoryDetails(section);
  const errors: StoryValidationResult['errors'] = {};
  const warnings: StoryValidationResult['warnings'] = {};

  if (!details.title.trim()) {
    errors.title = 'Story title is required.';
  }

  if (details.timeline.length === 0) {
    warnings.noTimeline = 'Add at least one timeline event to tell your story.';
  }

  const timelineErrors: Record<string, { title?: string }> = {};
  for (const event of details.timeline) {
    if (!event.title.trim()) {
      timelineErrors[event.id] = { title: 'Event title is required.' };
    }
  }

  if (Object.keys(timelineErrors).length > 0) {
    errors.timelineEvents = timelineErrors;
  }

  return {
    isValid: !errors.title && !errors.timelineEvents,
    errors,
    warnings,
  };
}

export function formatStoryDate(date: string) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function storyAnimationClass(animation: StoryAnimation) {
  switch (animation) {
    case 'fade-in':
      return 'story-fade-in';
    case 'slide-up':
      return 'story-slide-up';
    default:
      return '';
  }
}

export function storyTextAlignClass(align: StoryTextAlign) {
  switch (align) {
    case 'left':
      return 'text-left items-start';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-center items-center';
  }
}
