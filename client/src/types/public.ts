import type { Invitation, InvitationSection, Rsvp } from '@/types/api';

export interface PublicGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  partySize: number;
  plusOneAllowed: boolean;
  category: string;
}

export interface PublicInvitationPage {
  invitation: Invitation;
  guest: PublicGuest | null;
  rsvp: Rsvp | null;
}

export interface GuestQrGuest {
  id: string;
  firstName: string;
  lastName: string;
}

export interface GuestQrInvitation {
  id: string;
  slug: string;
}

export interface GuestQrData {
  dataUrl: string;
  rsvpUrl: string;
  guest: GuestQrGuest;
  invitation: GuestQrInvitation;
  checkInPayload?: {
    v: number;
    guestId: string;
    eventId: string;
    invitationId: string;
    accessToken: string;
  };
}

export interface SubmitRsvpPayload {
  accessToken: string;
  status: 'attending' | 'declined' | 'maybe';
  attendingCount: number;
  dietaryNotes?: string;
  message?: string;
}

export interface SubmitRsvpResult {
  rsvp: Rsvp;
  message: string;
}

export interface PublicRsvpSectionProps {
  section: InvitationSection;
  invitation: Invitation;
  accessToken: string;
  guest: PublicGuest;
  existingRsvp?: Rsvp | null;
  onSubmitted: () => void;
}

export const guestQrQueryKey = (slug: string, accessToken: string) =>
  ['public', 'qr', slug, accessToken] as const;
