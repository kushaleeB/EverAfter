import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  PartyPopper,
  UserPlus,
} from 'lucide-react';
import { getDashboardSummary } from '@/api/dashboard';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { formatDisplayName, formatEventDate } from '@/lib/dates';
import type { DashboardSummary } from '@/api/dashboard';
import { useAuthStore } from '@/stores/authStore';

const quickActions = [
  { label: 'Create Event', icon: PartyPopper, to: '/dashboard/events/new' },
  { label: 'View Events', icon: Calendar, to: '/dashboard/events' },
  { label: 'Manage Guests', icon: UserPlus, to: '/dashboard/guests' },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl bg-white px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <p className="font-body text-xs text-[#9e8e82]">{label}</p>
      <p className="mt-2 font-display text-3xl text-[#4e342e]">{value}</p>
    </article>
  );
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setError(
            err instanceof ApiError ? err.message : 'Failed to load dashboard data.',
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

  const displayName = formatDisplayName(user?.firstName, user?.lastName);
  const recentEvent = summary?.recentEvent ?? null;
  const hasData = Boolean(summary && summary.totalEvents > 0);

  return (
    <DashboardLayout>
      <section className="rounded-2xl bg-[#f5ebe3]/60 px-6 py-8 md:px-10 md:py-10">
        <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
          {hasData
            ? 'Your forever story is beautifully coming together. Here is an overview of your progress.'
            : 'Create your first event to start planning invitations, guests, and RSVPs.'}
        </p>
      </section>

      {loading ? (
        <p className="mt-6 font-body text-sm text-[#6d625a]">Loading dashboard...</p>
      ) : error ? (
        <div className="mt-6">
          <DashboardMessage title="Unable to load dashboard" message={error} />
        </div>
      ) : !hasData ? (
        <div className="mt-6">
          <DashboardMessage
            title="No events yet"
            message="Your dashboard will populate once you create an event and start inviting guests."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Events" value={summary?.totalEvents ?? 0} />
            <StatCard label="Invitations Published" value={summary?.publishedInvitations ?? 0} />
            <StatCard label="Total Guests" value={summary?.totalGuests ?? 0} />
            <StatCard
              label="RSVP Response Rate"
              value={`${summary?.rsvpResponseRate ?? 0}%`}
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <article className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h2 className="px-5 pt-5 font-body text-sm font-semibold text-[#4e342e]">
                Recent Events
              </h2>
              {recentEvent ? (
                <div className="mt-4 px-5 pb-5">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={recentEvent.coverImageUrl ?? '/img/dashboard/lake.png'}
                      alt={recentEvent.title}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-white/80">
                        Wedding Ceremony
                      </p>
                      <p className="mt-1 font-display text-xl text-white md:text-2xl">
                        {recentEvent.title}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {formatEventDate(recentEvent.eventDate) && (
                      <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
                        <Calendar className="h-4 w-4 text-[#a1887f]" strokeWidth={1.5} />
                        {formatEventDate(recentEvent.eventDate)}
                      </div>
                    )}
                    {(recentEvent.venueName || recentEvent.venueAddress) && (
                      <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
                        <MapPin className="h-4 w-4 text-[#a1887f]" strokeWidth={1.5} />
                        {recentEvent.venueName ?? recentEvent.venueAddress}
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between font-body text-xs text-[#6d625a]">
                      <span>Planning Progress</span>
                      <span className="font-medium text-[#4e342e]">
                        {recentEvent.planningProgress}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f5ebe3]">
                      <div
                        className="h-full rounded-full bg-[#c5a67c]"
                        style={{ width: `${recentEvent.planningProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="px-5 pb-5 pt-4 font-body text-sm text-[#6d625a]">
                  No recent events to display.
                </p>
              )}
            </article>

            <article className="rounded-xl bg-[#faf7f2] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] lg:col-span-2">
              <h2 className="font-body text-sm font-semibold text-[#4e342e]">Quick Actions</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {quickActions.map(({ label, icon: Icon, to }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    className="h-11 justify-start gap-3 rounded-lg border border-[#e8dfd6] bg-white px-4 font-body text-sm font-medium text-[#4e342e] hover:bg-[#faf7f2]"
                    asChild
                  >
                    <Link to={to}>
                      <Icon className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
              <Link
                to="/dashboard/events"
                className="mt-6 inline-flex items-center gap-1 font-body text-sm font-medium text-[#705639] transition-colors hover:text-[#4e342e]"
              >
                View all events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
