import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Mail,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector } from '@/components/dashboard/EventSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createGuest,
  deleteGuest,
  getRsvpSummary,
  importGuestsCsv,
  listGuests,
} from '@/api/guests';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { ApiError } from '@/lib/api';
import { CATEGORY_LABELS, formatGuestName, RSVP_STATUS_LABELS } from '@/lib/guests';
import { cn } from '@/lib/utils';
import type { Guest, GuestCategory, RsvpStatus, RsvpSummary } from '@/types/api';

const RSVP_BADGE: Record<RsvpStatus, string> = {
  attending: 'bg-[#e8f5e9] text-[#2e7d32]',
  declined: 'bg-[#f5ebe3] text-[#8d6e63]',
  maybe: 'bg-[#fff8e1] text-[#f57f17]',
  pending: 'bg-[#f0ebe6] text-[#6d625a]',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as GuestCategory[];
const RSVP_FILTERS: Array<RsvpStatus | 'all'> = [
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

function RsvpBadge({ status }: { status: RsvpStatus }) {
  return (
    <span
      className={cn(
        'rounded-md px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.08em]',
        RSVP_BADGE[status],
      )}
    >
      {RSVP_STATUS_LABELS[status]}
    </span>
  );
}

export function GuestsPage() {
  const [searchParams] = useSearchParams();
  const { events, eventId, selectedEvent, selectEvent, loading: eventsLoading, error: eventsError } =
    useSelectedEvent();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState<GuestCategory | 'all'>('all');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | 'all'>('all');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    category: 'other' as GuestCategory,
    partySize: 1,
  });

  const loadGuests = useCallback(async () => {
    if (!eventId) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const [guestResult, summaryResult] = await Promise.all([
        listGuests(eventId, {
          search: search || undefined,
          category: category === 'all' ? undefined : category,
          rsvpStatus: rsvpFilter === 'all' ? undefined : rsvpFilter,
          limit: 100,
          sortBy: 'lastName',
          sortOrder: 'asc',
        }),
        getRsvpSummary(eventId),
      ]);
      setGuests(guestResult.data);
      setSummary(summaryResult);
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to load guests.');
      setGuests([]);
      setSummary(null);
    } finally {
      setPageLoading(false);
    }
  }, [eventId, search, category, rsvpFilter]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      setSearch(query);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setSaving(true);
    try {
      await createGuest(eventId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        category: form.category,
        partySize: form.partySize,
      });
      setForm({ firstName: '', lastName: '', email: '', category: 'other', partySize: 1 });
      setShowAddForm(false);
      await loadGuests();
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to add guest.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guestId: string) => {
    if (!eventId || !confirm('Remove this guest from the list?')) return;
    try {
      await deleteGuest(eventId, guestId);
      await loadGuests();
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to delete guest.');
    }
  };

  const handleImport = async (file: File) => {
    if (!eventId) return;
    setImporting(true);
    setPageError(null);
    try {
      await importGuestsCsv(eventId, file);
      await loadGuests();
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'CSV import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Guests</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a]">
            Manage your guest list, categories, and invitation status.
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
            message="Create an event first, then add guests to your list."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        </div>
      )}

      {!eventsError && eventId && (
        <>
          {summary && (
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Guests" value={summary.totalGuests} />
              <StatCard label="Attending" value={summary.byStatus.attending} />
              <StatCard label="Pending" value={summary.byStatus.pending} />
              <StatCard
                label="Response Rate"
                value={`${summary.responseRate}%`}
              />
            </section>
          )}

          <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guests..."
                  className="pl-9"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GuestCategory | 'all')}
                className="h-10 rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
              <select
                value={rsvpFilter}
                onChange={(e) => setRsvpFilter(e.target.value as RsvpStatus | 'all')}
                className="h-10 rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
              >
                {RSVP_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All RSVP statuses' : RSVP_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImport(file);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="ghost"
                className="border border-[#e8dfd6] text-[#4e342e] hover:bg-[#faf7f2]"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Importing...' : 'Import CSV'}
              </Button>
              <Button
                type="button"
                className="bg-[#4e342e] text-white hover:bg-[#3e2723]"
                onClick={() => setShowAddForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
                Add Guest
              </Button>
            </div>
          </section>

          {showAddForm && (
            <form
              onSubmit={handleAddGuest}
              className="mt-4 rounded-xl border border-[#e8dfd6] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <h2 className="font-display text-lg text-[#4e342e]">Add Guest</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  required
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
                <Input
                  required
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as GuestCategory }))
                  }
                  className="h-[46px] rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#4e342e] text-white hover:bg-[#3e2723]"
                >
                  {saving ? 'Saving...' : 'Save Guest'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {pageError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-800">
              {pageError}
            </p>
          )}

          <section className="mt-6 overflow-hidden rounded-xl border border-[#e8dfd6] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            {pageLoading ? (
              <p className="px-6 py-12 text-center font-body text-sm text-[#6d625a]">
                Loading guests...
              </p>
            ) : guests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-[#c5a67c]" strokeWidth={1.5} />
                <p className="mt-4 font-body text-sm text-[#6d625a]">
                  {selectedEvent
                    ? `No guests found for ${selectedEvent.title}.`
                    : 'No guests found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-[#e8dfd6] bg-[#faf7f2]">
                      {['Guest', 'Email', 'Category', 'Party', 'RSVP', 'Invite', ''].map(
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
                    {guests.map((guest) => {
                      const status = guest.rsvpStatus ?? 'pending';
                      return (
                        <tr key={guest.id} className="border-b border-[#f0ebe6] last:border-0">
                          <td className="px-4 py-4 font-body text-sm font-medium text-[#4e342e]">
                            {formatGuestName(guest.firstName, guest.lastName)}
                          </td>
                          <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                            {guest.email ?? '—'}
                          </td>
                          <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                            {CATEGORY_LABELS[guest.category]}
                          </td>
                          <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                            {guest.partySize}
                          </td>
                          <td className="px-4 py-4">
                            <RsvpBadge status={status} />
                          </td>
                          <td className="px-4 py-4 font-body text-sm text-[#6d625a]">
                            {guest.inviteSentAt ? (
                              <span className="inline-flex items-center gap-1 text-[#2e7d32]">
                                <Mail className="h-3.5 w-3.5" />
                                Sent
                              </span>
                            ) : (
                              'Not sent'
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => void handleDelete(guest.id)}
                              className="rounded-lg p-2 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#c62828]"
                              aria-label={`Delete ${guest.firstName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-4 font-body text-xs text-[#9e8e82]">
            CSV columns: firstName, lastName, email, partySize, category, plusOneAllowed, notes.{' '}
            <Link to="/dashboard/invitations" className="text-[#705639] hover:underline">
              Manage invitations
            </Link>
          </p>
        </>
      )}
    </DashboardLayout>
  );
}
