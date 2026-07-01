export const INVITATION_QR_SIZE = 300;
export const INVITATION_QR_LEVEL = 'H' as const;
export const INVITATION_QR_COLORS = {
  bg: '#ffffff',
  fg: '#4e342e',
} as const;

function slugifyFileName(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'invitation';
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadInvitationQrPng(canvas: HTMLCanvasElement, slug: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    triggerDownload(blob, `everafter-invite-${slugifyFileName(slug)}.png`);
  }, 'image/png');
}

export function downloadInvitationQrSvg(svg: SVGSVGElement, slug: string) {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, `everafter-invite-${slugifyFileName(slug)}.svg`);
}

export function printInvitationQr(canvas: HTMLCanvasElement, publicUrl: string) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) return;

  const imageSrc = canvas.toDataURL('image/png');
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Invitation QR Code</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: Georgia, 'Times New Roman', serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
        text-align: center;
        color: #4e342e;
      }
      img {
        width: ${INVITATION_QR_SIZE}px;
        height: ${INVITATION_QR_SIZE}px;
      }
      p { margin-top: 16px; font-size: 12px; line-height: 1.5; max-width: 320px; word-break: break-all; }
      @media print {
        body { padding: 0; }
      }
    </style>
  </head>
  <body>
    <img src="${imageSrc}" alt="Invitation QR code" width="${INVITATION_QR_SIZE}" height="${INVITATION_QR_SIZE}" />
    <p>Scan to view our invitation</p>
    <p>${publicUrl}</p>
  </body>
</html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export async function shareInvitationQr(canvas: HTMLCanvasElement, slug: string): Promise<boolean> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!blob) return false;

  const fileName = `everafter-invite-${slugifyFileName(slug)}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Invitation QR Code',
        text: 'Scan to view our wedding invitation.',
      });
      return true;
    }
  } catch {
    // User cancelled or share failed — fall through to download.
  }

  downloadInvitationQrPng(canvas, slug);
  return false;
}

export const invitationQrRenderProps = {
  size: INVITATION_QR_SIZE,
  level: INVITATION_QR_LEVEL,
  bgColor: INVITATION_QR_COLORS.bg,
  fgColor: INVITATION_QR_COLORS.fg,
  includeMargin: true,
} as const;
