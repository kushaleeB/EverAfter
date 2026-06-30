import type { InvitationSection } from '@/types/api';

export type ScheduleEventType =
  | 'ceremony'
  | 'cocktail-hour'
  | 'reception'
  | 'dinner'
  | 'cake-cutting'
  | 'first-dance'
  | 'after-party'
  | 'custom';

export type ScheduleEventStatus = 'upcoming' | 'live' | 'completed';

export type ScheduleLayout =
  | 'vertical-timeline'
  | 'elegant-cards'
  | 'luxury-timeline'
  | 'classic-list'
  | 'modern-minimal'
  | 'horizontal-timeline';

export type ScheduleCardStyle = 'soft' | 'bordered' | 'elevated' | 'glass';
export type ScheduleIconStyle = 'filled' | 'outline' | 'minimal';
export type ScheduleAnimation = 'fade-in' | 'slide-up' | 'timeline-reveal' | 'scale' | 'none';

export type DressCodeType =
  | 'black-tie'
  | 'formal'
  | 'cocktail'
  | 'semi-formal'
  | 'casual'
  | 'beach'
  | 'traditional'
  | 'custom';

export interface ScheduleVenueInfo {
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  parkingInfo: string;
  transportationDetails: string;
  shuttleService: string;
  entranceInstructions: string;
  accessibilityNotes: string;
}

export interface ScheduleDressCode {
  type: DressCodeType;
  customText: string;
  imageUrl: string | null;
}

export interface ScheduleSpecialNotes {
  arrivalInstructions: string;
  weatherNotes: string;
  photographyPolicy: string;
  childrenPolicy: string;
  ceremonyEtiquette: string;
  specialInstructions: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  eventType: ScheduleEventType;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  description: string;
  icon: string;
  backgroundImageUrl: string | null;
  showTime: boolean;
  showVenue: boolean;
  showDescription: boolean;
  showMapButton: boolean;
  showCountdown: boolean;
  enableReminderBadge: boolean;
  isMainEvent: boolean;
  status: ScheduleEventStatus;
}

export interface ScheduleDetailsContent {
  sectionTitle: string;
  subtitle: string;
  description: string;
  introMessage: string;
  items: ScheduleEvent[];
  venueInfo: ScheduleVenueInfo;
  dressCode: ScheduleDressCode;
  specialNotes: ScheduleSpecialNotes;
  layout: ScheduleLayout;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  overlayOpacity: number;
  accentColor: string;
  cardStyle: ScheduleCardStyle;
  borderRadius: number;
  timelineLineColor: string;
  iconStyle: ScheduleIconStyle;
  sectionPadding: number;
  fontFamily: string;
  headingFontSize: number;
  bodyFontSize: number;
  textColor: string;
  animation: ScheduleAnimation;
}

