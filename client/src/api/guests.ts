import { apiRequest, apiRequestWithMeta, apiUpload } from '@/lib/api';
import type {
  BulkSendInvitationResult,
  CategoryOption,
  CreateGuestPayload,
  Guest,
  GuestCategory,
  InvitationAnalytics,
  RsvpStatus,
  RsvpSummary,
  SendInvitationResult,
} from '@/types/api';

export interface ListGuestsParams {
  page?: number;
  limit?: number;
  category?: GuestCategory;
  rsvpStatus?: RsvpStatus;
  search?: string;
  sortBy?: 'lastName' | 'firstName' | 'createdAt' | 'category' | 'inviteSentAt';
  sortOrder?: 'asc' | 'desc';
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function listGuests(eventId: string, params: ListGuestsParams = {}) {
  return apiRequestWithMeta<Guest[]>(
    `/events/${eventId}/guests${buildQuery(params)}`,
  );
}

export function getGuest(eventId: string, guestId: string) {
  return apiRequest<Guest>(`/events/${eventId}/guests/${guestId}`);
}

export function createGuest(eventId: string, payload: CreateGuestPayload) {
  return apiRequest<Guest>(`/events/${eventId}/guests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateGuest(
  eventId: string,
  guestId: string,
  payload: Partial<CreateGuestPayload>,
) {
  return apiRequest<Guest>(`/events/${eventId}/guests/${guestId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteGuest(eventId: string, guestId: string) {
  return apiRequest<void>(`/events/${eventId}/guests/${guestId}`, {
    method: 'DELETE',
  });
}

export function getGuestCategories(eventId: string) {
  return apiRequest<CategoryOption[]>(`/events/${eventId}/guests/categories`);
}

export function getRsvpSummary(eventId: string) {
  return apiRequest<RsvpSummary>(`/events/${eventId}/guests/rsvp-summary`);
}

export function importGuestsCsv(eventId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<{ imported: number; guests: Guest[] }>(
    `/events/${eventId}/guests/import`,
    formData,
  );
}

export function markInviteSent(eventId: string, guestId: string) {
  return apiRequest<Guest>(`/events/${eventId}/guests/${guestId}/mark-invite-sent`, {
    method: 'POST',
  });
}

export function sendGuestInvitation(
  eventId: string,
  guestId: string,
  payload: { channel?: 'email' | 'link' | 'whatsapp'; invitationId?: string } = {},
) {
  return apiRequest<SendInvitationResult>(
    `/events/${eventId}/guests/${guestId}/send-invitation`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function sendBulkGuestInvitations(
  eventId: string,
  payload: { guestIds: string[]; channel?: 'email' | 'link' | 'whatsapp'; invitationId?: string },
) {
  return apiRequest<BulkSendInvitationResult>(`/events/${eventId}/guests/send-bulk`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getInvitationAnalytics(eventId: string) {
  return apiRequest<InvitationAnalytics>(`/events/${eventId}/guests/invitation-analytics`);
}
