import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Link2, Printer, Share2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InvitationQrCode, type InvitationQrCodeHandle } from '@/components/invitations/InvitationQrCode';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  downloadInvitationQrPng,
  downloadInvitationQrSvg,
  printInvitationQr,
  shareInvitationQr,
} from '@/lib/invitationQr';
import {
  copyInvitationLink,
  getEnabledShareProviders,
  openEmailShare,
  openPublicInvitation,
  openWhatsAppShare,
  type ShareProviderId,
} from '@/lib/sharing';
import { cn } from '@/lib/utils';

interface PublishSuccessModalProps {
  open: boolean;
  publicUrl: string;
  slug: string;
  onClose: () => void;
  onCopySuccess?: () => void;
  variant?: 'publish' | 'share';
}

function ShareActionButton({
  emoji,
  label,
  onClick,
  loading,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-xl border border-[#e8dfd6] bg-white px-4 py-3 text-left font-body text-sm text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2] disabled:opacity-60"
    >
      <span className="text-lg leading-none" aria-hidden>
        {emoji}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function QrActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Download;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex flex-1 min-w-[calc(50%-4px)] items-center justify-center gap-1.5 rounded-xl border border-[#e8dfd6] bg-white px-3 py-2.5 font-body text-xs font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2] disabled:opacity-60 sm:min-w-0 sm:flex-none"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {label}
    </button>
  );
}

export function PublishSuccessModal({
  open,
  publicUrl,
  slug,
  onClose,
  onCopySuccess,
  variant = 'publish',
}: PublishSuccessModalProps) {
  const titleId = useId();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const qrRef = useRef<InvitationQrCodeHandle>(null);
  const [qrBusy, setQrBusy] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleCopyLink = useCallback(async () => {
    const ok = await copyInvitationLink(publicUrl);
    if (ok) onCopySuccess?.();
  }, [publicUrl, onCopySuccess]);

  const withQrCanvas = useCallback(
    (action: (canvas: HTMLCanvasElement) => void) => {
      const canvas = qrRef.current?.getCanvas();
      if (!canvas) return;
      action(canvas);
    },
    [],
  );

  const handleDownloadPng = useCallback(() => {
    withQrCanvas((canvas) => downloadInvitationQrPng(canvas, slug));
  }, [slug, withQrCanvas]);

  const handleDownloadSvg = useCallback(() => {
    const svg = qrRef.current?.getSvgElement();
    if (svg) downloadInvitationQrSvg(svg, slug);
  }, [slug]);

  const handlePrintQr = useCallback(() => {
    withQrCanvas((canvas) => printInvitationQr(canvas, publicUrl));
  }, [publicUrl, withQrCanvas]);

  const handleShareQr = useCallback(async () => {
    const canvas = qrRef.current?.getCanvas();
    if (!canvas) return;
    try {
      setQrBusy(true);
      await shareInvitationQr(canvas, slug);
    } finally {
      setQrBusy(false);
    }
  }, [slug]);

  const runProvider = useCallback(
    async (id: ShareProviderId) => {
      switch (id) {
        case 'copy':
          await handleCopyLink();
          break;
        case 'whatsapp':
          openWhatsAppShare(publicUrl);
          break;
        case 'email':
          openEmailShare(publicUrl);
          break;
        case 'open':
          openPublicInvitation(publicUrl);
          break;
        default:
          break;
      }
    },
    [handleCopyLink, publicUrl],
  );

  const enabledProviders = getEnabledShareProviders().filter(
    (provider) => provider.id !== 'copy' && provider.id !== 'open',
  );

  const panelContent = (
    <>
      <div className="border-b border-[#e8dfd6] bg-white px-6 py-5 sm:rounded-t-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-xl text-[#4e342e] sm:text-2xl">
              {variant === 'share'
                ? 'Share Your Invitation'
                : 'Invitation Published Successfully 🎉'}
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a]">
              {variant === 'share'
                ? 'Share your live wedding invitation using the public link below.'
                : 'Your wedding invitation is now live and ready to share.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[min(75vh,640px)] overflow-y-auto px-6 py-5">
        <label
          htmlFor="publish-public-url"
          className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#9e8e82]"
        >
          Public invitation link
        </label>
        <div className="mt-2 flex gap-2">
          <Input
            id="publish-public-url"
            readOnly
            value={publicUrl}
            className="h-11 flex-1 font-body text-sm text-[#4e342e]"
            onFocus={(event) => event.target.select()}
          />
        </div>

        <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#e8dfd6] bg-[#faf9f6] p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
            Scan to view invitation
          </p>
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            {open && publicUrl ? (
              <InvitationQrCode key={publicUrl} ref={qrRef} url={publicUrl} />
            ) : null}
          </div>
          <p className="mt-3 max-w-xs text-center font-body text-[11px] leading-relaxed text-[#9e8e82]">
            High-resolution QR · print-ready for wedding cards
          </p>

          <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
            <QrActionButton icon={Download} label="PNG" onClick={handleDownloadPng} disabled={qrBusy} />
            <QrActionButton icon={Download} label="SVG" onClick={handleDownloadSvg} disabled={qrBusy} />
            <QrActionButton icon={Link2} label="Copy Link" onClick={() => void handleCopyLink()} />
            <QrActionButton icon={Printer} label="Print" onClick={handlePrintQr} disabled={qrBusy} />
            <QrActionButton
              icon={Share2}
              label="Share QR"
              onClick={() => void handleShareQr()}
              disabled={qrBusy}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {enabledProviders.map((provider) => (
            <ShareActionButton
              key={provider.id}
              emoji={provider.emoji}
              label={provider.label}
              onClick={() => void runProvider(provider.id)}
            />
          ))}

          <ShareActionButton
            emoji="👁️"
            label="Open Public Invitation"
            onClick={() => openPublicInvitation(publicUrl)}
          />
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-[#1f1b18]/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            initial={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 12 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative z-10 w-full overflow-hidden bg-[#faf9f6] shadow-[0_24px_64px_rgba(78,52,46,0.2)]',
              isMobile ? 'rounded-t-3xl' : 'max-w-lg rounded-2xl border border-[#e8dfd6]',
            )}
          >
            {isMobile && (
              <div className="flex justify-center pt-3">
                <span className="h-1 w-10 rounded-full bg-[#e8dfd6]" aria-hidden />
              </div>
            )}
            {panelContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
