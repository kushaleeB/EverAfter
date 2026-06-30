import { useCallback, useEffect, useState } from 'react';
import { Eye, Mail, MoreVertical, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { listInvitations } from '@/api/invitations';
import { listTemplates } from '@/api/templates';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { CreateInvitationModal } from '@/components/invitations/CreateInvitationModal';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector, eventDisplayName } from '@/components/dashboard/EventSelector';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { ApiError } from '@/lib/api';
import {
  invitationCardImage,
  invitationDisplayTitle,
  invitationMetaLabel,
  invitationSubtitle,
  STATUS_FILTER_OPTIONS,
  statusBadgeClass,
} from '@/lib/invitations';
import { cn } from '@/lib/utils';
import type { Invitation, InvitationStatus, InvitationTemplate } from '@/types/api';

const TEMPLATE_FILTER_ALL = '';

function FilterSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-lg border border-[#e8dfd6] bg-white py-2 pl-4 pr-10 font-body text-sm text-[#4e342e] outline-none transition-colors focus:border-[#c5a67c]"
      >
        {options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9e8e82]">▾</span>
    </div>
  );
}

function StatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span
      className={cn(
        'rounded-md px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em]',
        statusBadgeClass(status),
      )}
    >
      {status}
    </span>
  );
}

function InvitationCard({ invitation, index }: { invitation: Invitation; index: number }) {
  const views = Number(invitation.viewCount) || 0;
  const responses = invitation._count?.rsvps ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="relative">
        <img
          src={invitationCardImage(invitation, index)}
          alt={invitationDisplayTitle(invitation)}
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute left-4 top-4">
          <StatusBadge status={invitation.status} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/dashboard/invitations/${invitation.id}/edit`}
              state={{ eventId: invitation.eventId }}
              className="truncate font-display text-lg text-[#4e342e] hover:text-[#705639]"
            >
              {invitationDisplayTitle(invitation)}
            </Link>
            <p className="mt-1 font-body text-sm text-[#9e8e82]">{invitationSubtitle(invitation)}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label={`Options for ${invitationDisplayTitle(invitation)}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#f0e6e1] pt-4 font-body text-xs text-[#9e8e82]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              {views}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              {responses}
            </span>
          </div>
          <span>{invitationMetaLabel(invitation)}</span>
        </div>
      </div>
    </article>
  );
}

function CreateSuiteCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8dfd6] bg-[#faf9f6] px-6 py-12 text-center transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5ebe3]">
        <Plus className="h-6 w-6 text-[#c5a67c]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-xl text-[#4e342e]">Create New Suite</h2>
      <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-[#6d625a]">
        Start with a blank canvas or choose from our curated templates.
      </p>
    </button>
  );
}

export function InvitationsPage() {
  const navigate = useNavigate();
  const {
    events,
    eventId,
    selectedEvent,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useSelectedEvent();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadInvitations = useCallback(async () => {
    if (!eventId) {
      setInvitations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await listInvitations(eventId, {
        limit: 50,
        status: (statusFilter || undefined) as InvitationStatus | undefined,
        templateId: templateFilter || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      setInvitations(data);
    } catch (err) {
      setInvitations([]);
      setError(err instanceof ApiError ? err.message : 'Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter, templateFilter]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const templateOptions = [
    { label: 'All Templates', value: TEMPLATE_FILTER_ALL },
    ...templates.map((t) => ({ label: t.name, value: t.id })),
  ];

  function handleCreated(invitationId: string, createdEventId: string) {
    setShowCreateModal(false);
    navigate(`/dashboard/invitations/${invitationId}/edit`, {
      state: { eventId: createdEventId },
    });
  }

  return (
    <DashboardLayout headerVariant="search">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Digital Invitations</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Manage your bespoke digital suites. Craft elegant experiences for your guests from
            save-the-dates to final RSVPs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {events.length > 0 && (
            <EventSelector
              events={events}
              value={eventId}
              onChange={selectEvent}
              disabled={eventsLoading}
            />
          )}
          <FilterSelect
            id="status-filter"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[...STATUS_FILTER_OPTIONS]}
          />
          <FilterSelect
            id="template-filter"
            value={templateFilter}
            onChange={setTemplateFilter}
            options={templateOptions}
          />
        </div>
      </div>

      {eventsError && (
        <div className="mt-8">
          <DashboardMessage
            title="Unable to load events"
            message={eventsError}
            actionLabel="Sign In"
            actionTo="/login"
          />
        </div>
      )}

      {!eventsError && !eventsLoading && !eventId && (
        <div className="mt-8">
          <DashboardMessage
            title="No event selected"
            message="Create an event first, then build invitation suites for your guests."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      )}

      {!eventsError && eventId && loading && (
        <p className="mt-8 font-body text-sm text-[#6d625a]">Loading invitations...</p>
      )}

      {!eventsError && eventId && !loading && error && (
        <div className="mt-8">
          <DashboardMessage title="Unable to load invitations" message={error} />
        </div>
      )}

      {!eventsError && eventId && !loading && !error && (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <CreateSuiteCard onClick={() => setShowCreateModal(true)} />
          {invitations.map((invitation, index) => (
            <InvitationCard key={invitation.id} invitation={invitation} index={index} />
          ))}
        </section>
      )}

      {showCreateModal && eventId && selectedEvent && (
        <CreateInvitationModal
          eventId={eventId}
          eventTitle={eventDisplayName(selectedEvent)}
          templates={templates}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </DashboardLayout>
  );
}
