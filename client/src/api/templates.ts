import { apiRequest } from '@/lib/api';
import type { InvitationTemplate } from '@/types/api';

export function listTemplates() {
  return apiRequest<InvitationTemplate[]>('/public/templates');
}
