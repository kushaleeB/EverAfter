---
name: Ethereal Elegance
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d3'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2ed'
  surface-container: '#f6ece7'
  surface-container-high: '#f0e6e1'
  surface-container-highest: '#eae1dc'
  on-surface: '#1f1b18'
  on-surface-variant: '#4e453b'
  inverse-surface: '#352f2c'
  inverse-on-surface: '#f9efea'
  outline: '#80756a'
  outline-variant: rgba(201, 168, 124, 0.3)
  surface-tint: '#745a34'
  primary: '#5a431f'
  on-primary: '#ffffff'
  primary-container: '#745a34'
  on-primary-container: '#f7d3a4'
  inverse-primary: '#e3c193'
  secondary: '#725949'
  on-secondary: '#ffffff'
  secondary-container: '#fbd9c4'
  on-secondary-container: '#775d4d'
  tertiary: '#3f4a3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#566252'
  on-tertiary-container: '#d0ddc9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb1'
  primary-fixed-dim: '#e3c193'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#5a431f'
  secondary-fixed: '#fedcc7'
  secondary-fixed-dim: '#e1c0ac'
  on-secondary-fixed: '#29170b'
  on-secondary-fixed-variant: '#594233'
  tertiary-fixed: '#d9e6d2'
  tertiary-fixed-dim: '#bdcab7'
  on-tertiary-fixed: '#141e12'
  on-tertiary-fixed-variant: '#3e4a3b'
  background: '#fff8f5'
  on-background: '#1f1b18'
  surface-variant: '#eae1dc'
  glass-bg: rgba(255, 248, 245, 0.8)
  accent-gold: '#c9a87c'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  section-padding: 120px
  margin-desktop: 64px
  margin-mobile: 24px
  gutter: 32px
  container-max: 1280px
  unit: 8px
---

## Brand & Style
Ethereal Elegance is a premium design system tailored for high-end wedding invitations and luxury event experiences. The brand personality is sophisticated, romantic, and "quietly luxurious," evoking a sense of timelessness through a "dreamy" atmosphere.

The design style is a refined mix of **Minimalism** and **Glassmorphism**. It utilizes expansive white space, high-contrast serif typography, and translucent "frosted glass" layers that interact with organic, slow-moving background shaders. The goal is to create a digital experience that feels as tactile and precious as physical letterpress stationery.

## Colors
The palette is rooted in warm neutrals and earthy metallics. The **Primary** color is a deep, sophisticated bronze (#745a34), used for key brand elements and emphasis. The **Secondary** and **Tertiary** colors are muted taupe and sage tones, providing a natural, garden-inspired supporting palette.

The background uses a soft, off-white "linen" surface (#fff8f5) rather than pure white to reduce eye strain and feel more organic. A specialized **Glass** color is used for panels, utilizing 80% opacity to allow background textures and shaders to bleed through subtly.

## Typography
The system relies on a high-contrast pairing of **Playfair Display** (Serif) for headlines and **Inter** (Sans-Serif) for functional text. 

- **Headlines:** Use Playfair Display with tight line heights and slight negative letter spacing for a high-fashion, editorial feel. 
- **Body:** Inter is used for legibility. Large body sizes (18px) are preferred to maintain a sense of space and ease of reading.
- **Labels:** Uppercase styling with generous letter spacing (5%) is applied to small labels and category headers to create a "stationery header" aesthetic.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy with a maximum container width of 1280px. It utilizes an 8px base spacing unit to maintain mathematical rhythm.

- **Desktop:** Large margins (64px) and significant vertical section padding (120px) are used to allow the content to "breathe."
- **Mobile:** Margins compress to 24px. The layout shifts from multi-column grids to single-stack columns, with a focus on centered alignment for a formal, invitation-style feel.
- **Grids:** A 12-column system is used for the "Our Story" and "Schedule" sections, often utilizing offset columns (e.g., spanning columns 2-6 and 8-12) to create asymmetrical balance.

## Elevation & Depth
Depth is created primarily through **Glassmorphism** and **Ambient Shadows**. 

1.  **Glass Panels:** Containers use a background blur (16px) combined with a low-opacity border (rgba(201, 168, 124, 0.3)) to separate themselves from the background without feeling heavy.
2.  **Ambient Shadows:** For interactive or floating elements (like the RSVP button and Music Toggle), a multi-layered, highly diffused shadow is used: `0 10px 25px -5px rgba(110, 103, 97, 0.15)`. This creates a soft, lifted effect that feels light and airy.
3.  **Tonal Layers:** Subtle shifts in surface color (e.g., moving to `surface-container-low`) are used for large section backgrounds to provide architectural structure to the page.

## Shapes
The shape language is soft and approachable. 
- **Cards/Panels:** Large radius (24px to 32px) for main content sections and glass panels.
- **Buttons:** Fully rounded (pill-shaped) for primary actions to maximize touch-friendliness and contrast with the structured serif typography.
- **Images:** Media containers use a 16px radius, often nested inside glass panels with a 2px internal padding to create a "framed photo" effect.

## Components
- **Primary Buttons:** Pill-shaped with a background of `primary-container` and `on-primary-container` text. On hover, they transition to the solid `primary` color.
- **Glass Buttons:** For secondary actions (like Registry links), use a semi-transparent glass background with a thin `outline-variant` border.
- **Input Fields:** Minimalist "border-bottom" only style. No background, using `outline-variant` for the underline, which transitions to `primary` on focus.
- **Timeline:** A vertical line (0.5px width) in `outline-variant` with centered icon nodes wrapped in small glass panels.
- **Navigation:** A fixed top bar with a high blur (30px) and a bottom border of 30% opacity, providing a persistent but unobtrusive frame for the content.
- **Floating Action Button (FAB):** A signature pill-shaped RSVP button that stays fixed in the bottom-right, utilizing the strongest ambient shadow in the system.