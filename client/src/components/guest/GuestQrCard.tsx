import type { GuestQrData } from '@/types/public';

interface GuestQrCardProps {
  qr: GuestQrData;
  eventName: string;
}

export function GuestQrCard({ qr, eventName }: GuestQrCardProps) {
  const guestName = `${qr.guest.firstName} ${qr.guest.lastName}`.trim();

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white shadow-[0_12px_40px_rgba(78,52,46,0.08)]">
      <div className="border-b border-[#f0ebe4] bg-[#faf7f2] px-5 py-4 text-center">
        <p className="font-display text-lg text-[#4e342e]">{guestName}</p>
        <p className="mt-1 font-body text-xs uppercase tracking-[0.14em] text-[#9e8e82]">{eventName}</p>
      </div>

      <div className="px-5 py-6">
        <div className="mx-auto flex max-w-[220px] items-center justify-center rounded-xl border border-[#f0ebe4] bg-[#fcf9f8] p-4">
          <img src={qr.dataUrl} alt={`QR code for ${guestName}`} className="h-auto w-full" />
        </div>
        <p className="mt-4 text-center font-body text-xs leading-relaxed text-[#6d625a]">
          Please save this QR code and present it at the venue entrance.
        </p>
      </div>
    </div>
  );
}
