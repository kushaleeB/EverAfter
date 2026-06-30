import type { InvitationSection } from '@/types/api';

export const MAX_GALLERY_UPLOAD_MB = 10;
export const MAX_GALLERY_UPLOAD_BYTES = MAX_GALLERY_UPLOAD_MB * 1024 * 1024;
export const DEFAULT_MAX_GALLERY_IMAGES = 100;

export type GalleryLayout =
  | 'masonry-grid'
  | 'pinterest'
  | 'classic-grid'
  | 'carousel'
  | 'horizontal-slider'
  | 'full-width'
  | 'polaroid'
  | 'elegant-cards'
  | 'magazine-layout';

export type GalleryHoverAnimation = 'none' | 'zoom' | 'lift' | 'fade' | 'glow' | 'blur';
export type GalleryAnimation = 'fade-in' | 'slide-up' | 'scale' | 'stagger' | 'reveal' | 'none';
export type GalleryWidth = 'narrow' | 'default' | 'full';
export type GalleryShadowStyle = 'none' | 'soft' | 'medium' | 'strong';
export type GalleryCaptionPosition = 'below' | 'overlay' | 'hidden';
export type FeaturedDisplayMode = 'hero-carousel' | 'featured-grid' | 'highlight-section';

export type AlbumType =
  | 'proposal'
  | 'engagement'
  | 'pre-wedding'
  | 'our-journey'
  | 'wedding-day'
  | 'reception'
  | 'honeymoon'
  | 'family'
  | 'friends'
  | 'custom';

export interface GalleryAlbum {
  id: string;
  name: string;
  albumType: AlbumType;
  description: string;
  coverImageUrl: string | null;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  albumId: string;
  mediaId?: string;
  isFeatured: boolean;
  isCover: boolean;
}

export interface GallerySlideshow {
  enabled: boolean;
  slideDuration: number;
  transitionSpeed: number;
  loop: boolean;
  pauseOnHover: boolean;
}

export interface GalleryDetailsContent {
  sectionTitle: string;
  subtitle: string;
  description: string;
  introMessage: string;
  albums: GalleryAlbum[];
  images: GalleryImage[];
  selectedAlbumId: string | null;
  layout: GalleryLayout;
  columns: number;
  imageSpacing: number;
  imageBorderRadius: number;
  shadowStyle: GalleryShadowStyle;
  hoverAnimation: GalleryHoverAnimation;
  slideshow: GallerySlideshow;
  featuredDisplayMode: FeaturedDisplayMode;
  maxImages: number;
  backgroundColor: string;
  backgroundImageUrl: string | null;
  overlayOpacity: number;
  sectionPadding: number;
  galleryWidth: GalleryWidth;
  borderRadius: number;
  fontFamily: string;
  headingFontSize: number;
  captionFontSize: number;
  textColor: string;
  accentColor: string;
  captionPosition: GalleryCaptionPosition;
  animation: GalleryAnimation;
}

export const ALBUM_TYPE_OPTIONS: Array<{ label: string; value: AlbumType }> = [
  { label: 'Proposal', value: 'proposal' },
  { label: 'Engagement', value: 'engagement' },
  { label: 'Pre Wedding', value: 'pre-wedding' },
  { label: 'Our Journey', value: 'our-journey' },
  { label: 'Wedding Day', value: 'wedding-day' },
  { label: 'Reception', value: 'reception' },
  { label: 'Honeymoon', value: 'honeymoon' },
  { label: 'Family', value: 'family' },
  { label: 'Friends', value: 'friends' },
  { label: 'Custom Album', value: 'custom' },
];

export const GALLERY_LAYOUT_OPTIONS: Array<{ label: string; value: GalleryLayout }> = [
  { label: 'Masonry Grid', value: 'masonry-grid' },
  { label: 'Pinterest Style', value: 'pinterest' },
  { label: 'Classic Grid', value: 'classic-grid' },
  { label: 'Carousel', value: 'carousel' },
  { label: 'Horizontal Slider', value: 'horizontal-slider' },
  { label: 'Full Width Gallery', value: 'full-width' },
  { label: 'Polaroid Style', value: 'polaroid' },
  { label: 'Elegant Cards', value: 'elegant-cards' },
  { label: 'Magazine Layout', value: 'magazine-layout' },
];

export const GALLERY_FONT_OPTIONS = [
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
];

export const DEFAULT_ALBUM_ID = 'album-default';

export const DEFAULT_SLIDESHOW: GallerySlideshow = {
  enabled: false,
  slideDuration: 4,
  transitionSpeed: 500,
  loop: true,
  pauseOnHover: true,
};

