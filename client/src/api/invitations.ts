import { apiRequest, apiRequestWithMeta } from '@/lib/api';
import type {
  CreateInvitationPayload,
  Invitation,
  InvitationSection,
  PublishInvitationResult,
  RsvpAnalytics,
  UpdateInvitationPayload,
  UpdateSectionPayload,
  InvitationStatus,
} from '@/types/api';

export interface ListInvitationsParams {
  page?: number;
  limit?: number;
  status?: InvitationStatus;
  templateId?: string;
  search?: string;
  sortBy?: string;
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

export function listInvitations(eventId: string, params: ListInvitationsParams = {}) {
  return apiRequestWithMeta<Invitation[]>(
    `/events/${eventId}/invitations${buildQuery(params)}`,
  );
}

export function getInvitation(eventId: string, invitationId: string) {
  return apiRequest<Invitation>(`/events/${eventId}/invitations/${invitationId}`);
}

export function createInvitation(eventId: string, payload: CreateInvitationPayload) {
  return apiRequest<Invitation>(`/events/${eventId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateInvitation(
  eventId: string,
  invitationId: string,
  payload: UpdateInvitationPayload,
) {
  return apiRequest<Invitation>(`/events/${eventId}/invitations/${invitationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function publishInvitation(eventId: string, invitationId: string) {
  return apiRequest<PublishInvitationResult>(
    `/events/${eventId}/invitations/${invitationId}/publish`,
    { method: 'POST' },
  );
}

export function unpublishInvitation(eventId: string, invitationId: string) {
  return apiRequest<Invitation>(
    `/events/${eventId}/invitations/${invitationId}/unpublish`,
    { method: 'POST' },
  );
}

export function duplicateInvitation(eventId: string, invitationId: string) {
  return apiRequest<Invitation>(
    `/events/${eventId}/invitations/${invitationId}/duplicate`,
    { method: 'POST' },
  );
}

export function deleteInvitation(eventId: string, invitationId: string) {
  return apiRequest<void>(`/events/${eventId}/invitations/${invitationId}`, {
    method: 'DELETE',
  });
}

export function listInvitationSections(eventId: string, invitationId: string) {
  return apiRequest<InvitationSection[]>(
    `/events/${eventId}/invitations/${invitationId}/sections`,
  );
}

export function updateInvitationSection(
  eventId: string,
  invitationId: string,
  sectionId: string,
  payload: UpdateSectionPayload,
) {
  return apiRequest<InvitationSection>(
    `/events/${eventId}/invitations/${invitationId}/sections/${sectionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function getInvitationRsvpAnalytics(eventId: string, invitationId: string) {
  return apiRequest<RsvpAnalytics & { invitationId: string }>(
    `/events/${eventId}/invitations/${invitationId}/rsvp-analytics`,
  );
}
