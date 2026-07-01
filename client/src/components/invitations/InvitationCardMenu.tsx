import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Link2,
  MoreVertical,
  Share2,
  Trash2,
  Undo2,
  Files,
} from 'lucide-react';
import { copyInvitationLink } from '@/lib/sharing';
import { resolvePublicInviteUrl } from '@/lib/invitationUrls';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/types/api';

export type InvitationCardMenuAction =
  | 'open'
  | 'copy'
  | 'share'
  | 'unpublish'
  | 'duplicate'
  | 'delete';

interface InvitationCardMenuProps {
  invitation: Invitation;
  onAction: (action: InvitationCardMenuAction) => void;
  onCopySuccess?: () => void;
  className?: string;
}

const MENU_ITEMS: Array<{
  action: InvitationCardMenuAction;
  label: string;
  icon: typeof ExternalLink;
  publishedOnly?: boolean;
  draftOnly?: boolean;
  destructive?: boolean;
}> = [
  { action: 'open', label: 'Open Invitation', icon: ExternalLink, publishedOnly: true },
  { action: 'copy', label: 'Copy Link', icon: Copy, publishedOnly: true },
  { action: 'share', label: 'Share', icon: Share2, publishedOnly: true },
  { action: 'unpublish', label: 'Unpublish', icon: Undo2, publishedOnly: true },
  { action: 'duplicate', label: 'Duplicate', icon: Files },
  { action: 'delete', label: 'Delete', icon: Trash2, destructive: true },
];

export function InvitationCardMenu({
  invitation,
  onAction,
  onCopySuccess,
  className,
}: InvitationCardMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isPublished = invitation.status === 'published';

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const visibleItems = MENU_ITEMS.filter((item) => {
    if (item.publishedOnly && !isPublished) return false;
    if (item.draftOnly && isPublished) return false;
    return true;
  });

  async function handleSelect(action: InvitationCardMenuAction) {
    setOpen(false);

    if (action === 'copy') {
      const url = resolvePublicInviteUrl(invitation.slug);
      const ok = await copyInvitationLink(url);
      if (ok) onCopySuccess?.();
      return;
    }

    onAction(action);
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="shrink-0 rounded-lg p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
        aria-label={`Options for ${invitation.headline ?? invitation.slug}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-[#e8dfd6] bg-white py-1 shadow-[0_12px_40px_rgba(78,52,46,0.12)]"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                type="button"
                role="menuitem"
                onClick={() => void handleSelect(item.action)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-body text-sm transition-colors hover:bg-[#faf7f2]',
                  item.destructive ? 'text-red-700 hover:bg-red-50' : 'text-[#4e342e]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
          {!isPublished && (
            <div className="border-t border-[#f0e6e1] px-3.5 py-2 font-body text-[11px] text-[#9e8e82]">
              <span className="inline-flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Publish to get a share link
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
