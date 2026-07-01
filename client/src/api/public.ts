import { apiRequest } from '@/lib/api';
import type {
  GuestQrData,
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

  getGuestQr(slug: string, accessToken: string) {
    const params = new URLSearchParams({ accessToken });
    return apiRequest<GuestQrData>(
      `/public/invitations/${slug}/qr?${params.toString()}`,
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

  updateRsvp(slug: string, body: Partial<SubmitRsvpPayload> & { accessToken: string }) {
    return apiRequest<SubmitRsvpResult>(`/public/invitations/${slug}/rsvp`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, { skipAuthRetry: true });
  },
};
