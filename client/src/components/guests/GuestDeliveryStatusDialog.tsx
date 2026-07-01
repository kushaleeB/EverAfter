import { formatDate, formatGuestName, INVITE_STATUS_LABELS, resolveGuestInviteStatus } from '@/lib/guests';
import type { Guest } from '@/types/api';

interface GuestDeliveryStatusDialogProps {
  guest: Guest;
  invitationUrl: string;
  open: boolean;
  onClose: () => void;
}

export function GuestDeliveryStatusDialog({
  guest,
  invitationUrl,
  open,
  onClose,
}: GuestDeliveryStatusDialogProps) {
  if (!open) return null;

  const status = resolveGuestInviteStatus(guest);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[#1f1b18]/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="delivery-status-title"
        className="relative w-full max-w-md rounded-2xl border border-[#e8dfd6] bg-[#faf9f6] p-6 shadow-[0_24px_64px_rgba(78,52,46,0.18)]"
      >
        <h2 id="delivery-status-title" className="font-display text-xl text-[#4e342e]">
          Delivery Status
        </h2>
        <p className="mt-1 font-body text-sm text-[#6d625a]">
          {formatGuestName(guest.firstName, guest.lastName)}
        </p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
              Status
            </dt>
            <dd className="mt-1 font-body text-sm text-[#4e342e]">{INVITE_STATUS_LABELS[status]}</dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
              Invitation sent
            </dt>
            <dd className="mt-1 font-body text-sm text-[#4e342e]">{formatDate(guest.inviteSentAt)}</dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
              Invitation opened
            </dt>
            <dd className="mt-1 font-body text-sm text-[#4e342e]">
              {formatDate(guest.inviteOpenedAt ?? null)}
            </dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
              RSVP responded
            </dt>
            <dd className="mt-1 font-body text-sm text-[#4e342e]">
              {formatDate(guest.respondedAt ?? guest.latestRsvp?.respondedAt ?? null)}
            </dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
              Personalized link
            </dt>
            <dd className="mt-1 break-all font-body text-xs text-[#6d625a]">{invitationUrl}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-[#4e342e] px-4 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-[#3e2723]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