export const SCHEDULE_EVENT_TYPE_OPTIONS: Array<{ label: string; value: ScheduleEventType }> = [
  { label: 'Ceremony', value: 'ceremony' },
  { label: 'Cocktail Hour', value: 'cocktail-hour' },
  { label: 'Reception', value: 'reception' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Cake Cutting', value: 'cake-cutting' },
  { label: 'First Dance', value: 'first-dance' },
  { label: 'After Party', value: 'after-party' },
  { label: 'Custom', value: 'custom' },
];

export const DRESS_CODE_OPTIONS: Array<{ label: string; value: DressCodeType }> = [
  { label: 'Black Tie', value: 'black-tie' },
  { label: 'Formal', value: 'formal' },
  { label: 'Cocktail', value: 'cocktail' },
  { label: 'Semi Formal', value: 'semi-formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Beach', value: 'beach' },
  { label: 'Traditional', value: 'traditional' },
  { label: 'Custom', value: 'custom' },
];

export const SCHEDULE_ICON_OPTIONS = [
  { label: 'None', value: '' },
  { label: 'Rings', value: 'rings' },
  { label: 'Church', value: 'church' },
  { label: 'Champagne', value: 'champagne' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Cake', value: 'cake' },
  { label: 'Music', value: 'music' },
  { label: 'Heart', value: 'heart' },
  { label: 'Sparkles', value: 'sparkles' },
];

export const SCHEDULE_LAYOUT_OPTIONS: Array<{ label: string; value: ScheduleLayout }> = [
  { label: 'Vertical Timeline', value: 'vertical-timeline' },
  { label: 'Elegant Cards', value: 'elegant-cards' },
  { label: 'Luxury Timeline', value: 'luxury-timeline' },
  { label: 'Classic List', value: 'classic-list' },
  { label: 'Modern Minimal', value: 'modern-minimal' },
  { label: 'Horizontal Timeline', value: 'horizontal-timeline' },
];

export const SCHEDULE_CARD_STYLE_OPTIONS: Array<{ label: string; value: ScheduleCardStyle }> = [
  { label: 'Soft', value: 'soft' },
  { label: 'Bordered', value: 'bordered' },
  { label: 'Elevated', value: 'elevated' },
  { label: 'Glass', value: 'glass' },
];

export const SCHEDULE_ICON_STYLE_OPTIONS: Array<{ label: string; value: ScheduleIconStyle }> = [
  { label: 'Filled', value: 'filled' },
  { label: 'Outline', value: 'outline' },
  { label: 'Minimal', value: 'minimal' },
];

export const SCHEDULE_STATUS_OPTIONS: Array<{ label: string; value: ScheduleEventStatus }> = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
];

export const SCHEDULE_FONT_OPTIONS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

export const DEFAULT_SCHEDULE_EVENT: Omit<ScheduleEvent, 'id'> = {
  title: '',
  eventType: 'ceremony',
  date: '',
  startTime: '',
  endTime: '',
  venueName: '',
  venueAddress: '',
  mapsUrl: '',
  description: '',
  icon: 'church',
  backgroundImageUrl: null,
  showTime: true,
  showVenue: true,
  showDescription: true,
  showMapButton: true,
  showCountdown: false,
  enableReminderBadge: false,
  isMainEvent: false,
  status: 'upcoming',
};

export const DEFAULT_VENUE_INFO: ScheduleVenueInfo = {
  venueName: '',
  venueAddress: '',
  mapsUrl: '',
  parkingInfo: '',
  transportationDetails: '',
  shuttleService: '',
  entranceInstructions: '',
  accessibilityNotes: '',
};

export const DEFAULT_DRESS_CODE: ScheduleDressCode = {
  type: 'formal',
  customText: '',
  imageUrl: null,
};

export const DEFAULT_SPECIAL_NOTES: ScheduleSpecialNotes = {
  arrivalInstructions: '',
  weatherNotes: '',
  photographyPolicy: '',
  childrenPolicy: '',
  ceremonyEtiquette: '',
  specialInstructions: '',
};

export const DEFAULT_SCHEDULE_DETAILS: ScheduleDetailsContent = {
  sectionTitle: 'Weekend Schedule',
  subtitle: '',
  description: '',
  introMessage: '',
  items: [],
  venueInfo: DEFAULT_VENUE_INFO,
  dressCode: DEFAULT_DRESS_CODE,
  specialNotes: DEFAULT_SPECIAL_NOTES,
  layout: 'luxury-timeline',
  backgroundColor: '#faf9f6',
  backgroundImageUrl: null,
  overlayOpacity: 0,
  accentColor: '#c5a67c',
  cardStyle: 'glass',
  borderRadius: 16,
  timelineLineColor: '#e8dfd6',
  iconStyle: 'filled',
  sectionPadding: 32,
  fontFamily: "'Playfair Display', serif",
  headingFontSize: 24,
  bodyFontSize: 13,
  textColor: '#4e342e',
  animation: 'timeline-reveal',
};

const EVENT_TYPES = new Set(SCHEDULE_EVENT_TYPE_OPTIONS.map((option) => option.value));

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function readBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function parseEventType(value: unknown): ScheduleEventType {
  const raw = readString(value, 'custom');
  return EVENT_TYPES.has(raw as ScheduleEventType) ? (raw as ScheduleEventType) : 'custom';
}

function parseLayout(value: unknown): ScheduleLayout {
  const raw = readString(value);
  const legacyMap: Record<string, ScheduleLayout> = {
    'minimal-list': 'classic-list',
    'alternating-timeline': 'horizontal-timeline',
  };
  const mapped = legacyMap[raw] ?? raw;
  return SCHEDULE_LAYOUT_OPTIONS.some((option) => option.value === mapped)
    ? (mapped as ScheduleLayout)
    : DEFAULT_SCHEDULE_DETAILS.layout;
}

function parseDressCodeType(value: unknown): DressCodeType {
  const raw = readString(value, 'formal');
  return DRESS_CODE_OPTIONS.some((option) => option.value === raw)
    ? (raw as DressCodeType)
    : 'custom';
}

function parseEventStatus(value: unknown): ScheduleEventStatus {
  const raw = readString(value, 'upcoming');
  return raw === 'live' || raw === 'completed' ? raw : 'upcoming';
}

function parseVenueInfo(value: unknown): ScheduleVenueInfo {
  if (!value || typeof value !== 'object') return { ...DEFAULT_VENUE_INFO };
  const record = value as Record<string, unknown>;
  return {
    venueName: readString(record.venueName),
    venueAddress: readString(record.venueAddress),
    mapsUrl: readString(record.mapsUrl),
    parkingInfo: readString(record.parkingInfo),
    transportationDetails: readString(record.transportationDetails),
    shuttleService: readString(record.shuttleService),
    entranceInstructions: readString(record.entranceInstructions),
    accessibilityNotes: readString(record.accessibilityNotes),
  };
}

function parseDressCode(value: unknown, legacyDressCode?: string): ScheduleDressCode {
  if (!value || typeof value !== 'object') {
    return legacyDressCode
      ? { type: 'custom', customText: legacyDressCode, imageUrl: null }
      : { ...DEFAULT_DRESS_CODE };
  }
  const record = value as Record<string, unknown>;
  const imageUrlRaw = record.imageUrl;
  return {
    type: parseDressCodeType(record.type),
    customText: readString(record.customText),
    imageUrl:
      imageUrlRaw === null
        ? null
        : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
          ? imageUrlRaw
          : null,
  };
}

function parseSpecialNotes(value: unknown): ScheduleSpecialNotes {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SPECIAL_NOTES };
  const record = value as Record<string, unknown>;
  return {
    arrivalInstructions: readString(record.arrivalInstructions),
    weatherNotes: readString(record.weatherNotes),
    photographyPolicy: readString(record.photographyPolicy),
    childrenPolicy: readString(record.childrenPolicy),
    ceremonyEtiquette: readString(record.ceremonyEtiquette),
    specialInstructions: readString(record.specialInstructions),
  };
}

