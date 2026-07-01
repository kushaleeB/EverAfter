export type ShareProviderId =
  | 'copy'
  | 'whatsapp'
  | 'email'
  | 'qr'
  | 'open'
  | 'facebook'
  | 'instagram'
  | 'messenger'
  | 'telegram'
  | 'sms';

export interface ShareContext {
  url: string;
  title?: string;
}

export interface ShareProvider {
  id: ShareProviderId;
  label: string;
  emoji: string;
  description?: string;
  enabled: boolean;
  action: (context: ShareContext) => void | Promise<void>;
}

const EMAIL_SUBJECT = "You're Invited!";
const EMAIL_BODY_INTRO =
  'We are excited to celebrate our wedding with you.\n\nPlease view our invitation below.\n\n';
const EMAIL_BODY_OUTRO = '\n\nWe hope to celebrate together.';

export async function copyInvitationLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = url;
      input.setAttribute('readonly', '');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}

export function openWhatsAppShare(url: string) {
  const text = encodeURIComponent(url);
  window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
}

export function openEmailShare(url: string) {
  const subject = encodeURIComponent(EMAIL_SUBJECT);
  const body = encodeURIComponent(`${EMAIL_BODY_INTRO}${url}${EMAIL_BODY_OUTRO}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function openPublicInvitation(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Core providers shown in the publish success UI. */
export const SHARE_PROVIDERS: ShareProvider[] = [
  {
    id: 'copy',
    label: 'Copy Invitation Link',
    emoji: '🔗',
    enabled: true,
    action: async ({ url }) => {
      await copyInvitationLink(url);
    },
  },
  {
    id: 'whatsapp',
    label: 'Share via WhatsApp',
    emoji: '📱',
    enabled: true,
    action: ({ url }) => openWhatsAppShare(url),
  },
  {
    id: 'email',
    label: 'Share via Email',
    emoji: '✉️',
    enabled: true,
    action: ({ url }) => openEmailShare(url),
  },
  {
    id: 'open',
    label: 'Open Public Invitation',
    emoji: '👁️',
    enabled: true,
    action: ({ url }) => openPublicInvitation(url),
  },
  // Future providers — enable when product-ready
  {
    id: 'facebook',
    label: 'Share on Facebook',
    emoji: 'Facebook',
    enabled: false,
    action: () => undefined,
  },
  {
    id: 'instagram',
    label: 'Share on Instagram',
    emoji: 'Instagram',
    enabled: false,
    action: () => undefined,
  },
  {
    id: 'messenger',
    label: 'Share on Messenger',
    emoji: 'Messenger',
    enabled: false,
    action: () => undefined,
  },
  {
    id: 'telegram',
    label: 'Share on Telegram',
    emoji: 'Telegram',
    enabled: false,
    action: () => undefined,
  },
  {
    id: 'sms',
    label: 'Share via SMS',
    emoji: 'SMS',
    enabled: false,
    action: () => undefined,
  },
];

export function getEnabledShareProviders() {
  return SHARE_PROVIDERS.filter((provider) => provider.enabled);
}
