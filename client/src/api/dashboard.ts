import { apiRequest } from '@/lib/api';

export interface DashboardRecentEvent {
  id: string;
  title: string;
  partnerOne: string | null;
  partnerTwo: string | null;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  planningProgress: number;
}

export interface DashboardSummary {
  totalEvents: number;
  publishedInvitations: number;
  totalGuests: number;
  rsvpResponseRate: number;
  recentEvent: DashboardRecentEvent | null;
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>('/dashboard/summary');
}