function parseScheduleItems(value: unknown): ScheduleEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const title = readString(record.title) || readString(record.label);
      const startTime = readString(record.startTime) || readString(record.time);
      const imageUrlRaw = record.backgroundImageUrl;

      return {
        id: readString(record.id, `schedule-${index}`),
        title,
        eventType: parseEventType(record.eventType),
        date: readString(record.date),
        startTime,
        endTime: readString(record.endTime),
        venueName: readString(record.venueName),
        venueAddress: readString(record.venueAddress),
        mapsUrl: readString(record.mapsUrl),
        description: readString(record.description),
        icon: readString(record.icon, DEFAULT_SCHEDULE_EVENT.icon),
        backgroundImageUrl:
          imageUrlRaw === null
            ? null
            : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
              ? imageUrlRaw
              : null,
        showTime: readBool(record.showTime, DEFAULT_SCHEDULE_EVENT.showTime),
        showVenue: readBool(record.showVenue, DEFAULT_SCHEDULE_EVENT.showVenue),
        showDescription: readBool(record.showDescription, DEFAULT_SCHEDULE_EVENT.showDescription),
        showMapButton: readBool(record.showMapButton, DEFAULT_SCHEDULE_EVENT.showMapButton),
        showCountdown: readBool(record.showCountdown, DEFAULT_SCHEDULE_EVENT.showCountdown),
        enableReminderBadge: readBool(
          record.enableReminderBadge,
          DEFAULT_SCHEDULE_EVENT.enableReminderBadge,
        ),
        isMainEvent: readBool(record.isMainEvent, DEFAULT_SCHEDULE_EVENT.isMainEvent),
        status: parseEventStatus(record.status),
      };
    })
    .filter((item): item is ScheduleEvent => item !== null);
}

