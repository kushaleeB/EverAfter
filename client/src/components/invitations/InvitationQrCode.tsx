import { forwardRef, useImperativeHandle, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { invitationQrRenderProps } from '@/lib/invitationQr';

export interface InvitationQrCodeHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getSvgElement: () => SVGSVGElement | null;
}

interface InvitationQrCodeProps {
  url: string;
  className?: string;
}

/**
 * Renders a print-ready invitation QR. Re-renders automatically when `url` changes.
 */
export const InvitationQrCode = forwardRef<InvitationQrCodeHandle, InvitationQrCodeProps>(
  function InvitationQrCode({ url, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getSvgElement: () => svgContainerRef.current?.querySelector('svg') ?? null,
    }));

    if (!url) return null;

    return (
      <div className={className}>
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          {...invitationQrRenderProps}
          role="img"
          aria-label="QR code linking to the public invitation"
        />
        <div ref={svgContainerRef} className="sr-only" aria-hidden>
          <QRCodeSVG value={url} {...invitationQrRenderProps} />
        </div>
      </div>
    );
  },
);
