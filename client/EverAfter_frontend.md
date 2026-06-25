# EverAfter v1 - Frontend Architecture & Design System Specification

> Project: EverAfter - Luxury Wedding Invitation SaaS Platform
> Framework: React + TypeScript
> Design Direction: Modern Luxury + Soft Romantic Minimalism
> Architecture: Scalable Enterprise Frontend
> Goal: Build a production-ready SaaS platform with a premium wedding experience and a powerful event management dashboard.

---

# 1. Core Philosophy

EverAfter should feel like:

- Apple's elegance
- Linear's simplicity
- Canva's editor experience
- The Knot's emotional storytelling
- Notion's clean information hierarchy

The application must feel:

- Premium
- Romantic
- Sophisticated
- Minimal
- Calm
- Trustworthy
- Emotional
- Modern

Avoid:

- Neon colors
- Dark cyberpunk themes
- Glassmorphism overload
- Excessive gradients
- Heavy shadows
- Cartoon-style UI

The design should feel timeless and luxurious.

---

# 2. Technology Stack

## Core Framework

```txt
React 19
TypeScript
Vite
```

Purpose:

- Fast development
- Type safety
- Excellent developer experience
- Long-term maintainability

---

## Styling

```txt
TailwindCSS
CSS Variables
Design Tokens
```

Purpose:

- Consistent design system
- Easy theming
- Responsive layouts
- Component reusability

---

## UI Components

```txt
Shadcn UI
Radix UI
Lucide React Icons
```

Purpose:

- Accessibility
- Production-ready components
- Easy customization

---

## State Management

```txt
Zustand
```

Used for:

- Authentication state
- User preferences
- Sidebar state
- Invitation editor state
- Temporary form data

---

## Server State

```txt
TanStack Query v5
```

Used for:

- API calls
- Caching
- Pagination
- Optimistic updates
- Mutations
- Background refetching

---

## Forms

```txt
React Hook Form
Zod
@hookform/resolvers
```

Used for:

- Validation
- Form management
- Backend schema mirroring

---

## Routing

```txt
React Router v7
```

Features:

- Nested routes
- Protected routes
- Layout routes
- Dynamic parameters

---

## Animations

```txt
Framer Motion
```

Used for:

- Page transitions
- Micro interactions
- Hero animations
- Hover states
- Dashboard animations

---

## Charts

```txt
Recharts
```

Used for:

- RSVP analytics
- Event analytics
- Statistics dashboard

---

## Utilities

```txt
date-fns
clsx
tailwind-merge
react-hot-toast
react-dropzone
react-hook-form
react-use
```

---

# 3. Project Structure

```txt
src/
│
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── layouts/
│
├── pages/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── events/
│   ├── invitations/
│   ├── guests/
│   ├── rsvps/
│   ├── media/
│   └── public/
│
├── components/
│
├── hooks/
│
├── lib/
│
├── stores/
│
├── services/
│
├── types/
│
├── constants/
│
├── assets/
│
└── styles/
```

---

# 4. Design System

# Color Palette

## Primary Background

```css
#FAF7F2
```

Ivory White

---

## Secondary Background

```css
#F5F1EA
```

Pearl White

---

## Primary Accent

```css
#D9C3A3
```

Champagne Gold

---

## Secondary Accent

```css
#C8A98D
```

Rose Gold

---

## Borders

```css
#B9A28E
```

Sandstone

---

## Success

```css
#B8C1B1
```

Sage Green

---

## Text Primary

```css
#2D2926
```

Charcoal

---

## Text Secondary

```css
#6D625A
```

Warm Gray

---

# Gradients

## Luxury Gold

```css
linear-gradient(
135deg,
#F5E6CC,
#D9C3A3
)
```

---

## Romantic Rose

```css
linear-gradient(
135deg,
#FAF7F2,
#F0E4D7
)
```

---

# Typography

## Display Headings

```txt
Playfair Display
```

Used for:

- Hero titles
- Invitation titles
- Landing page sections

---

## Body Text

```txt
Inter
```

Used for:

- Dashboard
- Forms
- Tables
- Descriptions

---

## Decorative Text

```txt
Cormorant Garamond
```