export function parseScheduleDetails(section: InvitationSection | undefined): ScheduleDetailsContent {
  const content = section?.content ?? {};

  const cardStyleRaw = readString(content.cardStyle);
  const cardStyle = SCHEDULE_CARD_STYLE_OPTIONS.some((option) => option.value === cardStyleRaw)
    ? (cardStyleRaw as ScheduleCardStyle)
    : DEFAULT_SCHEDULE_DETAILS.cardStyle;

  const iconStyleRaw = readString(content.iconStyle);
  const iconStyle = SCHEDULE_ICON_STYLE_OPTIONS.some((option) => option.value === iconStyleRaw)
    ? (iconStyleRaw as ScheduleIconStyle)
    : DEFAULT_SCHEDULE_DETAILS.iconStyle;

  const animationRaw = readString(content.animation);
  const animation =
    animationRaw === 'fade-in' ||
    animationRaw === 'slide-up' ||
    animationRaw === 'timeline-reveal' ||
    animationRaw === 'scale' ||
    animationRaw === 'none'
      ? animationRaw
      : DEFAULT_SCHEDULE_DETAILS.animation;

  const imageUrlRaw = content.backgroundImageUrl;
  const backgroundImageUrl =
    imageUrlRaw === null
      ? null
      : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
        ? imageUrlRaw
        : null;

  const firstItemDressCode =
    Array.isArray(content.items) && content.items[0] && typeof content.items[0] === 'object'
      ? readString((content.items[0] as Record<string, unknown>).dressCode)
      : '';

  return {
    sectionTitle: readString(content.sectionTitle, DEFAULT_SCHEDULE_DETAILS.sectionTitle),
    subtitle: readString(content.subtitle),
    description: readString(content.description),
    introMessage: readString(content.introMessage),
    items: parseScheduleItems(content.items),
    venueInfo: parseVenueInfo(content.venueInfo),
    dressCode: parseDressCode(content.dressCode, firstItemDressCode),
    specialNotes: parseSpecialNotes(content.specialNotes),
    layout: parseLayout(content.layout),
    backgroundColor: readString(content.backgroundColor, DEFAULT_SCHEDULE_DETAILS.backgroundColor),
    backgroundImageUrl,
    overlayOpacity: readNumber(content.overlayOpacity, DEFAULT_SCHEDULE_DETAILS.overlayOpacity),
    accentColor: readString(content.accentColor, DEFAULT_SCHEDULE_DETAILS.accentColor),
    cardStyle,
    borderRadius: readNumber(content.borderRadius, DEFAULT_SCHEDULE_DETAILS.borderRadius),
    timelineLineColor: readString(
      content.timelineLineColor,
      DEFAULT_SCHEDULE_DETAILS.timelineLineColor,
    ),
    iconStyle,
    sectionPadding: readNumber(content.sectionPadding, DEFAULT_SCHEDULE_DETAILS.sectionPadding),
    fontFamily: readString(content.fontFamily, DEFAULT_SCHEDULE_DETAILS.fontFamily),
    headingFontSize: readNumber(content.headingFontSize, DEFAULT_SCHEDULE_DETAILS.headingFontSize),
    bodyFontSize: readNumber(content.bodyFontSize, DEFAULT_SCHEDULE_DETAILS.bodyFontSize),
    textColor: readString(content.textColor, DEFAULT_SCHEDULE_DETAILS.textColor),
    animation,
  };
}

