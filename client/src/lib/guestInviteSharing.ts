/**
 * Extensible guest invitation delivery channels.
 * Email is sent server-side; WhatsApp/SMS open client URLs or future provider APIs.
 */

export type GuestInviteChannel = 'email' | 'whatsapp' | 'link' | 'sms' | 'messenger' | 'telegram';

export interface GuestInviteChannelConfig {
  id: GuestInviteChannel;
  label: string;
  enabled: boolean;
  serverSide: boolean;
}

export const GUEST_INVITE_CHANNELS: GuestInviteChannelConfig[] = [
  { id: 'email', label: 'Email', enabled: true, serverSide: true },
  { id: 'whatsapp', label: 'WhatsApp', enabled: true, serverSide: false },
  { id: 'link', label: 'Copy Link', enabled: true, serverSide: false },
  { id: 'sms', label: 'SMS', enabled: false, serverSide: false },
  { id: 'messenger', label: 'Messenger', enabled: false, serverSide: false },
  { id: 'telegram', label: 'Telegram', enabled: false, serverSide: false },
];

export function getEnabledGuestInviteChannels() {
  return GUEST_INVITE_CHANNELS.filter((channel) => channel.enabled);
}
