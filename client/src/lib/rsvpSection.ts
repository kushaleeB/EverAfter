import type { Invitation, InvitationSection, RsvpAnalytics } from '@/types/api';
import { resolveOptionalMediaUrl } from '@/lib/mediaUrl';

export type RsvpFieldKey =
  | 'guestName'
  | 'email'
  | 'phone'
  | 'attendance'
  | 'guestCount'
  | 'plusOne'
  | 'mealPreference'
  | 'dietaryRestrictions'
  | 'songRequest'
  | 'personalMessage'
  | 'specialRequirements';

export type RsvpPreviewVariant = 'form' | 'success';
export type RsvpSectionWidth = 'narrow' | 'default' | 'full';
export type RsvpInputStyle = 'minimal' | 'outlined' | 'filled' | 'glass';
export type RsvpButtonStyle = 'solid' | 'outline' | 'ghost';
export type RsvpButtonHover = 'none' | 'lift' | 'glow' | 'scale';
export type DietaryOptionType =
  | 'gluten-free'
  | 'halal'
  | 'kosher'
  | 'vegan'
  | 'vegetarian'
  | 'nut-allergy'
  | 'dairy-free'
  | 'custom';

export interface RsvpFormField {
  key: RsvpFieldKey;
  enabled: boolean;
  required: boolean;
  visible: boolean;
  placeholder: string;
  helpText: string;
}

export interface AttendanceOption {
  key: 'attending' | 'declined' | 'maybe';
  label: string;
  enabled: boolean;
}

export interface MealOption {
  id: string;
  label: string;
}

export interface DietaryOption {
  id: string;
  label: string;
  type: DietaryOptionType;
}

export interface PlusOneSettings {
  enabled: boolean;
  maxPlusOnes: number;
  requireName: boolean;
  requireMeal: boolean;
  requireRsvp: boolean;
}

export interface SongRequestSettings {
  enabled: boolean;
  maxCharacters: number;
}

export interface RsvpDeadlineSettings {
  date: string;
  time: string;
  timezone: string;
}

export interface SuccessScreenSettings {
  showQrCode: boolean;
  showDownloadInvitation: boolean;
  showAddToCalendar: boolean;
}

export interface CalendarSettings {
  google: boolean;
  apple: boolean;
  outlook: boolean;
  yahoo: boolean;
}

export interface RsvpButtonSettings {
  text: string;
  color: string;
  borderRadius: number;
  hoverAnimation: RsvpButtonHover;
  showLoadingState: boolean;
}

export interface RsvpDetailsContent {
  sectionTitle: string;
  subtitle: string;
  welcomeMessage: string;
  description: string;
  thankYouTitle: string;
  thankYouMessage: string;
  formFields: RsvpFormField[];
  attendanceOptions: AttendanceOption[];
  plusOne: PlusOneSettings;
  meals: MealOption[];
  dietaryOptions: DietaryOption[];
  songRequest: SongRequestSettings;
  deadline: RsvpDeadlineSettings;
  allowEditBeforeDeadline: boolean;
  successScreen: SuccessScreenSettings;
  calendar: CalendarSettings;
  maxCapacity: number;
  previewVariant: RsvpPreviewVariant;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  overlayOpacity: number;
  accentColor: string;
  borderRadius: number;
  sectionWidth: RsvpSectionWidth;
  sectionPadding: number;
  inputStyle: RsvpInputStyle;
  buttonStyle: RsvpButtonStyle;
  headingFontSize: number;
  bodyFontSize: number;
  fontFamily: string;
  button: RsvpButtonSettings;
}

export const RSVP_FIELD_LABELS: Record<RsvpFieldKey, string> = {
  guestName: 'Guest Name',
  email: 'Email Address',
  phone: 'Phone Number',
  attendance: 'Attendance Status',
  guestCount: 'Number of Guests',
  plusOne: 'Plus One',
  mealPreference: 'Meal Preference',
  dietaryRestrictions: 'Dietary Restrictions',
  songRequest: 'Song Request',
  personalMessage: 'Personal Message',
  specialRequirements: 'Special Requirements',
};

