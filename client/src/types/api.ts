export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type GuestCategory =
  | 'family'
  | 'friends'
  | 'colleagues'
  | 'vip'
  | 'wedding_party'
  | 'other';

export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe';

export interface Event {
  id: string;
  ownerId: string;
  title: string;
  partnerOne: string | null;
  partnerTwo: string | null;
  eventDate: string | null;
  eventTimezone: string;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestRsvpSnippet {
  id: string;
  status: RsvpStatus;
  attendingCount: number;
  respondedAt: string | null;
  invitation?: { id: string; slug: string; headline: string | null };
}

export interface Guest {
  id: string;
  eventId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  category: GuestCategory;
  partySize: number;
  plusOneAllowed: boolean;
  accessToken: string;
  inviteSentAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  rsvps?: GuestRsvpSnippet[];
  rsvpStatus?: RsvpStatus;
  latestRsvp?: GuestRsvpSnippet | null;
}

export interface CreateGuestPayload {
  email?: string;
  firstName: string;
  lastName: string;
  category?: GuestCategory;
  partySize?: number;
  plusOneAllowed?: boolean;
  notes?: string;
}

export interface RsvpSummary {
  totalGuests: number;
  guestsWithRsvp: number;
  guestsWithoutRsvp: number;
  rsvpResponses: number;
  byStatus: Record<RsvpStatus, number>;
  byCategory: Record<string, Record<RsvpStatus, number>>;
  guestCountByCategory: Record<string, number>;
  totalAttendingCount: number;
  responseRate: number;
}

export interface Rsvp {
  id: string;
  guestId: string;
  invitationId: string;
  status: RsvpStatus;
  attendingCount: number;
  dietaryNotes: string | null;
  message: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    category: GuestCategory;
    partySize: number;
    plusOneAllowed: boolean;
  };
  invitation: {
    id: string;
    slug: string;
    headline: string | null;
    eventId: string;
  };
}

export interface RsvpAnalytics {
  summary: {
    totalGuests: number;
    guestsResponded: number;
    guestsPending: number;
    responseRate: number;
    totalAttendingCount: number;
    totalRsvpRecords: number;
  };
  byStatus: Record<RsvpStatus, number>;
  byCategory: Record<string, Record<RsvpStatus, number>>;
  timeline: Array<{ date: string; count: number }>;
  dietaryNotes: Array<{ guest: string; notes: string }>;
  recentMessages: Array<{
    id: string;
    message: string;
    status: RsvpStatus;
    respondedAt: string | null;
    guest: { firstName: string; lastName: string };
  }>;
}

export interface CategoryOption {
  value: GuestCategory;
  label: string;
}
