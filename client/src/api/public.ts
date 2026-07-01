import { apiRequest } from '@/lib/api';
import type {
  GuestQrData,
  PublicGuestRsvpState,
  PublicGuestSearchResult,
  PublicInvitationPage,
  SubmitRsvpPayload,
  SubmitRsvpResult,
} from '@/types/public';

export const publicApi = {
  getPublicPage(slug: string, accessToken?: string) {
    const params = new URLSearchParams();
    if (accessToken) {
      params.set('accessToken', accessToken);
    }
    const query = params.toString();
    return apiRequest<PublicInvitationPage>(
      `/public/invitations/${slug}/page${query ? `?${query}` : ''}`,
      {},
      { skipAuthRetry: true },
    );
  },

  getPublicInvitation(slug: string) {
    return apiRequest<PublicInvitationPage['invitation']>(
      `/public/invitations/${slug}`,
      {},
      { skipAuthRetry: true },
    );
  },

  searchGuests(slug: string, query = '') {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    const qs = params.toString();
    return apiRequest<{ guests: PublicGuestSearchResult[] }>(
      `/public/invitations/${slug}/guests${qs ? `?${qs}` : ''}`,
      {},
      { skipAuthRetry: true },
    ).then((result) => result.guests);
  },

  getGuestRsvp(slug: string, { accessToken, guestId }: { accessToken?: string; guestId?: string }) {
    const params = new URLSearchParams();
    if (accessToken) params.set('accessToken', accessToken);
    if (guestId) params.set('guestId', guestId);
    return apiRequest<PublicGuestRsvpState>(
      `/public/invitations/${slug}/rsvp?${params.toString()}`,
      {},
      { skipAuthRetry: true },
    );
  },

  getGuestQr(slug: string, accessToken: string) {
    const params = new URLSearchParams({ accessToken });
    return apiRequest<GuestQrData>(
      `/public/invitations/${encodeURIComponent(slug)}/qr?${params.toString()}`,
      {},
      { skipAuthRetry: true },
    );
  },

  submitRsvp(slug: string, body: SubmitRsvpPayload) {
    return apiRequest<SubmitRsvpResult>(`/public/invitations/${slug}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, { skipAuthRetry: true });
  },

  updateRsvp(slug: string, body: Partial<SubmitRsvpPayload> & { accessToken?: string; guestId?: string }) {
    return apiRequest<SubmitRsvpResult>(`/public/invitations/${slug}/rsvp`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, { skipAuthRetry: true });
  },
};
