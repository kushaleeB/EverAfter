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

export type GuestInviteStatus = 'not_sent' | 'sent' | 'opened' | 'responded';

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
  inviteStatus?: GuestInviteStatus;
  inviteSentAt: string | null;
  inviteOpenedAt?: string | null;
  respondedAt?: string | null;
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

export interface InvitationAnalytics {
  publishedInvitation: {
    id: string;
    slug: string;
    headline: string | null;
  } | null;
  totalGuests: number;
  invited: number;
  attending: number;
  declined: number;
  pending: number;
  responseRate: number;
  invitationsSent?: number;
  invitationOpens?: number;
  openRate?: number;
  rsvpReceived?: number;
  byInviteStatus?: Record<GuestInviteStatus, number>;
}

export interface SendInvitationResult {
  status: string;
  sentAt: string | null;
  invitationUrl: string;
  whatsappUrl?: string;
}

export interface BulkSendInvitationResult {
  sent: number;
  failed: number;
  results: Array<{ guestId: string; success: true; data: SendInvitationResult }>;
  errors: Array<{ guestId: string; success: false; message: string }>;
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

export type InvitationStatus = 'draft' | 'published' | 'archived';

export type SectionType =
  | 'hero'
  | 'story'
  | 'schedule'
  | 'gallery'
  | 'rsvp'
  | 'registry'
  | 'custom';

export interface InvitationTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  previewImageUrl: string;
  isPremium: boolean;
}

export interface InvitationSection {
  id: string;
  invitationId: string;
  sectionType: SectionType;
  sortOrder: number;
  content: Record<string, unknown>;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvitationEventSnippet {
  id: string;
  title: string;
  partnerOne: string | null;
  partnerTwo: string | null;
  eventDate: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  coverImageUrl?: string | null;
}

export interface Invitation {
  id: string;
  eventId: string;
  templateId: string | null;
  slug: string;
  status: InvitationStatus;
  headline: string | null;
  subheadline: string | null;
  bodyContent: string | null;
  themeConfig: Record<string, unknown>;
  rsvpDeadline: string | null;
  passwordProtected: boolean;
  publishedAt: string | null;
  viewCount: string;
  createdAt: string;
  updatedAt: string;
  template?: InvitationTemplate | null;
  sections?: InvitationSection[];
  event?: InvitationEventSnippet;
  _count?: {
    sections: number;
    rsvps: number;
  };
}

export interface CreateInvitationPayload {
  templateId?: string;
  slug: string;
  headline?: string;
  subheadline?: string;
  bodyContent?: string;
  themeConfig?: Record<string, unknown>;
  sections?: Array<{
    sectionType: SectionType;
    sortOrder?: number;
    content?: Record<string, unknown>;
    isVisible?: boolean;
  }>;
}

export interface PublishInvitationResult {
  id: string;
  status: InvitationStatus;
  publishedAt: string | null;
  publicSlug: string;
  slug: string;
  publicUrl: string;
}

export interface UpdateInvitationPayload {
  slug?: string;
  headline?: string;
  subheadline?: string;
  bodyContent?: string;
  themeConfig?: Record<string, unknown>;
  status?: InvitationStatus;
  rsvpDeadline?: string | null;
}

export interface UpdateSectionPayload {
  sectionType?: SectionType;
  sortOrder?: number;
  content?: Record<string, unknown>;
  isVisible?: boolean;
}
