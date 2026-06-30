import { apiRequest, apiRequestWithMeta } from '@/lib/api';
import type { Rsvp, RsvpAnalytics, RsvpStatus } from '@/types/api';

export interface ListRsvpsParams {
  page?: number;
  limit?: number;
  status?: RsvpStatus;
  invitationId?: string;
  search?: string;
  sortBy?: 'respondedAt' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateRsvpPayload {
  status?: RsvpStatus;
  attendingCount?: number;
  dietaryNotes?: string;
  message?: string;
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

export function listRsvps(eventId: string, params: ListRsvpsParams = {}) {
  return apiRequestWithMeta<Rsvp[]>(
    `/events/${eventId}/rsvps${buildQuery(params)}`,
  );
}

export function getRsvpAnalytics(eventId: string) {
  return apiRequest<RsvpAnalytics>(`/events/${eventId}/rsvps/analytics`);
}

export function updateRsvp(
  eventId: string,
  rsvpId: string,
  payload: UpdateRsvpPayload,
) {
  return apiRequest<Rsvp>(`/events/${eventId}/rsvps/${rsvpId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