export const DEFAULT_GALLERY_DETAILS: GalleryDetailsContent = {
  sectionTitle: 'Our Gallery',
  subtitle: '',
  description: '',
  introMessage: '',
  albums: [{ id: DEFAULT_ALBUM_ID, name: 'Our Journey', albumType: 'our-journey', description: '', coverImageUrl: null }],
  images: [],
  selectedAlbumId: DEFAULT_ALBUM_ID,
  layout: 'masonry-grid',
  columns: 2,
  imageSpacing: 8,
  imageBorderRadius: 12,
  shadowStyle: 'soft',
  hoverAnimation: 'zoom',
  slideshow: DEFAULT_SLIDESHOW,
  featuredDisplayMode: 'featured-grid',
  maxImages: DEFAULT_MAX_GALLERY_IMAGES,
  backgroundColor: '#faf9f6',
  backgroundImageUrl: null,
  overlayOpacity: 0,
  sectionPadding: 28,
  galleryWidth: 'default',
  borderRadius: 0,
  fontFamily: "'Playfair Display', serif",
  headingFontSize: 24,
  captionFontSize: 11,
  textColor: '#4e342e',
  accentColor: '#c5a67c',
  captionPosition: 'below',
  animation: 'stagger',
};

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function readBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function parseAlbumType(value: unknown): AlbumType {
  const raw = readString(value, 'our-journey');
  return ALBUM_TYPE_OPTIONS.some((option) => option.value === raw) ? (raw as AlbumType) : 'custom';
}

function parseAlbums(value: unknown): GalleryAlbum[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_GALLERY_DETAILS.albums;

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const coverRaw = record.coverImageUrl;
      return {
        id: readString(record.id, `album-${index}`),
        name: readString(record.name, 'Album'),
        albumType: parseAlbumType(record.albumType),
        description: readString(record.description),
        coverImageUrl:
          coverRaw === null
            ? null
            : typeof coverRaw === 'string' && coverRaw.length > 0
              ? coverRaw
              : null,
      };
    })
    .filter((item): item is GalleryAlbum => item !== null);
}

function parseImages(value: unknown, albums: GalleryAlbum[]): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  const fallbackAlbumId = albums[0]?.id ?? DEFAULT_ALBUM_ID;

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const url = readString(record.url);
      if (!url) return null;
      return {
        id: readString(record.id, `image-${index}`),
        url,
        alt: readString(record.alt),
        caption: readString(record.caption),
        albumId: readString(record.albumId, fallbackAlbumId),
        mediaId: readString(record.mediaId) || undefined,
        isFeatured: readBool(record.isFeatured, false),
        isCover: readBool(record.isCover, false),
      };
    })
    .filter((item): item is GalleryImage => item !== null);
}

function parseSlideshow(value: unknown, legacyAutoplay?: boolean, legacySpeed?: number): GallerySlideshow {
  if (!value || typeof value !== 'object') {
    return {
      ...DEFAULT_SLIDESHOW,
      enabled: legacyAutoplay ?? DEFAULT_SLIDESHOW.enabled,
      slideDuration: legacySpeed ?? DEFAULT_SLIDESHOW.slideDuration,
    };
  }
  const record = value as Record<string, unknown>;
  return {
    enabled: readBool(record.enabled, DEFAULT_SLIDESHOW.enabled),
    slideDuration: readNumber(record.slideDuration, DEFAULT_SLIDESHOW.slideDuration),
    transitionSpeed: readNumber(record.transitionSpeed, DEFAULT_SLIDESHOW.transitionSpeed),
    loop: readBool(record.loop, DEFAULT_SLIDESHOW.loop),
    pauseOnHover: readBool(record.pauseOnHover, DEFAULT_SLIDESHOW.pauseOnHover),
  };
}

