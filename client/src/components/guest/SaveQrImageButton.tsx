import { ImageDown } from 'lucide-react';
import { saveQrImage } from '@/lib/downloadQr';

interface SaveQrImageButtonProps {
  dataUrl: string;
  guestName: string;
  className?: string;
}

export function SaveQrImageButton({ dataUrl, guestName, className }: SaveQrImageButtonProps) {
  return (
    <button
      type="button"
      onClick={() => void saveQrImage(dataUrl, guestName)}
      className={
        className ??
        'inline-flex items-center justify-center gap-2 rounded-full border border-[#e8dfd6] bg-white px-4 py-2.5 font-body text-sm font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2]'
      }
    >
      <ImageDown className="h-4 w-4" />
      Save Image
    </button>
  );
}
