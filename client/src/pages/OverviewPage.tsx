import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudUpload,
  FileText,
  Mail,
  MapPin,
  UserPlus,
  Users,
} from 'lucide-react';
import { getRsvpAnalytics } from '@/api/rsvps';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector } from '@/components/dashboard/EventSelector';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { ApiError } from '@/lib/api';
import { daysUntil, formatEventDate } from '@/lib/dates';
import type { RsvpAnalytics } from '@/types/api';

const HERO_IMAGE = '/img/overview/Image.png';

const quickActions = [
  {
    title: 'Design Invitation',
    description: 'Open studio editor',
    icon: FileText,
    to: '/dashboard/invitations',
  },
  {
    title: 'Manage Guest List',
    description: 'Import or add manually',
    icon: UserPlus,
    to: '/dashboard/guests',
  },
  {
    title: 'Upload Media',
    description: 'Add engagement photos',
    icon: CloudUpload,
    to: '/dashboard/media',
  },
];

export function OverviewPage() {
  const {
    selectedEvent,
    events,
    eventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useSelectedEvent();
  const [analytics, setAnalytics] = useState<RsvpAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedEvent) {
      setAnalytics(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoadingAnalytics(true);
      setError(null);

      try {
        const data = await getRsvpAnalytics(selectedEvent.id);
        if (!cancelled) {
          setAnalytics(data);
        }
      } catch (err) {
        if (!cancelled) {
          setAnalytics(null);
          setError(
            err instanceof ApiError ? err.message : 'Failed to load overview data.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAnalytics(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [selectedEvent]);

  const loading = eventsLoading || loadingAnalytics;
  const hasEvent = Boolean(selectedEvent);
  const daysToGo = daysUntil(selectedEvent?.eventDate ?? null);
  const eventDate = formatEventDate(selectedEvent?.eventDate ?? null, {
    month: 'short',
    day: 'numeric',
  });
  const eventYear = selectedEvent?.eventDate
    ? new Date(selectedEvent.eventDate).getFullYear()
    : null;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Overview</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a]">
            A snapshot of your selected event.
          </p>
        </div>
        {events.length > 0 && (
          <EventSelector
            events={events}
            value={eventId}
            onChange={selectEvent}
            disabled={eventsLoading}
          />
        )}
      </div>

      {eventsError && (
        <DashboardMessage
          title="Unable to load events"
          message={eventsError}
          actionLabel="Sign In"
          actionTo="/login"
        />
      )}

      {!eventsError && loading ? (
        <p className="font-body text-sm text-[#6d625a]">Loading overview...</p>
      ) : !eventsError && !hasEvent ? (
        <DashboardMessage
          title="No event selected"
          message="Create an event to see RSVP progress, guest totals, and recent activity here."
          actionLabel="Create Event"
          actionTo="/dashboard/events/new"
        />
      ) : !eventsError && error ? (
        <DashboardMessage title="Unable to load overview" message={error} />
      ) : (
        <>
          <section className="relative overflow-hidden rounded-2xl">
            <img
              src={selectedEvent?.coverImageUrl ?? HERO_IMAGE}
              alt={selectedEvent?.title ?? 'Event cover'}
              className="aspect-[21/9] min-h-[280px] w-full object-cover md:min-h-[320px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
              <div className="w-full max-w-lg rounded-2xl bg-white/95 px-6 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm md:px-8 md:py-8">
                <span className="inline-block rounded-md bg-[#f5ebe3] px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#705639]">
                  Upcoming Event
                </span>
                <h2 className="mt-4 font-display text-3xl text-[#4e342e] md:text-4xl">
                  {selectedEvent?.title}
                </h2>
                {(selectedEvent?.venueName || selectedEvent?.venueAddress) && (
                  <div className="mt-3 flex items-center gap-2 font-body text-sm text-[#6d625a]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
                    {selectedEvent?.venueName ?? selectedEvent?.venueAddress}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#e8dfd6] bg-white px-4 py-3 text-center">
                    <p className="font-display text-2xl text-[#4e342e]">
                      {daysToGo ?? '—'}
                    </p>
                    <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
                      Days to Go
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e8dfd6] bg-white px-4 py-3 text-center">
                    <p className="font-display text-lg text-[#4e342e]">
                      {eventDate ?? '—'}
                    </p>
                    <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
                      {eventYear ?? 'Date TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 md:grid-cols-2">
            <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-xs text-[#9e8e82]">Total Guests</p>
                  <p className="mt-2 font-display text-3xl text-[#4e342e]">
                    {analytics?.summary.totalGuests ?? 0}
                  </p>
                  <p className="mt-1 font-body text-sm text-[#6d625a]">Invited</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5ebe3]">
                  <Users className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f5ebe3]">
                <div
                  className="h-full rounded-full bg-[#4e342e]"
                  style={{ width: `${analytics?.summary.responseRate ?? 0}%` }}
                />
              </div>
            </article>

            <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-body text-xs text-[#9e8e82]">RSVP Rate</p>
                  <p className="mt-2 font-display text-3xl text-[#4e342e]">
                    {analytics?.summary.responseRate ?? 0}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5ebe3]">
                  <Mail className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-5 flex gap-6 font-body text-sm">
                <div>
                  <span className="font-semibold text-[#4e342e]">
                    {analytics?.byStatus?.attending ?? 0}
                  </span>
                  <span className="ml-1 text-[#6d625a]">Accepted</span>
                </div>
                <div>
                  <span className="font-semibold text-[#c45c5c]">
                    {analytics?.byStatus?.declined ?? 0}
                  </span>
                  <span className="ml-1 text-[#6d625a]">Declined</span>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h2 className="font-body text-sm font-semibold text-[#4e342e]">Recent Activity</h2>
              {analytics && analytics.recentMessages.length > 0 ? (
                <ul className="mt-5 space-y-4">
                  {analytics.recentMessages.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#faf7f2]">
                        <Mail className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm text-[#4e342e]">
                          {item.guest.firstName} {item.guest.lastName} RSVP&apos;d {item.status}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-[#9e8e82]">
                          {item.respondedAt
                            ? formatEventDate(item.respondedAt)
                            : 'Recently'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 font-body text-sm text-[#6d625a]">No recent RSVP activity yet.</p>
              )}
            </article>

            <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h2 className="font-body text-sm font-semibold text-[#4e342e]">Quick Actions</h2>
              <div className="mt-4 space-y-3">
                {quickActions.map(({ title, description, icon: Icon, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="flex w-full items-center gap-4 rounded-xl border border-[#e8dfd6] bg-[#faf9f6] px-4 py-4 text-left transition-colors hover:bg-[#faf7f2]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                      <Icon className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-[#4e342e]">{title}</p>
                      <p className="mt-0.5 font-body text-xs text-[#9e8e82]">{description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
