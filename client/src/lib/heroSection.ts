import type { Invitation, InvitationSection } from '@/types/api';
import { resolveOptionalMediaUrl } from '@/lib/mediaUrl';

export type BackgroundPosition = 'center' | 'top' | 'bottom';
export type BackgroundSize = 'cover' | 'contain';
export type TextAlign = 'left' | 'center' | 'right';
export type VerticalPosition = 'top' | 'center' | 'bottom';
export type ContentWidth = 'narrow' | 'default' | 'wide';
export type HeroAnimation = 'fade-in' | 'none';

export interface HeroDetailsContent {
  imageUrl: string | null;
  overlayOpacity: number;
  backgroundPosition: BackgroundPosition;
  backgroundSize: BackgroundSize;
  invitationTitle: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  ctaText: string;
  fontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
  textColor: string;
  textAlign: TextAlign;
  fullHeight: boolean;
  showSubheading: boolean;
  showDate: boolean;
  showVenue: boolean;
  verticalPosition: VerticalPosition;
  contentWidth: ContentWidth;
  sectionSpacing: number;
  borderRadius: number;
  heroHeight: number;
  animation: HeroAnimation;
}

export const INVITATION_TITLE_OPTIONS = [
  'Wedding Invitation',
  'Save the Date',
  'Reception',
] as const;

export const FONT_FAMILY_OPTIONS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

export const DEFAULT_HERO_DETAILS: HeroDetailsContent = {
  imageUrl: '/img/overview/Image.png',
  overlayOpacity: 0.4,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  invitationTitle: 'Wedding Invitation',
  weddingDate: '',
  weddingTime: '',
  venueName: '',
  venueAddress: '',
  ctaText: '',
  fontFamily: "'Playfair Display', serif",
  titleFontSize: 28,
  subtitleFontSize: 10,
  textColor: '#ffffff',
  textAlign: 'center',
  fullHeight: false,
  showSubheading: true,
  showDate: true,
  showVenue: true,
  verticalPosition: 'center',
  contentWidth: 'default',
  sectionSpacing: 24,
  borderRadius: 0,
  heroHeight: 360,
  animation: 'none',
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readContentString(
  content: Record<string, unknown>,
  key: string,
  fallback = '',
) {
  if (Object.prototype.hasOwnProperty.call(content, key)) {
    return typeof content[key] === 'string' ? content[key] : '';
  }
  return fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function readBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

export function parseHeroDetails(
  section: InvitationSection | undefined,
  invitation: Invitation,
): HeroDetailsContent {
  const content = (section?.content ?? {}) as Record<string, unknown>;
  const event = invitation.event;
  const eventDate = event?.eventDate ? event.eventDate.slice(0, 10) : '';

  const imageUrlRaw = content.imageUrl;
  const imageUrl = resolveOptionalMediaUrl(
    imageUrlRaw === null
      ? null
      : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
        ? imageUrlRaw
        : event?.coverImageUrl ?? DEFAULT_HERO_DETAILS.imageUrl,
  );

  return {
    imageUrl,
    overlayOpacity: readNumber(content.overlayOpacity, DEFAULT_HERO_DETAILS.overlayOpacity),
    backgroundPosition:
      content.backgroundPosition === 'top' ||
      content.backgroundPosition === 'bottom' ||
      content.backgroundPosition === 'center'
        ? content.backgroundPosition
        : DEFAULT_HERO_DETAILS.backgroundPosition,
    backgroundSize:
      content.backgroundSize === 'contain' || content.backgroundSize === 'cover'
        ? content.backgroundSize
        : DEFAULT_HERO_DETAILS.backgroundSize,
    invitationTitle: readString(content.invitationTitle, DEFAULT_HERO_DETAILS.invitationTitle),
    weddingDate: readContentString(content, 'weddingDate', eventDate),
    weddingTime: readContentString(content, 'weddingTime', DEFAULT_HERO_DETAILS.weddingTime),
    venueName: readContentString(content, 'venueName', event?.venueName ?? ''),
    venueAddress: readContentString(content, 'venueAddress', event?.venueAddress ?? ''),
    ctaText: readString(content.ctaText, DEFAULT_HERO_DETAILS.ctaText),
    fontFamily: readString(content.fontFamily, DEFAULT_HERO_DETAILS.fontFamily),
    titleFontSize: readNumber(content.titleFontSize, DEFAULT_HERO_DETAILS.titleFontSize),
    subtitleFontSize: readNumber(content.subtitleFontSize, DEFAULT_HERO_DETAILS.subtitleFontSize),
    textColor: readString(content.textColor, DEFAULT_HERO_DETAILS.textColor),
    textAlign:
      content.textAlign === 'left' || content.textAlign === 'right' || content.textAlign === 'center'
        ? content.textAlign
        : DEFAULT_HERO_DETAILS.textAlign,
    fullHeight: readBool(content.fullHeight, DEFAULT_HERO_DETAILS.fullHeight),
    showSubheading: readBool(content.showSubheading, DEFAULT_HERO_DETAILS.showSubheading),
    showDate: readBool(content.showDate, DEFAULT_HERO_DETAILS.showDate),
    showVenue: readBool(content.showVenue, DEFAULT_HERO_DETAILS.showVenue),
    verticalPosition:
      content.verticalPosition === 'top' ||
      content.verticalPosition === 'bottom' ||
      content.verticalPosition === 'center'
        ? content.verticalPosition
        : DEFAULT_HERO_DETAILS.verticalPosition,
    contentWidth:
      content.contentWidth === 'narrow' ||
      content.contentWidth === 'wide' ||
      content.contentWidth === 'default'
        ? content.contentWidth
        : DEFAULT_HERO_DETAILS.contentWidth,
    sectionSpacing: readNumber(content.sectionSpacing, DEFAULT_HERO_DETAILS.sectionSpacing),
    borderRadius: readNumber(content.borderRadius, DEFAULT_HERO_DETAILS.borderRadius),
    heroHeight: readNumber(content.heroHeight, DEFAULT_HERO_DETAILS.heroHeight),
    animation:
      content.animation === 'fade-in' || content.animation === 'none'
        ? content.animation
        : DEFAULT_HERO_DETAILS.animation,
  };
}

export function heroDetailsToContent(details: HeroDetailsContent): Record<string, unknown> {
  return { ...details };
}

export interface HeroValidationResult {
  isValid: boolean;
  errors: {
    coupleNames?: string;
    weddingDate?: string;
    venueName?: string;
  };
}

export function validateHeroDetails(
  invitation: Invitation,
  section: InvitationSection | undefined,
): HeroValidationResult {
  const details = parseHeroDetails(section, invitation);
  const errors: HeroValidationResult['errors'] = {};

  if (!invitation.headline?.trim()) {
    errors.coupleNames = 'Couple names are required.';
  }
  if (!details.weddingDate.trim()) {
    errors.weddingDate = 'Wedding date is required.';
  }
  if (!details.venueName.trim()) {
    errors.venueName = 'Venue name is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function contentWidthToCss(width: ContentWidth) {
  switch (width) {
    case 'narrow':
      return '85%';
    case 'wide':
      return '100%';
    default:
      return '92%';
  }
}

export function verticalPositionToJustify(position: VerticalPosition) {
  switch (position) {
    case 'top':
      return 'flex-start';
    case 'bottom':
      return 'flex-end';
    default:
      return 'center';
  }
}

export function backgroundPositionToCss(position: BackgroundPosition) {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    default:
      return 'center center';
  }
}

export function formatWeddingDateTime(date: string, time: string) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  const formatted = parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return time.trim() ? `${formatted} · ${time.trim()}` : formatted;
}