export const RSVP_FONT_OPTIONS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
];

export const TIMEZONE_OPTIONS = [
  { label: 'Eastern (ET)', value: 'America/New_York' },
  { label: 'Central (CT)', value: 'America/Chicago' },
  { label: 'Mountain (MT)', value: 'America/Denver' },
  { label: 'Pacific (PT)', value: 'America/Los_Angeles' },
  { label: 'UTC', value: 'UTC' },
];

const DEFAULT_FORM_FIELDS: RsvpFormField[] = [
  { key: 'guestName', enabled: true, required: true, visible: true, placeholder: 'Your full name', helpText: '' },
  { key: 'email', enabled: true, required: true, visible: true, placeholder: 'you@email.com', helpText: '' },
  { key: 'phone', enabled: false, required: false, visible: true, placeholder: '(555) 123-4567', helpText: '' },
  { key: 'attendance', enabled: true, required: true, visible: true, placeholder: '', helpText: 'Let us know if you can join us' },
  { key: 'guestCount', enabled: true, required: false, visible: true, placeholder: '1', helpText: '' },
  { key: 'plusOne', enabled: true, required: false, visible: true, placeholder: "Plus one's name", helpText: '' },
  { key: 'mealPreference', enabled: true, required: false, visible: true, placeholder: 'Select a meal', helpText: '' },
  { key: 'dietaryRestrictions', enabled: true, required: false, visible: true, placeholder: '', helpText: 'Select all that apply' },
  { key: 'songRequest', enabled: false, required: false, visible: true, placeholder: 'Request a song', helpText: '' },
  { key: 'personalMessage', enabled: true, required: false, visible: true, placeholder: 'Share a message with the couple', helpText: '' },
  { key: 'specialRequirements', enabled: false, required: false, visible: true, placeholder: 'Accessibility or other needs', helpText: '' },
];

const DEFAULT_ATTENDANCE: AttendanceOption[] = [
  { key: 'attending', label: 'Joyfully Accept', enabled: true },
  { key: 'declined', label: 'Regretfully Decline', enabled: true },
  { key: 'maybe', label: 'Maybe', enabled: true },
];

const DEFAULT_MEALS: MealOption[] = [
  { id: 'meal-chicken', label: 'Chicken' },
  { id: 'meal-beef', label: 'Beef' },
  { id: 'meal-fish', label: 'Fish' },
  { id: 'meal-vegetarian', label: 'Vegetarian' },
  { id: 'meal-vegan', label: 'Vegan' },
  { id: 'meal-kids', label: 'Kids Meal' },
];

const DEFAULT_DIETARY: DietaryOption[] = [
  { id: 'diet-gluten', label: 'Gluten Free', type: 'gluten-free' },
  { id: 'diet-halal', label: 'Halal', type: 'halal' },
  { id: 'diet-kosher', label: 'Kosher', type: 'kosher' },
  { id: 'diet-vegan', label: 'Vegan', type: 'vegan' },
  { id: 'diet-vegetarian', label: 'Vegetarian', type: 'vegetarian' },
  { id: 'diet-nut', label: 'Nut Allergy', type: 'nut-allergy' },
  { id: 'diet-dairy', label: 'Dairy Free', type: 'dairy-free' },
];

