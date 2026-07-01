import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  MoreVertical,
  Share2,
} from 'lucide-react';
import { buildPublicInviteUrl } from '@/lib/invitationUrls';
import { buildGuestWhatsAppUrl } from '@/lib/guestInvites';
import { resolveGuestInviteDisplayStatus } from '@/lib/guests';
import { cn } from '@/lib/utils';
import type { Guest } from '@/types/api';

export type GuestInviteAction =
  | 'mark_shared'
  | 'copy'
  | 'preview'
  | 'email'
  | 'whatsapp';

interface GuestInviteMenuProps {
  guest: Guest;
  invitationSlug: string | null;
  onAction: (action: GuestInviteAction) => void;
  onCopySuccess?: () => void;
  busy?: boolean;
  className?: string;
}

export function GuestInviteMenu({
  guest,
  invitationSlug,
  onAction,
  onCopySuccess,
  busy = false,
  className,
}: GuestInviteMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const displayStatus = resolveGuestInviteDisplayStatus(guest);
  const isShared = displayStatus !== 'not_sent';

  const publicUrl = invitationSlug ? buildPublicInviteUrl(invitationSlug) : null;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  async function handleCopy() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      onCopySuccess?.();
      onAction('copy');
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function handlePreview() {
    if (!publicUrl) return;
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
    onAction('preview');
  }

  function handleWhatsApp() {
    if (!publicUrl) return;
    window.open(buildGuestWhatsAppUrl(publicUrl), '_blank', 'noopener,noreferrer');
    setOpen(false);
    onAction('whatsapp');
  }

  function handleEmail() {
    setOpen(false);
    onAction('email');
  }

  const items = [
    { key: 'copy', label: 'Copy Invitation Link', icon: Copy, onClick: () => void handleCopy() },
    { key: 'preview', label: 'Preview Invitation', icon: ExternalLink, onClick: handlePreview },
    { key: 'email', label: 'Share via Email', icon: Mail, onClick: handleEmail },
    { key: 'whatsapp', label: 'Share via WhatsApp', icon: MessageCircle, onClick: handleWhatsApp },
  ] as const;

  return (
    <div ref={rootRef} className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        disabled={!publicUrl || busy}
        onClick={() => onAction(isShared ? 'mark_shared' : 'mark_shared')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8dfd6] bg-white px-3 py-1.5 font-body text-xs font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2] disabled:opacity-50"
      >
        <Share2 className="h-3.5 w-3.5" />
        {busy ? 'Saving...' : isShared ? 'Shared' : 'Mark Shared'}
      </button>

      <div className="relative">
        <button
          type="button"
          disabled={!publicUrl}
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e] disabled:opacity-50"
          aria-label="More invitation actions"
          aria-expanded={open}
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-[#e8dfd6] bg-white py-1 shadow-[0_12px_40px_rgba(78,52,46,0.12)]"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={item.onClick}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-body text-sm text-[#4e342e] transition-colors hover:bg-[#faf7f2]"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
