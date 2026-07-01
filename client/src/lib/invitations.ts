import type { Invitation, InvitationStatus, SectionType } from '@/types/api';
import { formatEventDate } from '@/lib/dates';
import { defaultRsvpSectionContent } from '@/lib/rsvpSection';

export const INVITATION_CARD_IMAGES = [
  '/img/invitations/card_1.png',
  '/img/invitations/card_2.png',
  '/img/invitations/card_3.png',
];

export const SECTION_FLOW_LABELS: Record<SectionType, string> = {
  hero: 'Details',
  story: 'Story',
  schedule: 'Schedule',
  gallery: 'Gallery',
  rsvp: 'RSVP',
  registry: 'Registry',
  custom: 'Custom',
};

export const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
] as const;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function invitationCardImage(invitation: Invitation, index: number) {
  const templatePreview = invitation.template?.previewImageUrl;
  if (templatePreview && templatePreview.startsWith('/img/')) {
    return templatePreview;
  }
  return INVITATION_CARD_IMAGES[index % INVITATION_CARD_IMAGES.length];
}

export function invitationDisplayTitle(invitation: Invitation) {
  return invitation.headline?.trim() || invitation.slug;
}

export function invitationSubtitle(invitation: Invitation) {
  if (invitation.subheadline?.trim()) return invitation.subheadline;
  if (invitation.template?.name) return invitation.template.name;
  return 'Digital Invitation';
}

export function invitationMetaLabel(invitation: Invitation) {
  if (invitation.publishedAt) {
    return formatEventDate(invitation.publishedAt) ?? 'Published';
  }
  const updated = new Date(invitation.updatedAt);
  const diffHours = Math.round((Date.now() - updated.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Edited just now';
  if (diffHours < 24) return `Edited ${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `Edited ${diffDays}d ago`;
}

export function statusBadgeClass(status: InvitationStatus) {
  switch (status) {
    case 'published':
      return 'bg-[#e8f5e9] text-[#2e7d32]';
    case 'archived':
      return 'bg-[#f0ebe6] text-[#6d625a]';
    default:
      return 'bg-[#fff3e0] text-[#e65100]';
  }
}

export function statusLabel(status: InvitationStatus) {
  switch (status) {
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    default:
      return 'Draft';
  }
}

export function defaultInvitationSections() {
  return [
    { sectionType: 'hero' as const, sortOrder: 0, content: { overlayOpacity: 0.4 }, isVisible: true },
    { sectionType: 'story' as const, sortOrder: 1, content: { title: 'Our Story', body: '' }, isVisible: true },
    {
      sectionType: 'schedule' as const,
      sortOrder: 2,
      content: {
        sectionTitle: 'Weekend Schedule',
        subtitle: '',
        layout: 'luxury-timeline',
        cardStyle: 'glass',
        items: [],
      },
      isVisible: true,
    },
    { sectionType: 'gallery' as const, sortOrder: 3, content: { sectionTitle: 'Our Gallery', albums: [{ id: 'album-default', name: 'Our Journey', albumType: 'our-journey' }], images: [], selectedAlbumId: 'album-default' }, isVisible: true },
    { sectionType: 'rsvp' as const, sortOrder: 4, content: defaultRsvpSectionContent(), isVisible: true },
  ];
}

export function buildCreateSlug(title: string) {
  const base = slugify(title) || 'invitation';
  return `${base}-${Date.now().toString(36)}`;
}

export function getHeroContent(section: { content?: Record<string, unknown> } | undefined) {
  const content = section?.content ?? {};
  return {
    imageUrl: typeof content.imageUrl === 'string' ? content.imageUrl : '/img/overview/Image.png',
    overlayOpacity: typeof content.overlayOpacity === 'number' ? content.overlayOpacity : 0.4,
    showSubheading: content.showSubheading !== false,
    fullHeight: content.fullHeight === true,
  };
}