export const DEFAULT_RSVP_DETAILS: RsvpDetailsContent = {
  sectionTitle: 'RSVP',
  subtitle: 'We hope you can join us',
  welcomeMessage: 'Please respond by the date below so we can finalize our celebration.',
  description: '',
  thankYouTitle: 'Thank You',
  thankYouMessage: 'Your response has been received. We look forward to celebrating with you.',
  formFields: DEFAULT_FORM_FIELDS,
  attendanceOptions: DEFAULT_ATTENDANCE,
  plusOne: { enabled: true, maxPlusOnes: 1, requireName: true, requireMeal: false, requireRsvp: false },
  meals: DEFAULT_MEALS,
  dietaryOptions: DEFAULT_DIETARY,
  songRequest: { enabled: false, maxCharacters: 200 },
  deadline: { date: '', time: '23:59', timezone: 'America/New_York' },
  allowEditBeforeDeadline: true,
  successScreen: { showQrCode: false, showDownloadInvitation: true, showAddToCalendar: true },
  calendar: { google: true, apple: true, outlook: true, yahoo: false },
  maxCapacity: 150,
  previewVariant: 'form',
  backgroundColor: '#faf9f6',
  backgroundImageUrl: null,
  overlayOpacity: 0,
  accentColor: '#c5a67c',
  borderRadius: 0,
  sectionWidth: 'default',
  sectionPadding: 28,
  inputStyle: 'glass',
  buttonStyle: 'solid',
  headingFontSize: 24,
  bodyFontSize: 13,
  fontFamily: "'Playfair Display', serif",
  button: {
    text: 'Submit RSVP',
    color: '#4e342e',
    borderRadius: 999,
    hoverAnimation: 'lift',
    showLoadingState: true,
  },
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function readBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function parseFormFields(value: unknown): RsvpFormField[] {
  if (!Array.isArray(value)) return DEFAULT_RSVP_DETAILS.formFields;
  const byKey = new Map<RsvpFieldKey, RsvpFormField>();

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const key = readString(record.key) as RsvpFieldKey;
    if (!RSVP_FIELD_LABELS[key]) continue;
    byKey.set(key, {
      key,
      enabled: readBool(record.enabled, true),
      required: readBool(record.required, false),
      visible: readBool(record.visible, true),
      placeholder: readString(record.placeholder),
      helpText: readString(record.helpText),
    });
  }

  const ordered: RsvpFormField[] = [];
  for (const field of value) {
    if (!field || typeof field !== 'object') continue;
    const key = readString((field as Record<string, unknown>).key) as RsvpFieldKey;
    const parsed = byKey.get(key);
    if (parsed) ordered.push(parsed);
  }

  for (const defaultField of DEFAULT_FORM_FIELDS) {
    if (!ordered.some((field) => field.key === defaultField.key)) {
      ordered.push(defaultField);
    }
  }

  return ordered.length > 0 ? ordered : DEFAULT_RSVP_DETAILS.formFields;
}

function parseAttendanceOptions(value: unknown): AttendanceOption[] {
  if (!Array.isArray(value)) return DEFAULT_ATTENDANCE;
  return DEFAULT_ATTENDANCE.map((defaultOption) => {
    const match = value.find(
      (item) => item && typeof item === 'object' && readString((item as Record<string, unknown>).key) === defaultOption.key,
    ) as Record<string, unknown> | undefined;
    if (!match) return defaultOption;
    return {
      key: defaultOption.key,
      label: readString(match.label, defaultOption.label),
      enabled: readBool(match.enabled, defaultOption.enabled),
    };
  });
}

function parseMeals(value: unknown): MealOption[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_MEALS;
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      return {
        id: readString(record.id, `meal-${index}`),
        label: readString(record.label, 'Meal'),
      };
    })
    .filter((item): item is MealOption => item !== null && item.label.length > 0);
}

function parseDietaryOptions(value: unknown): DietaryOption[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_DIETARY;
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const typeRaw = readString(record.type, 'custom');
      const type = DEFAULT_DIETARY.some((option) => option.type === typeRaw)
        ? (typeRaw as DietaryOptionType)
        : 'custom';
      return {
        id: readString(record.id, `diet-${index}`),
        label: readString(record.label, 'Custom'),
        type,
      };
    })
    .filter((item): item is DietaryOption => item !== null);
}

