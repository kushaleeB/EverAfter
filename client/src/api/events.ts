import { apiRequest } from '@/lib/api';
import type { Event } from '@/types/api';

export interface CreateEventPayload {
  title: string;
  partnerOne?: string;
  partnerTwo?: string;
  eventDate?: string;
  eventTimezone?: string;
  venueName?: string;
  venueAddress?: string;
}

export function listEvents() {
  return apiRequest<Event[]>('/events');
}

export function getEvent(eventId: string) {
  return apiRequest<Event>(`/events/${eventId}`);
}

export function createEvent(payload: CreateEventPayload) {
  return apiRequest<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