Used for:

- Quotes
- Testimonials
- Invitation headings

---

# Spacing System

```txt
4px
8px
12px
16px
24px
32px
48px
64px
96px
128px
```

---

# Border Radius

```txt
8px
12px
16px
20px
24px
999px
```

---

# Shadow System

Small

```css
0 4px 12px rgba(0,0,0,0.04)
```

Medium

```css
0 10px 30px rgba(0,0,0,0.06)
```

Large

```css
0 20px 60px rgba(0,0,0,0.08)
```

---

# 5. Layout System

# Marketing Layout

```txt
Navbar
Hero
Sections
Footer
```

---

# Auth Layout

```txt
Two-column layout
```

Left:

- Background image
- Branding
- Testimonials

Right:

- Forms

---

# Dashboard Layout

```txt
Sidebar
Header
Content
```

---

# Guest Layout

```txt
Full Screen
Invitation Experience
```

---

# 6. Responsive Breakpoints

```txt
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

# 7. Sidebar

Expanded Width

```txt
280px
```

Collapsed Width

```txt
80px
```

Items:

```txt
Dashboard
Events
Invitations
Guests
RSVPs
Media
Settings
```

---

# 8. Dashboard Widgets

Cards:

```txt
Total Events
Total Guests
Total Invitations
Response Rate
Upcoming Events
Recent Activity
```

---

# 9. Component Standards

Every page must have:

```txt
PageHeader
LoadingState
ErrorState
EmptyState
```

---

# Tables

Features:

```txt
Sorting
Pagination
Search
Filtering
Bulk Actions
```

---

# Forms

Features:

```txt
Validation
Autosave
Loading states
Error handling
Success states
```

---

# Buttons

Variants:

```txt
Primary
Secondary
Outline
Ghost
Danger
```

Sizes:

```txt
Small
Medium
Large
Icon
```

---

# Cards

Variants:

```txt
Default
Interactive
Analytics
Feature
Media
```

---

# Dialogs

Used for:

```txt
Delete Confirmation
Edit Forms
Quick Actions
Media Preview
```

---

# 10. Animation System

Page Transition

```txt
Fade + Slide
Duration: 0.5s
```

Cards

```txt
Fade Up
Duration: 0.4s
```

Buttons

```txt
Scale 1.02
Duration: 0.2s
```

Sidebar

```txt
Width Animation
Duration: 0.3s
```

---

# 11. Landing Page Structure

```txt
Navbar
Hero
Trusted By
Features
How It Works
Templates
Showcase
Testimonials
Pricing
FAQ
CTA
Footer
```

---

# 12. Dashboard Modules

## Dashboard

Overview and analytics.

---

## Events

CRUD management.

---

## Invitations

Invitation builder.

---

## Guests

Guest management CRM.

---

## RSVPs

RSVP management and analytics.

---

## Media

Media library.

---

## Settings

Account settings.

---

# 13. Invitation Builder Experience

Inspired by:

```txt
Canva
Notion
Apple Pages
```

Layout:

```txt
Left:
Sections Navigation

Center:
Invitation Canvas

Right:
Properties Panel
```

---

# 14. Public Invitation Experience

The invitation experience should feel:

```txt
Elegant
Emotional
Premium
Cinematic
```

Large imagery.

Beautiful typography.

Soft transitions.

Parallax scrolling.

Subtle animations.

---

# 15. Accessibility Standards

- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- Focus indicators
- Proper contrast ratios

---

# 16. Performance Standards

Target:

```txt
Lighthouse > 90
```

Metrics:

```txt
LCP < 2.5s
CLS < 0.1
FID < 100ms
```

---

# 17. Development Standards

- Feature-based architecture
- Reusable components
- Type-safe APIs
- Strict TypeScript
- Mobile-first responsive design
- Clean code principles
- SOLID architecture
- Scalable folder structure

---

# Final Product Vision

EverAfter should feel like:

> A luxury wedding experience platform designed by Apple, powered by Canva's editing experience, and built with the simplicity of Linear.

The platform should deliver two experiences:

1. A powerful SaaS dashboard for wedding hosts.
2. A beautiful emotional experience for guests receiving invitations.
