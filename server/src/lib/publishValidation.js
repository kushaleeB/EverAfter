import { AppError } from '../errors/AppError.js';

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Server-side publish gate — mirrors critical client validation rules.
 */
export function validateInvitationForPublish(invitation) {
  const issues = [];

  if (!readString(invitation.headline)) {
    issues.push({ field: 'headline', message: 'Invitation title is required.' });
  }

  const sections = invitation.sections ?? [];
  const hero = sections.find((section) => section.sectionType === 'hero' && section.isVisible !== false);

  if (!hero) {
    issues.push({ field: 'hero', message: 'A visible Details (hero) section is required.' });
  } else {
    const content = hero.content ?? {};
    const weddingDate =
      readString(content.weddingDate) ||
      (invitation.event?.eventDate ? String(invitation.event.eventDate).slice(0, 10) : '');

    if (!weddingDate) {
      issues.push({ field: 'weddingDate', message: 'Wedding date is required in Details.' });
    }

    const venueName = readString(content.venueName) || readString(invitation.event?.venueName);
    if (!venueName) {
      issues.push({ field: 'venueName', message: 'Venue name is required in Details.' });
    }
  }

  const rsvp = sections.find((section) => section.sectionType === 'rsvp' && section.isVisible !== false);
  if (rsvp) {
    const content = rsvp.content ?? {};
    if (!readString(content.sectionTitle)) {
      issues.push({ field: 'rsvpTitle', message: 'RSVP section title is required.' });
    }
  }

  if (issues.length > 0) {
    throw AppError.badRequest('Invitation cannot be published until required fields are complete.', issues);
  }
}
