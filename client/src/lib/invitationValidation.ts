import type { Invitation, InvitationSection, SectionType } from '@/types/api';
import { SECTION_FLOW_LABELS } from '@/lib/invitations';
import type { GalleryValidationResult } from '@/lib/gallerySection';
import type { HeroValidationResult } from '@/lib/heroSection';
import type { RsvpValidationResult } from '@/lib/rsvpSection';
import { parseScheduleDetails, type ScheduleValidationResult } from '@/lib/scheduleSection';
import type { StoryValidationResult } from '@/lib/storySection';

export interface InvitationValidationState {
  isValid: boolean;
  hero: HeroValidationResult;
  story: StoryValidationResult;
  schedule: ScheduleValidationResult;
  gallery: GalleryValidationResult;
  rsvp: RsvpValidationResult;
}

export interface ValidationIssue {
  id: string;
  sectionType: SectionType;
  sectionId: string;
  sectionLabel: string;
  fieldLabel: string;
  message: string;
  panelKey?: string;
  expandEventId?: string;
}

const HERO_FIELD_LABELS: Record<string, string> = {
  coupleNames: 'Couple Names',
  weddingDate: 'Event Date',
  venueName: 'Venue Name',
};

const STORY_FIELD_LABELS: Record<string, string> = {
  title: 'Story Title',
};

const SCHEDULE_FIELD_LABELS: Record<string, string> = {
  title: 'Event Title',
  date: 'Event Date',
  startTime: 'Start Time',
  venueName: 'Venue Name',
};

const RSVP_FIELD_LABELS: Record<string, string> = {
  sectionTitle: 'RSVP Title',
  attendance: 'Attendance Options',
  deadline: 'RSVP Deadline',
  meals: 'Meal Options',
};

const GALLERY_FIELD_LABELS: Record<string, string> = {
  images: 'Gallery Photos',
  maxImages: 'Photo Limit',
};

function sectionByType(sections: InvitationSection[], type: SectionType) {
  return sections.find((section) => section.sectionType === type) ?? null;
}

export function buildValidationIssues(
  sections: InvitationSection[],
  validation: InvitationValidationState,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const heroSection = sectionByType(sections, 'hero');
  if (heroSection) {
    for (const [key, message] of Object.entries(validation.hero.errors)) {
      if (!message) continue;
      issues.push({
        id: `hero:${key}`,
        sectionType: 'hero',
        sectionId: heroSection.id,
        sectionLabel: SECTION_FLOW_LABELS.hero,
        fieldLabel: HERO_FIELD_LABELS[key] ?? key,
        message,
      });
    }
  }

  const storySection = sectionByType(sections, 'story');
  if (storySection) {
    if (validation.story.errors.title) {
      issues.push({
        id: 'story:title',
        sectionType: 'story',
        sectionId: storySection.id,
        sectionLabel: SECTION_FLOW_LABELS.story,
        fieldLabel: STORY_FIELD_LABELS.title,
        message: validation.story.errors.title,
        panelKey: 'story-content',
      });
    }

    for (const [eventId, eventErrors] of Object.entries(validation.story.errors.timelineEvents ?? {})) {
      if (eventErrors?.title) {
        issues.push({
          id: `story:timeline:${eventId}:title`,
          sectionType: 'story',
          sectionId: storySection.id,
          sectionLabel: SECTION_FLOW_LABELS.story,
          fieldLabel: 'Timeline Event Title',
          message: eventErrors.title,
          panelKey: 'story-timeline',
        });
      }
    }
  }

  const scheduleSection = sectionByType(sections, 'schedule');
  if (scheduleSection && validation.schedule.errors.events) {
    const scheduleDetails = parseScheduleDetails(scheduleSection);
    for (const [eventId, eventErrors] of Object.entries(validation.schedule.errors.events)) {
      const event = scheduleDetails.items.find((item) => item.id === eventId);
      const eventName = event?.title?.trim() || 'Event';
      for (const [fieldKey, message] of Object.entries(eventErrors)) {
        if (!message) continue;
        const baseLabel = SCHEDULE_FIELD_LABELS[fieldKey] ?? fieldKey;
        issues.push({
          id: `schedule:${eventId}:${fieldKey}`,
          sectionType: 'schedule',
          sectionId: scheduleSection.id,
          sectionLabel: SECTION_FLOW_LABELS.schedule,
          fieldLabel: eventName !== 'Event' ? `${eventName} · ${baseLabel}` : baseLabel,
          message,
          panelKey: 'schedule-events',
          expandEventId: eventId,
        });
      }
    }
  }

  const gallerySection = sectionByType(sections, 'gallery');
  if (gallerySection) {
    for (const [key, message] of Object.entries(validation.gallery.errors)) {
      if (!message) continue;
      issues.push({
        id: `gallery:${key}`,
        sectionType: 'gallery',
        sectionId: gallerySection.id,
        sectionLabel: SECTION_FLOW_LABELS.gallery,
        fieldLabel: GALLERY_FIELD_LABELS[key] ?? key,
        message,
        panelKey: 'gallery-photos',
      });
    }
  }

  const rsvpSection = sectionByType(sections, 'rsvp');
  if (rsvpSection) {
    for (const [key, message] of Object.entries(validation.rsvp.errors)) {
      if (!message) continue;
      issues.push({
        id: `rsvp:${key}`,
        sectionType: 'rsvp',
        sectionId: rsvpSection.id,
        sectionLabel: SECTION_FLOW_LABELS.rsvp,
        fieldLabel: RSVP_FIELD_LABELS[key] ?? key,
        message,
        panelKey:
          key === 'sectionTitle'
            ? 'rsvp-content'
            : key === 'deadline'
              ? 'rsvp-deadline'
              : key === 'meals'
                ? 'rsvp-meals'
                : key === 'attendance'
                  ? 'rsvp-attendance'
                  : undefined,
      });
    }
  }

  return issues;
}

export function groupValidationIssuesBySection(issues: ValidationIssue[]) {
  const groups = new Map<string, ValidationIssue[]>();
  for (const issue of issues) {
    const existing = groups.get(issue.sectionLabel) ?? [];
    existing.push(issue);
    groups.set(issue.sectionLabel, existing);
  }
  return groups;
}

export function scrollToValidationField(fieldId: string, container?: HTMLElement | null) {
  const root = container ?? document;
  const el = root.querySelector(`[data-validation-field="${fieldId}"]`);
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusable = el.querySelector<HTMLElement>('input, textarea, select, button');
    focusable?.focus({ preventScroll: true });
  }
}

export function sectionTypesWithIssues(issues: ValidationIssue[]) {
  return new Set(issues.map((issue) => issue.sectionType));
}