export function parseGalleryDetails(section: InvitationSection | undefined): GalleryDetailsContent {
  const content = section?.content ?? {};
  const albums = parseAlbums(content.albums);
  const images = parseImages(content.images, albums);

  const layoutRaw = readString(content.layout);
  const layout = GALLERY_LAYOUT_OPTIONS.some((option) => option.value === layoutRaw)
    ? (layoutRaw as GalleryLayout)
    : DEFAULT_GALLERY_DETAILS.layout;

  const hoverRaw = readString(content.hoverAnimation);
  const hoverAnimation =
    hoverRaw === 'none' ||
    hoverRaw === 'zoom' ||
    hoverRaw === 'lift' ||
    hoverRaw === 'fade' ||
    hoverRaw === 'glow' ||
    hoverRaw === 'blur'
      ? hoverRaw
      : DEFAULT_GALLERY_DETAILS.hoverAnimation;

  const animationRaw = readString(content.animation);
  const animation =
    animationRaw === 'fade-in' ||
    animationRaw === 'slide-up' ||
    animationRaw === 'scale' ||
    animationRaw === 'stagger' ||
    animationRaw === 'reveal' ||
    animationRaw === 'none' ||
    animationRaw === 'scale-up'
      ? animationRaw === 'scale-up'
        ? 'scale'
        : animationRaw
      : DEFAULT_GALLERY_DETAILS.animation;

  const shadowRaw = readString(content.shadowStyle, 'soft');
  const shadowStyle =
    shadowRaw === 'none' || shadowRaw === 'soft' || shadowRaw === 'medium' || shadowRaw === 'strong'
      ? shadowRaw
      : DEFAULT_GALLERY_DETAILS.shadowStyle;

  const captionPosRaw = readString(content.captionPosition);
  const captionPosition =
    captionPosRaw === 'below' || captionPosRaw === 'overlay' || captionPosRaw === 'hidden'
      ? captionPosRaw
      : DEFAULT_GALLERY_DETAILS.captionPosition;

  const featuredRaw = readString(content.featuredDisplayMode);
  const featuredDisplayMode =
    featuredRaw === 'hero-carousel' ||
    featuredRaw === 'featured-grid' ||
    featuredRaw === 'highlight-section'
      ? featuredRaw
      : DEFAULT_GALLERY_DETAILS.featuredDisplayMode;

  const widthRaw = readString(content.galleryWidth);
  const galleryWidth =
    widthRaw === 'narrow' || widthRaw === 'full' || widthRaw === 'default'
      ? widthRaw
      : DEFAULT_GALLERY_DETAILS.galleryWidth;

  const imageUrlRaw = content.backgroundImageUrl;
  const backgroundImageUrl =
    imageUrlRaw === null
      ? null
      : typeof imageUrlRaw === 'string' && imageUrlRaw.length > 0
        ? imageUrlRaw
        : null;

  return {
    sectionTitle: readString(content.sectionTitle, DEFAULT_GALLERY_DETAILS.sectionTitle),
    subtitle: readString(content.subtitle),
    description: readString(content.description),
    introMessage: readString(content.introMessage),
    albums,
    images,
    selectedAlbumId: readString(content.selectedAlbumId, albums[0]?.id ?? null) || null,
    layout,
    columns: readNumber(content.columns, DEFAULT_GALLERY_DETAILS.columns),
    imageSpacing: readNumber(content.imageSpacing, DEFAULT_GALLERY_DETAILS.imageSpacing),
    imageBorderRadius: readNumber(content.imageBorderRadius, DEFAULT_GALLERY_DETAILS.imageBorderRadius),
    shadowStyle,
    hoverAnimation,
    slideshow: parseSlideshow(
      content.slideshow,
      readBool(content.autoplay, false),
      readNumber(content.autoplaySpeed, DEFAULT_SLIDESHOW.slideDuration),
    ),
    featuredDisplayMode,
    maxImages: readNumber(content.maxImages, DEFAULT_MAX_GALLERY_IMAGES),
    backgroundColor: readString(content.backgroundColor, DEFAULT_GALLERY_DETAILS.backgroundColor),
    backgroundImageUrl,
    overlayOpacity: readNumber(content.overlayOpacity, DEFAULT_GALLERY_DETAILS.overlayOpacity),
    sectionPadding: readNumber(content.sectionPadding, DEFAULT_GALLERY_DETAILS.sectionPadding),
    galleryWidth,
    borderRadius: readNumber(content.borderRadius, DEFAULT_GALLERY_DETAILS.borderRadius),
    fontFamily: readString(content.fontFamily, DEFAULT_GALLERY_DETAILS.fontFamily),
    headingFontSize: readNumber(content.headingFontSize, DEFAULT_GALLERY_DETAILS.headingFontSize),
    captionFontSize: readNumber(content.captionFontSize, DEFAULT_GALLERY_DETAILS.captionFontSize),
    textColor: readString(content.textColor, DEFAULT_GALLERY_DETAILS.textColor),
    accentColor: readString(content.accentColor, DEFAULT_GALLERY_DETAILS.accentColor),
    captionPosition,
    animation,
  };
}

export function galleryDetailsToContent(details: GalleryDetailsContent): Record<string, unknown> {
  return {
    ...details,
    images: details.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      albumId: image.albumId,
      mediaId: image.mediaId,
      isFeatured: image.isFeatured,
      isCover: image.isCover,
    })),
  };
}

