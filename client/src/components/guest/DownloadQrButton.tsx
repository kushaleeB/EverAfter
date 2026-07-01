import { Download } from 'lucide-react';
import { downloadQr } from '@/lib/downloadQr';

interface DownloadQrButtonProps {
  dataUrl: string;
  guestName: string;
  className?: string;
}

export function DownloadQrButton({ dataUrl, guestName, className }: DownloadQrButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadQr(dataUrl, guestName)}
      className={
        className ??
        'inline-flex items-center justify-center gap-2 rounded-full border border-[#e8dfd6] bg-white px-4 py-2.5 font-body text-sm font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2]'
      }
    >
      <Download className="h-4 w-4" />
      Download QR
    </button>
  );
}
