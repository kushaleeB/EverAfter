export function slugifyGuestName(guestName: string): string {
  return guestName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function downloadQr(dataUrl: string, guestName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `everafter-qr-${slugifyGuestName(guestName)}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function saveQrImage(dataUrl: string, guestName: string) {
  const fileName = `everafter-qr-${slugifyGuestName(guestName)}.png`;

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'EverAfter Guest Pass' });
      return;
    }
  } catch {
    // Fall back to download.
  }

  downloadQr(dataUrl, guestName);
}
