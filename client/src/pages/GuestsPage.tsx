import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector } from '@/components/dashboard/EventSelector';
import { GuestBulkActionsBar } from '@/components/guests/GuestBulkActionsBar';
import {
  GuestInviteMenu,
  type GuestInviteAction,
} from '@/components/guests/GuestInviteMenu';
import { GuestInviteStatusBadge } from '@/components/guests/GuestInviteStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/Toast';
import {
  createGuest,
  deleteGuest,
  getInvitationAnalytics,
  getRsvpSummary,
  importGuestsCsv,
  listGuests,
  markInviteSent,
  sendBulkGuestInvitations,
  sendGuestInvitation,
} from '@/api/guests';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { buildPublicInviteUrl } from '@/lib/invitationUrls';
import { buildGuestWhatsAppUrl, exportGuestLinksCsv } from '@/lib/guestInvites';
import { openEmailShare } from '@/lib/sharing';
import {
  CATEGORY_LABELS,
  formatGuestName,
  RSVP_STATUS_LABELS,
  resolveGuestInviteDisplayStatus,
} from '@/lib/guests';
import { cn } from '@/lib/utils';
import type {
  Guest,
  GuestCategory,
  InvitationAnalytics,
  RsvpStatus,
  RsvpSummary,
} from '@/types/api';

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
  const { toast, showToast } = useToast();
  const {
    events,
    eventId,
    selectedEvent,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useSelectedEvent();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<RsvpSummary | null>(null);
  const [analytics, setAnalytics] = useState<InvitationAnalytics | null>(null);
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState<GuestCategory | 'all'>('all');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | 'all'>('all');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    category: 'other' as GuestCategory,
    partySize: 1,
  });

  const invitationSlug = analytics?.publishedInvitation?.slug ?? null;

  const loadGuests = useCallback(async () => {
    if (!eventId) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const [guestResult, summaryResult, analyticsResult] = await Promise.all([
        listGuests(eventId, {
          search: search || undefined,
          category: category === 'all' ? undefined : category,
          rsvpStatus: rsvpFilter === 'all' ? undefined : rsvpFilter,
          limit: 100,
          sortBy: 'lastName',
          sortOrder: 'asc',
        }),
        getRsvpSummary(eventId),
        getInvitationAnalytics(eventId),
      ]);
      setGuests(guestResult.data);
      setSummary(summaryResult);
      setAnalytics(analyticsResult);
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to load guests.');
      setGuests([]);
      setSummary(null);
      setAnalytics(null);
    } finally {
      setPageLoading(false);
    }
  }, [eventId, search, category, rsvpFilter]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) setSearch(query);
  }, [searchParams]);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [eventId, guests.length]);

  const selectedGuests = guests.filter((guest) => selectedIds.has(guest.id));
  const allSelected = guests.length > 0 && selectedIds.size === guests.length;

  function toggleGuestSelection(guestId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(guestId)) next.delete(guestId);
      else next.add(guestId);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(guests.map((guest) => guest.id)));
  }

  async function markGuestShared(guest: Guest) {
    if (!eventId) return;
    try {
      setSendingGuestId(guest.id);
      await markInviteSent(eventId, guest.id);
      showToast('Invitation marked as shared.');
      await loadGuests();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to update guest status.');
    } finally {
      setSendingGuestId(null);
    }
  }

  async function handleGuestInviteAction(guest: Guest, action: GuestInviteAction) {
    if (!invitationSlug) {
      showToast('Publish an invitation before sharing with guests.');
      return;
    }

    const publicUrl = buildPublicInviteUrl(invitationSlug);

    switch (action) {
      case 'mark_shared':
        await markGuestShared(guest);
        break;
      case 'copy':
        await markGuestShared(guest);
        break;
      case 'preview':
        await markGuestShared(guest);
        break;
      case 'email':
        if (!guest.email) {
          openEmailShare(publicUrl);
        } else {
          try {
            setSendingGuestId(guest.id);
            await sendGuestInvitation(eventId!, guest.id, { channel: 'email' });
            showToast('Invitation email sent.');
            await loadGuests();
          } catch (err) {
            showToast(err instanceof ApiError ? err.message : 'Failed to send email.');
          } finally {
            setSendingGuestId(null);
          }
        }
        break;
      case 'whatsapp':
        window.open(buildGuestWhatsAppUrl(publicUrl), '_blank', 'noopener,noreferrer');
        await markGuestShared(guest);
        break;
      default:
        break;
    }
  }

  async function handleBulkSend() {
    if (!eventId || selectedGuests.length === 0) return;
    if (!invitationSlug) {
      showToast('Publish an invitation before sharing with guests.');
      return;
    }

    const targets = selectedGuests.filter(
      (guest) => resolveGuestInviteDisplayStatus(guest) === 'not_sent',
    );

    if (!targets.length) {
      showToast('All selected guests are already marked as shared.');
      return;
    }

    try {
      setBulkBusy(true);
      const result = await sendBulkGuestInvitations(eventId, {
        guestIds: targets.map((guest) => guest.id),
        channel: 'email',
      });
      showToast(
        result.failed
          ? `Shared with ${result.sent} guest(s). ${result.failed} failed.`
          : `Shared with ${result.sent} guest(s).`,
      );
      await loadGuests();
      setSelectedIds(new Set());
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Bulk share failed.');
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkResend() {
    await handleBulkSend();
  }

  async function handleCopySelectedLinks() {
    if (!invitationSlug) return;
    const publicUrl = buildPublicInviteUrl(invitationSlug);
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast('Invitation link copied.');
    } catch {
      showToast('Unable to copy link.');
    }
  }

  function handleExportSelectedLinks() {
    if (!invitationSlug || selectedGuests.length === 0) return;
    exportGuestLinksCsv(selectedGuests, invitationSlug);
    showToast('Guest links exported.');
  }

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
      showToast(err instanceof ApiError ? err.message : 'Failed to delete guest.');
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
      <Toast message={toast} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Guests</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a]">
            Send personalized invitations, track opens, and manage RSVPs.
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
          {!invitationSlug && (
            <p className="mt-6 rounded-xl border border-[#fff3e0] bg-[#fff8e1] px-4 py-3 font-body text-sm text-[#e65100]">
              Publish an invitation suite before sending personalized guest links.{' '}
              <Link to="/dashboard/invitations" className="font-medium underline">
                Go to Invitations
              </Link>
            </p>
          )}

          {analytics && (
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Total Guests" value={analytics.totalGuests} />
              <StatCard label="Invited" value={analytics.invited} />
              <StatCard label="Attending" value={analytics.attending} />
              <StatCard label="Declined" value={analytics.declined} />
              <StatCard label="Pending" value={analytics.pending} />
              <StatCard label="Response Rate" value={`${analytics.responseRate}%`} />
            </section>
          )}

          {summary && (
            <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Attending" value={summary.byStatus.attending} />
              <StatCard label="Declined" value={summary.byStatus.declined} />
              <StatCard label="Maybe" value={summary.byStatus.maybe} />
              <StatCard label="RSVP Response Rate" value={`${summary.responseRate}%`} />
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

          <GuestBulkActionsBar
            selectedCount={selectedIds.size}
            totalCount={guests.length}
            allSelected={allSelected}
            busy={bulkBusy}
            onSelectAll={toggleSelectAll}
            onClearSelection={() => setSelectedIds(new Set())}
            onSend={() => void handleBulkSend()}
            onResend={() => void handleBulkResend()}
            onCopyLinks={() => void handleCopySelectedLinks()}
            onExport={handleExportSelectedLinks}
          />

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
                  placeholder="Email (recommended for invites)"
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
                <table className="w-full min-w-[980px] text-left">
                  <thead>
                    <tr className="border-b border-[#e8dfd6] bg-[#faf7f2]">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all guests"
                          className="h-4 w-4 rounded border-[#e8dfd6]"
                        />
                      </th>
                      {['Guest', 'Email', 'Category', 'Party', 'RSVP', 'Invitation', 'Actions', ''].map(
                        (heading) => (
                          <th
                            key={heading || 'actions'}
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
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(guest.id)}
                              onChange={() => toggleGuestSelection(guest.id)}
                              aria-label={`Select ${formatGuestName(guest.firstName, guest.lastName)}`}
                              className="h-4 w-4 rounded border-[#e8dfd6]"
                            />
                          </td>
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
                          <td className="px-4 py-4">
                            <GuestInviteStatusBadge guest={guest} />
                          </td>
                          <td className="px-4 py-4">
                            <GuestInviteMenu
                              guest={guest}
                              invitationSlug={invitationSlug}
                              sending={sendingGuestId === guest.id}
                              onCopySuccess={() => showToast('Invitation link copied.')}
                              onAction={(action) => void handleGuestInviteAction(guest, action)}
                            />
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