export function scheduleDetailsToContent(details: ScheduleDetailsContent): Record<string, unknown> {
  return {
    ...details,
    items: details.items.map((item) => ({
      ...item,
      label: item.title,
      time: item.startTime,
    })),
  };
}

export function createScheduleEvent(overrides: Partial<ScheduleEvent> = {}): ScheduleEvent {
  return { id: crypto.randomUUID(), ...DEFAULT_SCHEDULE_EVENT, ...overrides };
}

export function duplicateScheduleEvent(event: ScheduleEvent): ScheduleEvent {
  return {
    ...event,
    id: crypto.randomUUID(),
    title: event.title ? `${event.title} (Copy)` : '',
    isMainEvent: false,
    status: 'upcoming',
  };
}

export interface ScheduleEventValidationErrors {
  title?: string;
  date?: string;
  startTime?: string;
  venueName?: string;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  errors: {
    events?: Record<string, ScheduleEventValidationErrors>;
  };
}

export function validateScheduleDetails(
  section: InvitationSection | undefined,
): ScheduleValidationResult {
  const details = parseScheduleDetails(section);
  const eventErrors: Record<string, ScheduleEventValidationErrors> = {};

  for (const event of details.items) {
    const fieldErrors: ScheduleEventValidationErrors = {};
    if (!event.title.trim()) fieldErrors.title = 'Event title is required.';
    if (!event.date.trim()) fieldErrors.date = 'Date is required.';
    if (!event.startTime.trim()) fieldErrors.startTime = 'Start time is required.';
    if (!event.venueName.trim()) fieldErrors.venueName = 'Venue is required.';

    if (Object.keys(fieldErrors).length > 0) {
      eventErrors[event.id] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(eventErrors).length === 0,
    errors: Object.keys(eventErrors).length > 0 ? { events: eventErrors } : {},
  };
}

export function formatScheduleDate(date: string) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

export function formatScheduleTimeRange(startTime: string, endTime: string) {
  if (!startTime) return '';
  return endTime.trim() ? `${startTime} – ${endTime}` : startTime;
}

export function dressCodeLabel(dressCode: ScheduleDressCode) {
  if (dressCode.type === 'custom') return dressCode.customText || 'Custom';
  return DRESS_CODE_OPTIONS.find((option) => option.value === dressCode.type)?.label ?? 'Formal';
}

export function scheduleAnimationClass(animation: ScheduleAnimation) {
  switch (animation) {
    case 'fade-in':
      return 'schedule-fade-in';
    case 'slide-up':
      return 'schedule-slide-up';
    case 'timeline-reveal':
      return 'schedule-timeline-reveal';
    case 'scale':
      return 'schedule-scale';
    default:
      return '';
  }
}

export function scheduleCardClass(cardStyle: ScheduleCardStyle) {
  switch (cardStyle) {
    case 'bordered':
      return 'border border-[#e8dfd6] bg-white/90';
    case 'elevated':
      return 'border border-[#efe8e0] bg-white shadow-[0_12px_32px_rgba(78,52,46,0.1)]';
    case 'glass':
      return 'border border-white/40 bg-white/55 shadow-[0_8px_32px_rgba(78,52,46,0.08)] backdrop-blur-md';
    default:
      return 'border border-[#efe8e0] bg-white/85 shadow-[0_6px_20px_rgba(78,52,46,0.06)]';
  }
}

export function isValidMapsUrl(url: string) {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function eventStatusBadgeClass(status: ScheduleEventStatus) {
  switch (status) {
    case 'live':
      return 'bg-[#e8f5e9] text-[#2e7d32]';
    case 'completed':
      return 'bg-[#f0ebe6] text-[#6d625a]';
    default:
      return 'bg-[#fff8ee] text-[#c5a67c]';
  }
}

export function eventStatusLabel(status: ScheduleEventStatus) {
  return SCHEDULE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Upcoming';
}
