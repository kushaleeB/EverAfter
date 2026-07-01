import type { GuestCategory, GuestInviteStatus, RsvpStatus } from '@/types/api';

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

export const INVITE_STATUS_LABELS: Record<GuestInviteStatus, string> = {
  not_sent: 'Not Sent',
  sent: 'Invitation Shared',
  opened: 'Invitation Shared',
  responded: 'Responded',
};

export const INVITE_STATUS_BADGE: Record<GuestInviteStatus, string> = {
  not_sent: 'bg-[#f0ebe6] text-[#6d625a]',
  sent: 'bg-[#e3f2fd] text-[#1565c0]',
  opened: 'bg-[#e3f2fd] text-[#1565c0]',
  responded: 'bg-[#e8f5e9] text-[#2e7d32]',
};

export type GuestInviteDisplayStatus = 'not_sent' | 'invitation_shared' | 'responded';

export function resolveGuestInviteDisplayStatus(guest: {
  inviteStatus?: GuestInviteStatus;
  inviteSentAt?: string | null;
  inviteOpenedAt?: string | null;
  respondedAt?: string | null;
  rsvpStatus?: RsvpStatus;
}): GuestInviteDisplayStatus {
  const status = resolveGuestInviteStatus(guest);
  if (status === 'responded') return 'responded';
  if (status === 'sent' || status === 'opened') return 'invitation_shared';
  return 'not_sent';
}

export const INVITE_DISPLAY_LABELS: Record<GuestInviteDisplayStatus, string> = {
  not_sent: 'Not Sent',
  invitation_shared: 'Invitation Shared',
  responded: 'Responded',
};

export const INVITE_DISPLAY_BADGE: Record<GuestInviteDisplayStatus, string> = {
  not_sent: 'bg-[#f0ebe6] text-[#6d625a]',
  invitation_shared: 'bg-[#e3f2fd] text-[#1565c0]',
  responded: 'bg-[#e8f5e9] text-[#2e7d32]',
};

export function resolveGuestInviteStatus(guest: {
  inviteStatus?: GuestInviteStatus;
  inviteSentAt?: string | null;
  inviteOpenedAt?: string | null;
  respondedAt?: string | null;
  rsvpStatus?: RsvpStatus;
}): GuestInviteStatus {
  if (guest.inviteStatus) return guest.inviteStatus;
  if (guest.respondedAt || (guest.rsvpStatus && guest.rsvpStatus !== 'pending')) {
    return 'responded';
  }
  if (guest.inviteOpenedAt) return 'opened';
  if (guest.inviteSentAt) return 'sent';
  return 'not_sent';
}

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
