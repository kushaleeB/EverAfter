import type { GuestCategory, RsvpStatus } from '@/types/api';

export const CATEGORY_LABELS: Record<GuestCategory, string> = {
  family: 'Family',
  friends: 'Friends',
  colleagues: 'Colleagues',
  vip: 'VIP',
  wedding_party: 'Wedding Party',
  other: 'Other',
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  pending: 'Pending',
  attending: 'Attending',
  declined: 'Declined',
  maybe: 'Maybe',
};

export function formatGuestName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