export function parseRsvpDetails(
  section: InvitationSection | undefined,
  invitation?: Invitation | null,
): RsvpDetailsContent {
  const content = section?.content ?? {};

  const imageUrlRaw = content.backgroundImageUrl;
  const backgroundImageUrl = resolveOptionalMediaUrl(
    imageUrlRaw === null
      ? null
      : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
        ? imageUrlRaw
        : null,
  );

  const widthRaw = readString(content.sectionWidth);
  const sectionWidth =
    widthRaw === 'narrow' || widthRaw === 'full' || widthRaw === 'default'
      ? widthRaw
      : DEFAULT_RSVP_DETAILS.sectionWidth;

  const inputRaw = readString(content.inputStyle);
  const inputStyle =
    inputRaw === 'minimal' || inputRaw === 'outlined' || inputRaw === 'filled' || inputRaw === 'glass'
      ? inputRaw
      : DEFAULT_RSVP_DETAILS.inputStyle;

  const buttonStyleRaw = readString(content.buttonStyle);
  const buttonStyle =
    buttonStyleRaw === 'solid' || buttonStyleRaw === 'outline' || buttonStyleRaw === 'ghost'
      ? buttonStyleRaw
      : DEFAULT_RSVP_DETAILS.buttonStyle;

  const previewRaw = readString(content.previewVariant);
  const previewVariant = previewRaw === 'success' ? 'success' : 'form';

  const deadlineRaw = content.deadline;
  let deadline = DEFAULT_RSVP_DETAILS.deadline;
  if (deadlineRaw && typeof deadlineRaw === 'object') {
    const record = deadlineRaw as Record<string, unknown>;
    deadline = {
      date: readString(record.date),
      time: readString(record.time, '23:59'),
      timezone: readString(record.timezone, 'America/New_York'),
    };
  }

  if (!deadline.date && invitation?.rsvpDeadline) {
    deadline = { ...deadline, date: invitation.rsvpDeadline.slice(0, 10) };
  }

  const plusOneRaw = content.plusOne;
  const plusOne =
    plusOneRaw && typeof plusOneRaw === 'object'
      ? {
          enabled: readBool((plusOneRaw as Record<string, unknown>).enabled, DEFAULT_RSVP_DETAILS.plusOne.enabled),
          maxPlusOnes: readNumber((plusOneRaw as Record<string, unknown>).maxPlusOnes, 1),
          requireName: readBool((plusOneRaw as Record<string, unknown>).requireName, true),
          requireMeal: readBool((plusOneRaw as Record<string, unknown>).requireMeal, false),
          requireRsvp: readBool((plusOneRaw as Record<string, unknown>).requireRsvp, false),
        }
      : DEFAULT_RSVP_DETAILS.plusOne;

  const songRaw = content.songRequest;
  const songRequest =
    songRaw && typeof songRaw === 'object'
      ? {
          enabled: readBool((songRaw as Record<string, unknown>).enabled, false),
          maxCharacters: readNumber((songRaw as Record<string, unknown>).maxCharacters, 200),
        }
      : DEFAULT_RSVP_DETAILS.songRequest;

  const successRaw = content.successScreen;
  const successScreen =
    successRaw && typeof successRaw === 'object'
      ? {
          showQrCode: readBool((successRaw as Record<string, unknown>).showQrCode, false),
          showDownloadInvitation: readBool((successRaw as Record<string, unknown>).showDownloadInvitation, true),
          showAddToCalendar: readBool((successRaw as Record<string, unknown>).showAddToCalendar, true),
        }
      : DEFAULT_RSVP_DETAILS.successScreen;

  const calendarRaw = content.calendar;
  const calendar =
    calendarRaw && typeof calendarRaw === 'object'
      ? {
          google: readBool((calendarRaw as Record<string, unknown>).google, true),
          apple: readBool((calendarRaw as Record<string, unknown>).apple, true),
          outlook: readBool((calendarRaw as Record<string, unknown>).outlook, true),
          yahoo: readBool((calendarRaw as Record<string, unknown>).yahoo, false),
        }
      : DEFAULT_RSVP_DETAILS.calendar;

  const buttonRaw = content.button;
  const button =
    buttonRaw && typeof buttonRaw === 'object'
      ? {
          text: readString((buttonRaw as Record<string, unknown>).text, DEFAULT_RSVP_DETAILS.button.text),
          color: readString((buttonRaw as Record<string, unknown>).color, DEFAULT_RSVP_DETAILS.button.color),
          borderRadius: readNumber((buttonRaw as Record<string, unknown>).borderRadius, 999),
          hoverAnimation: (['none', 'lift', 'glow', 'scale'] as const).includes(
            readString((buttonRaw as Record<string, unknown>).hoverAnimation) as RsvpButtonHover,
          )
            ? (readString((buttonRaw as Record<string, unknown>).hoverAnimation) as RsvpButtonHover)
            : 'lift',
          showLoadingState: readBool((buttonRaw as Record<string, unknown>).showLoadingState, true),
        }
      : DEFAULT_RSVP_DETAILS.button;

  return {
    sectionTitle: readString(content.sectionTitle, DEFAULT_RSVP_DETAILS.sectionTitle),
    subtitle: readString(content.subtitle),
    welcomeMessage: readString(content.welcomeMessage, DEFAULT_RSVP_DETAILS.welcomeMessage),
    description: readString(content.description),
    thankYouTitle: readString(content.thankYouTitle, DEFAULT_RSVP_DETAILS.thankYouTitle),
    thankYouMessage: readString(content.thankYouMessage, DEFAULT_RSVP_DETAILS.thankYouMessage),
    formFields: parseFormFields(content.formFields),
    attendanceOptions: parseAttendanceOptions(content.attendanceOptions),
    plusOne,
    meals: parseMeals(content.meals),
    dietaryOptions: parseDietaryOptions(content.dietaryOptions),
    songRequest,
    deadline,
    allowEditBeforeDeadline: readBool(content.allowEditBeforeDeadline, true),
    successScreen,
    calendar,
    maxCapacity: readNumber(content.maxCapacity, DEFAULT_RSVP_DETAILS.maxCapacity),
    previewVariant,
    backgroundColor: readString(content.backgroundColor, DEFAULT_RSVP_DETAILS.backgroundColor),
    backgroundImageUrl,
    overlayOpacity: readNumber(content.overlayOpacity, 0),
    accentColor: readString(content.accentColor, DEFAULT_RSVP_DETAILS.accentColor),
    borderRadius: readNumber(content.borderRadius, 0),
    sectionWidth,
    sectionPadding: readNumber(content.sectionPadding, DEFAULT_RSVP_DETAILS.sectionPadding),
    inputStyle,
    buttonStyle,
    headingFontSize: readNumber(content.headingFontSize, DEFAULT_RSVP_DETAILS.headingFontSize),
    bodyFontSize: readNumber(content.bodyFontSize, DEFAULT_RSVP_DETAILS.bodyFontSize),
    fontFamily: readString(content.fontFamily, DEFAULT_RSVP_DETAILS.fontFamily),
    button,
  };
}

