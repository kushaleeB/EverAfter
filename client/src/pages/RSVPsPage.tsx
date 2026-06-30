import { useCallback, useEffect, useState } from 'react';
import { CheckSquare, MessageSquare, Utensils } from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector } from '@/components/dashboard/EventSelector';
import { getRsvpAnalytics, listRsvps, updateRsvp } from '@/api/rsvps';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { ApiError } from '@/lib/api';
import { formatDate, formatGuestName, RSVP_STATUS_LABELS } from '@/lib/guests';
import { cn } from '@/lib/utils';
import type { Rsvp, RsvpAnalytics, RsvpStatus } from '@/types/api';

const RSVP_BADGE: Record<RsvpStatus, string> = {
  attending: 'bg-[#e8f5e9] text-[#2e7d32]',
  declined: 'bg-[#f5ebe3] text-[#8d6e63]',
  maybe: 'bg-[#fff8e1] text-[#f57f17]',
  pending: 'bg-[#f0ebe6] text-[#6d625a]',
};

const STATUS_FILTERS: Array<RsvpStatus | 'all'> = [
  'all',
  'pending',
  'attending',
  'declined',
  'maybe',
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <p className="font-body text-xs text-[#9e8e82]">{label}</p>
      <p className="mt-2 font-display text-2xl text-[#4e342e]">{value}</p>
    </article>
  );
}

export function RSVPsPage() {
  const { events, eventId, selectEvent, loading: eventsLoading, error: eventsError } =
    useSelectedEvent();

  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [analytics, setAnalytics] = useState<RsvpAnalytics | null>(null);
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'all'>('all');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRsvps = useCallback(async () => {
    if (!eventId) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const [rsvpResult, analyticsResult] = await Promise.all([
        listRsvps(eventId, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 100,
          sortBy: 'respondedAt',
          sortOrder: 'desc',
        }),
        getRsvpAnalytics(eventId),
      ]);
      setRsvps(rsvpResult.data);
      setAnalytics(analyticsResult);
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to load RSVPs.');
      setRsvps([]);
      setAnalytics(null);
    } finally {
      setPageLoading(false);
    }
  }, [eventId, statusFilter]);

  useEffect(() => {
    void loadRsvps();
  }, [loadRsvps]);

  const handleStatusChange = async (rsvp: Rsvp, status: RsvpStatus) => {
    if (!eventId || rsvp.status === status) return;
    setUpdatingId(rsvp.id);
    try {
      await updateRsvp(eventId, rsvp.id, { status });
      await loadRsvps();
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to update RSVP.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">RSVPs</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a]">
            Track responses, dietary notes, and guest messages in real time.
          </p>
        </div>
        <EventSelector
          events={events}
          value={eventId}
          onChange={selectEvent}
          disabled={eventsLoading}
        />
      </div>

      {eventsError && (
        <div className="mt-6">
          <DashboardMessage
            title="Sign in required"
            message={eventsError}
            actionLabel="Sign In"
            actionTo="/login"
          />
        </div>
      )}

      {!eventsError && !eventsLoading && events.length === 0 && (
        <div className="mt-6">
          <DashboardMessage
            title="No events yet"
            message="Create an event to start collecting RSVPs."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      )}

      {!eventsError && eventId && (
        <>
          {analytics && (
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Guests" value={analytics.summary.totalGuests} />
              <StatCard label="Responded" value={analytics.summary.guestsResponded} />
              <StatCard label="Headcount" value={analytics.summary.totalAttendingCount} />
              <StatCard label="Response Rate" value={`${analytics.summary.responseRate}%`} />
            </section>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'rounded-full px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.08em] transition-colors',
                  statusFilter === status
                    ? 'bg-[#4e342e] text-white'
                    : 'border border-[#e8dfd6] bg-white text-[#6d625a] hover:border-[#c5a67c]',
                )}
              >
                {status === 'all' ? 'All' : RSVP_STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {pageError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-800">
              {pageError}
            </p>
          )}

          <section className="mt-6 overflow-hidden rounded-xl border border-[#e8dfd6] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            {pageLoading ? (
              <p className="px-6 py-12 text-center font-body text-sm text-[#6d625a]">
                Loading RSVPs...
              </p>
            ) : rsvps.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckSquare className="mx-auto h-8 w-8 text-[#c5a67c]" strokeWidth={1.5} />
                <p className="mt-4 font-body text-sm text-[#6d625a]">No RSVP responses yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead>
                    <tr className="border-b border-[#e8dfd6] bg-[#faf7f2]">
                      {['Guest', 'Invitation', 'Status', 'Attending', 'Responded', 'Notes'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="border-b border-[#f0ebe6] last:border-0">
                        <td className="px-4 py-4 font-body text-sm font-medium text-[#4e342e]">
                          {formatGuestName(rsvp.guest.firstName, rsvp.guest.lastName)}
                        </td>
                        <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                          {rsvp.invitation.headline ?? rsvp.invitation.slug}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={rsvp.status}
                            disabled={updatingId === rsvp.id}
                            onChange={(e) =>
                              void handleStatusChange(rsvp, e.target.value as RsvpStatus)
                            }
                            className={cn(
                              'rounded-md border-0 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.08em] outline-none',
                              RSVP_BADGE[rsvp.status],
                            )}
                          >
                            {(Object.keys(RSVP_STATUS_LABELS) as RsvpStatus[]).map((status) => (
                              <option key={status} value={status}>
                                {RSVP_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                          {rsvp.attendingCount}
                        </td>
                        <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                          {formatDate(rsvp.respondedAt)}
                        </td>
                        <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                          {rsvp.dietaryNotes || rsvp.message || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {analytics && analytics.recentMessages.length > 0 && (
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#705639]" />
                  <h2 className="font-display text-lg text-[#4e342e]">Recent Messages</h2>
                </div>
                <ul className="mt-4 space-y-4">
                  {analytics.recentMessages.slice(0, 5).map((item) => (
                    <li key={item.id} className="border-b border-[#f0ebe6] pb-4 last:border-0">
                      <p className="font-body text-sm text-[#4e342e]">
                        {formatGuestName(item.guest.firstName, item.guest.lastName)}
                      </p>
                      <p className="mt-1 font-body text-sm text-[#6d625a]">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-[#705639]" />
                  <h2 className="font-display text-lg text-[#4e342e]">Dietary Notes</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {analytics.dietaryNotes.length === 0 ? (
                    <li className="font-body text-sm text-[#6d625a]">No dietary notes yet.</li>
                  ) : (
                    analytics.dietaryNotes.slice(0, 6).map((item) => (
                      <li
                        key={`${item.guest}-${item.notes}`}
                        className="flex justify-between gap-4 border-b border-[#f0ebe6] pb-3 last:border-0"
                      >
                        <span className="font-body text-sm text-[#4e342e]">{item.guest}</span>
                        <span className="font-body text-sm text-[#6d625a]">{item.notes}</span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
