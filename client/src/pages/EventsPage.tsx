import { useEffect, useState } from 'react';
import { Calendar, MapPin, PartyPopper, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listEvents } from '@/api/events';
import { getRsvpSummary } from '@/api/guests';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { formatEventDate } from '@/lib/dates';
import type { Event } from '@/types/api';
import type { RsvpSummary } from '@/types/api';

interface EventCardData extends Event {
  summary?: RsvpSummary;
}

function EventCard({
  title,
  eventDate,
  venueName,
  venueAddress,
  coverImageUrl,
  summary,
}: EventCardData) {
  const guestTotal = summary?.totalGuests ?? 0;
  const responded = summary?.guestsWithRsvp ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="relative">
        <img
          src={coverImageUrl ?? '/img/events/img_1.png'}
          alt={title}
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4e342e]">
          Event
        </span>
      </div>

      <div className="p-5">
        <h2 className="font-display text-xl text-[#4e342e]">{title}</h2>

        <div className="mt-3 space-y-2">
          {formatEventDate(eventDate) && (
            <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
              <Calendar className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
              {formatEventDate(eventDate)}
            </div>
          )}
          {(venueName || venueAddress) && (
            <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
              <MapPin className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
              {venueName ?? venueAddress}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#f0e6e1] pt-4">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              Guests
            </p>
            <p className="mt-0.5 font-body text-sm font-medium text-[#4e342e]">{guestTotal}</p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              RSVPs
            </p>
            <p className="mt-0.5 font-body text-sm font-medium text-[#4e342e]">{responded}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreateEventCard() {
  return (
    <article className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8dfd6] bg-[#faf9f6] px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5ebe3]">
        <PartyPopper className="h-6 w-6 text-[#c5a67c]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-xl text-[#4e342e]">Plan another celebration</h2>
      <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-[#6d625a]">
        Start organizing a new wedding, engagement party, or rehearsal dinner.
      </p>
      <Button
        variant="ghost"
        className="mt-6 h-11 rounded-lg border border-[#c5a67c] bg-white px-6 font-body text-sm font-medium text-[#4e342e] hover:bg-[#faf7f2]"
        asChild
      >
        <Link to="/dashboard/events/new">
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </Button>
    </article>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await listEvents();
        const withSummaries = await Promise.all(
          data.map(async (event) => {
            try {
              const summary = await getRsvpSummary(event.id);
              return { ...event, summary };
            } catch {
              return { ...event };
            }
          }),
        );

        if (!cancelled) {
          setEvents(withSummaries);
        }
      } catch (err) {
        if (!cancelled) {
          setEvents([]);
          setError(
            err instanceof ApiError ? err.message : 'Failed to load events.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Your Events</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a] md:text-base">
            Manage your upcoming celebrations.
          </p>
        </div>
        <Button className="h-11 shrink-0 rounded-lg bg-[#c5a67c] px-5 text-white hover:bg-[#b8956a]" asChild>
          <Link to="/dashboard/events/new">
            <Plus className="h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 font-body text-sm text-[#6d625a]">Loading events...</p>
      ) : error ? (
        <div className="mt-8">
          <DashboardMessage title="Unable to load events" message={error} />
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8">
          <DashboardMessage
            title="No events yet"
            message="Create your first event to start building invitations and guest lists."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
          <CreateEventCard />
        </section>
      )}
    </DashboardLayout>
  );
}