export function rsvpDetailsToContent(details: RsvpDetailsContent): Record<string, unknown> {
  return { ...details };
}

export function createMealOption(label = 'New Meal'): MealOption {
  return { id: crypto.randomUUID(), label };
}

export function createDietaryOption(label = 'Custom', type: DietaryOptionType = 'custom'): DietaryOption {
  return { id: crypto.randomUUID(), label, type };
}

export function reorderById<T extends { id: string }>(items: T[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function reorderFields(fields: RsvpFormField[], fromKey: RsvpFieldKey, toKey: RsvpFieldKey) {
  const fromIndex = fields.findIndex((field) => field.key === fromKey);
  const toIndex = fields.findIndex((field) => field.key === toKey);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return fields;
  const next = [...fields];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function visibleFormFields(rsvp: RsvpDetailsContent) {
  return rsvp.formFields.filter((field) => field.enabled && field.visible);
}

export function deadlineToIsoDate(deadline: RsvpDeadlineSettings) {
  return deadline.date || null;
}

export function computeDeadlineCountdown(deadline: RsvpDeadlineSettings) {
  if (!deadline.date) return null;
  const target = new Date(`${deadline.date}T${deadline.time || '23:59'}:00`);
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, expired: false };
}

export interface RsvpGuestCountPreview {
  attending: number;
  declined: number;
  pending: number;
  maybe: number;
  remainingSeats: number;
  totalGuests: number;
  totalResponses: number;
  responseRate: number;
  plusOneCount: number;
  mealSummary: Record<string, number>;
}

export function buildGuestCountPreview(
  analytics: RsvpAnalytics | null,
  maxCapacity: number,
  plusOneEnabled: boolean,
): RsvpGuestCountPreview {
  if (!analytics) {
    return {
      attending: 0,
      declined: 0,
      pending: 0,
      maybe: 0,
      remainingSeats: maxCapacity,
      totalGuests: 0,
      totalResponses: 0,
      responseRate: 0,
      plusOneCount: 0,
      mealSummary: {},
    };
  }

  const attending = analytics.byStatus.attending ?? 0;
  const declined = analytics.byStatus.declined ?? 0;
  const maybe = analytics.byStatus.maybe ?? 0;
  const pending = analytics.summary.guestsPending ?? analytics.byStatus.pending ?? 0;
  const totalAttending = analytics.summary.totalAttendingCount ?? 0;
  const remainingSeats = Math.max(0, maxCapacity - totalAttending);

  const mealSummary: Record<string, number> = {};
  for (const entry of analytics.dietaryNotes ?? []) {
    const notes = entry.notes.toLowerCase();
    if (notes.includes('chicken')) mealSummary.Chicken = (mealSummary.Chicken ?? 0) + 1;
    else if (notes.includes('beef')) mealSummary.Beef = (mealSummary.Beef ?? 0) + 1;
    else if (notes.includes('fish')) mealSummary.Fish = (mealSummary.Fish ?? 0) + 1;
    else if (notes.includes('vegan')) mealSummary.Vegan = (mealSummary.Vegan ?? 0) + 1;
    else if (notes.includes('vegetarian')) mealSummary.Vegetarian = (mealSummary.Vegetarian ?? 0) + 1;
    else mealSummary.Other = (mealSummary.Other ?? 0) + 1;
  }

  const plusOneCount = plusOneEnabled
    ? Math.max(0, totalAttending - attending)
    : 0;

  return {
    attending,
    declined,
    pending,
    maybe,
    remainingSeats,
    totalGuests: analytics.summary.totalGuests ?? 0,
    totalResponses: analytics.summary.guestsResponded ?? 0,
    responseRate: analytics.summary.responseRate ?? 0,
    plusOneCount,
    mealSummary,
  };
}

export function rsvpWidthToCss(width: RsvpSectionWidth) {
  switch (width) {
    case 'narrow':
      return '88%';
    case 'full':
      return '100%';
    default:
      return '94%';
  }
}

export function rsvpButtonHoverClass(hover: RsvpButtonHover) {
  switch (hover) {
    case 'lift':
      return 'rsvp-btn-lift';
    case 'glow':
      return 'rsvp-btn-glow';
    case 'scale':
      return 'rsvp-btn-scale';
    default:
      return '';
  }
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export interface RsvpValidationResult {
  isValid: boolean;
  errors: {
    sectionTitle?: string;
    attendance?: string;
    deadline?: string;
    meals?: string;
  };
}

export function validateRsvpDetails(
  section: InvitationSection | undefined,
  invitation?: Invitation | null,
): RsvpValidationResult {
  const details = parseRsvpDetails(section, invitation);
  const errors: RsvpValidationResult['errors'] = {};

  if (!details.sectionTitle.trim()) {
    errors.sectionTitle = 'RSVP title is required.';
  }

  if (!details.attendanceOptions.some((option) => option.enabled)) {
    errors.attendance = 'Enable at least one attendance option.';
  }

  if (details.deadline.date) {
    const parsed = new Date(`${details.deadline.date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.deadline = 'Enter a valid RSVP deadline date.';
    }
  }

  const mealFieldEnabled = details.formFields.find((field) => field.key === 'mealPreference')?.enabled;
  if (mealFieldEnabled && details.meals.length === 0) {
    errors.meals = 'Add at least one meal option or disable meal preference.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function defaultRsvpSectionContent() {
  return rsvpDetailsToContent(DEFAULT_RSVP_DETAILS);
}
