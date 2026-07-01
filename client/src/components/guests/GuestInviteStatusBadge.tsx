import { cn } from '@/lib/utils';
import {
  INVITE_DISPLAY_BADGE,
  INVITE_DISPLAY_LABELS,
  resolveGuestInviteDisplayStatus,
} from '@/lib/guests';
import type { Guest } from '@/types/api';

export function GuestInviteStatusBadge({ guest }: { guest: Guest }) {
  const status = resolveGuestInviteDisplayStatus(guest);

  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.08em]',
        INVITE_DISPLAY_BADGE[status],
      )}
    >
      {INVITE_DISPLAY_LABELS[status]}
    </span>
  );
}
