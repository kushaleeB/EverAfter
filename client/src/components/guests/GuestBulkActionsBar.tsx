import { Copy, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuestBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSend: () => void;
  onResend: () => void;
  onCopyLinks: () => void;
  onExport: () => void;
  busy?: boolean;
  allSelected: boolean;
}

export function GuestBulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onSend,
  onResend,
  onCopyLinks,
  onExport,
  busy = false,
  allSelected,
}: GuestBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e8dfd6] bg-[#faf7f2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-body text-sm text-[#4e342e]">
        <span className="font-semibold">{selectedCount}</span> of {totalCount} selected
        <button
          type="button"
          onClick={allSelected ? onClearSelection : onSelectAll}
          className="ml-3 text-[#705639] underline-offset-2 hover:underline"
        >
          {allSelected ? 'Clear selection' : 'Select all'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="h-9 bg-[#4e342e] text-white hover:bg-[#3e2723]"
          onClick={onSend}
        >
          <Send className="h-3.5 w-3.5" />
          Send Invitations
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="h-9 border border-[#e8dfd6]"
          onClick={onResend}
        >
          Resend
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="h-9 border border-[#e8dfd6]"
          onClick={onCopyLinks}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Links
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="h-9 border border-[#e8dfd6]"
          onClick={onExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export Links
        </Button>
      </div>
    </div>
  );
}
