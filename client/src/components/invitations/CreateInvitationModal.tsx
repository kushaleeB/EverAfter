import { useState } from 'react';
import { X } from 'lucide-react';
import { createInvitation } from '@/api/invitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { buildCreateSlug, defaultInvitationSections } from '@/lib/invitations';
import type { InvitationTemplate } from '@/types/api';

interface CreateInvitationModalProps {
  eventId: string;
  eventTitle: string;
  templates: InvitationTemplate[];
  onClose: () => void;
  onCreated: (invitationId: string, eventId: string) => void;
}

export function CreateInvitationModal({
  eventId,
  eventTitle,
  templates,
  onClose,
  onCreated,
}: CreateInvitationModalProps) {
  const [headline, setHeadline] = useState(`${eventTitle} Invitation`);
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const title = headline.trim();
    if (!title) {
      setError('Enter a name for your invitation suite.');
      return;
    }

    try {
      setIsLoading(true);
      const invitation = await createInvitation(eventId, {
        slug: buildCreateSlug(title),
        headline: title,
        subheadline: 'Main Invitation & RSVP',
        templateId: templateId || undefined,
        sections: templateId ? undefined : defaultInvitationSections(),
      });
      onCreated(invitation.id, eventId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create invitation.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
        role="dialog"
        aria-labelledby="create-invitation-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-invitation-title" className="font-display text-2xl text-[#4e342e]">
              Create New Suite
            </h2>
            <p className="mt-1 font-body text-sm text-[#6d625a]">
              Start with a blank canvas or choose a curated template.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#9e8e82] hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 font-body text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="suite-name" className="font-body text-xs font-medium text-[#4e342e]">
              Suite Name
            </label>
            <Input
              id="suite-name"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="mt-1.5"
              placeholder="The Minimalist Serif"
            />
          </div>

          <div>
            <label htmlFor="template" className="font-body text-xs font-medium text-[#4e342e]">
              Template (optional)
            </label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
            >
              <option value="">Blank canvas</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#c5a67c] text-white hover:bg-[#b8956a]"
            >
              {isLoading ? 'Creating...' : 'Create Suite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