export function createGalleryAlbum(name = 'Custom Album', albumType: AlbumType = 'custom'): GalleryAlbum {
  return { id: crypto.randomUUID(), name, albumType, description: '', coverImageUrl: null };
}

export function albumTypeLabel(album: GalleryAlbum) {
  if (album.albumType === 'custom') return album.name;
  return ALBUM_TYPE_OPTIONS.find((option) => option.value === album.albumType)?.label ?? album.name;
}

export function createGalleryImage(url: string, albumId: string, mediaId?: string): GalleryImage {
  return {
    id: crypto.randomUUID(),
    url,
    alt: '',
    caption: '',
    albumId,
    mediaId,
    isFeatured: false,
    isCover: false,
  };
}

export function duplicateGalleryImage(image: GalleryImage): GalleryImage {
  return { ...image, id: crypto.randomUUID(), isCover: false };
}

export function validateGalleryFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Only image files (JPEG, PNG, WebP, GIF) are allowed.';
  if (file.size > MAX_GALLERY_UPLOAD_BYTES) return `Image must be ${MAX_GALLERY_UPLOAD_MB}MB or smaller.`;
  return null;
}

export async function compressGalleryImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export interface GalleryValidationResult {
  isValid: boolean;
  errors: { images?: string; maxImages?: string };
}

export function validateGalleryDetails(section: InvitationSection | undefined): GalleryValidationResult {
  const details = parseGalleryDetails(section);
  if (details.images.length === 0) {
    return { isValid: false, errors: { images: 'Upload at least one photo to your gallery.' } };
  }
  if (details.images.length > details.maxImages) {
    return {
      isValid: false,
      errors: { maxImages: `Gallery cannot exceed ${details.maxImages} images.` },
    };
  }
  return { isValid: true, errors: {} };
}

export function galleryAnimationClass(animation: GalleryAnimation) {
  switch (animation) {
    case 'fade-in':
      return 'gallery-fade-in';
    case 'slide-up':
      return 'gallery-slide-up';
    case 'scale':
      return 'gallery-scale-up';
    case 'stagger':
      return 'gallery-stagger';
    case 'reveal':
      return 'gallery-reveal';
    default:
      return '';
  }
}

export function galleryHoverClass(hover: GalleryHoverAnimation) {
  switch (hover) {
    case 'zoom':
      return 'gallery-hover-zoom';
    case 'lift':
      return 'gallery-hover-lift';
    case 'fade':
      return 'gallery-hover-fade';
    case 'glow':
      return 'gallery-hover-glow';
    case 'blur':
      return 'gallery-hover-blur';
    default:
      return '';
  }
}

export function galleryWidthToCss(width: GalleryWidth) {
  switch (width) {
    case 'narrow':
      return '88%';
    case 'full':
      return '100%';
    default:
      return '94%';
  }
}

export function shadowFromStyle(style: GalleryShadowStyle) {
  switch (style) {
    case 'none':
      return 'none';
    case 'medium':
      return '0 12px 32px rgba(78, 52, 46, 0.14)';
    case 'strong':
      return '0 16px 40px rgba(78, 52, 46, 0.2)';
    default:
      return '0 8px 24px rgba(78, 52, 46, 0.1)';
  }
}

export function getImagesForAlbum(images: GalleryImage[], albumId: string | null) {
  if (!albumId) return images;
  return images.filter((image) => image.albumId === albumId);
}

export function getAllDisplayImages(gallery: GalleryDetailsContent, albumId?: string | null) {
  const targetAlbum = albumId ?? gallery.selectedAlbumId;
  const filtered = targetAlbum ? getImagesForAlbum(gallery.images, targetAlbum) : gallery.images;
  return filtered.length > 0 ? filtered : gallery.images;
}

export function getFeaturedImages(gallery: GalleryDetailsContent) {
  const featured = gallery.images.filter((image) => image.isFeatured);
  return featured.length > 0 ? featured : gallery.images.slice(0, Math.min(3, gallery.images.length));
}

/** Images for the main gallery grid — excludes items already shown in the featured section. */
export function getGridDisplayImages(gallery: GalleryDetailsContent, albumId?: string | null) {
  const all = getAllDisplayImages(gallery, albumId);
  const featured = getFeaturedImages(gallery);
  if (featured.length === 0) return all;

  const featuredIds = new Set(featured.map((image) => image.id));
  return all.filter((image) => !featuredIds.has(image.id));
}

export function getAlbumName(gallery: GalleryDetailsContent, albumId: string) {
  const album = gallery.albums.find((item) => item.id === albumId);
  return album ? albumTypeLabel(album) : 'Gallery';
}
