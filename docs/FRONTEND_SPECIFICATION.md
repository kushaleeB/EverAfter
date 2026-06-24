# EverAfter — Frontend Specification

> **Version:** 1.0  
> **Generated from:** `server/src` routes, validators, services, Prisma schema  
> **API base URL:** `/api/v1` (Vite dev proxy → `http://localhost:3001`)  
> **Client origin:** `http://localhost:5173` (`APP_URL`, `CORS_ORIGIN`)

This document defines the complete frontend application required to consume the **existing** EverAfter backend. Every page, component, route, and validation maps to a real endpoint or model. Features **not** exposed by the API are explicitly listed in [§14 Backend Gaps](#14-backend-gaps--do-not-build).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [API Conventions](#3-api-conventions)
4. [TypeScript Domain Model](#4-typescript-domain-model)
5. [Authentication & Session](#5-authentication--session)
6. [Role-Based Access Control](#6-role-based-access-control)
7. [Application Routes](#7-application-routes)
8. [Navigation Structure](#8-navigation-structure)
9. [Module Specifications](#9-module-specifications)
10. [Complete API → Frontend Mapping](#10-complete-api--frontend-mapping)
11. [Component Architecture](#11-component-architecture)
12. [State Management](#12-state-management)
13. [Form Validation (Zod Mirrors)](#13-form-validation-zod-mirrors)
14. [Backend Gaps — Do Not Build](#14-backend-gaps--do-not-build)
15. [Development Task Breakdown](#15-development-task-breakdown)

---

## 1. Executive Summary

EverAfter is a luxury wedding invitation SaaS. The backend provides:

| Domain | Authenticated | Public |
|--------|---------------|--------|
| Auth (register, login, refresh, password reset) | ✓ | ✓ |
| Events CRUD | ✓ | — |
| Invitations CRUD, publish/archive, sections | ✓ | Legacy + page endpoints |
| Guests CRUD, CSV import, QR, tracking | ✓ | — |
| RSVPs (guest submit + host manage + analytics) | ✓ | ✓ |
| Media upload/list/delete | ✓ | — |
| Invitation templates (read-only) | — | ✓ |
| Health checks | ✓ | ✓ |

The frontend is organized into three shells:

1. **Marketing shell** — unauthenticated landing (minimal API: templates only)
2. **Auth shell** — login, register, forgot/reset password
3. **App shell** — authenticated dashboard with event-scoped modules
4. **Guest shell** — public invitation + RSVP (token in URL)

---

## 2. Tech Stack

| Layer | Choice | Purpose |
|-------|--------|---------|
| Build | Vite + React 19 + TypeScript | SPA |
| Styling | TailwindCSS + design tokens from `client/DESIGN (2).md` | Quiet Luxury aesthetic |
| Routing | React Router v7 | Nested routes, loaders |
| Server state | TanStack Query v5 | Caching, pagination, mutations |
| Client state | Zustand | Auth tokens, UI preferences, wizard state |
| Forms | React Hook Form + Zod (`@hookform/resolvers/zod`) | Mirror backend validators |
| HTTP | Axios | Interceptors for auth refresh |
| UI primitives | Shadcn UI | Tables, dialogs, forms, toasts |

### Recommended `client/src` structure

```
client/src/
├── app/                    # Router, providers, layouts
│   ├── routes.tsx
│   └── providers.tsx
├── layouts/
│   ├── MarketingLayout.tsx
│   ├── AuthLayout.tsx
│   ├── AppLayout.tsx
│   └── GuestLayout.tsx
├── pages/                  # Route-level screens
├── features/               # Domain modules (auth, events, invitations, …)
│   └── {module}/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       └── schemas.ts
├── components/             # Shared UI (DataTable, StatusChip, …)
├── lib/
│   ├── axios.ts
│   ├── query-client.ts
│   └── utils.ts
├── stores/
│   └── auth.store.ts
└── types/
    ├── api.ts
    ├── models.ts
    └── enums.ts
```

---

## 3. API Conventions

### 3.1 Response envelope

**Success (with data):**
```json
{
  "success": true,
  "data": { }
}
```

**Success (paginated):** `data` is an **array**; pagination in `meta`:
```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "email", "message": "Invalid email" }],
    "requestId": "uuid"
  }
}
```

### 3.2 Error codes (`server/src/errors/errorCodes.js`)

| Code | HTTP | Frontend action |
|------|------|-----------------|
| `VALIDATION_ERROR` | 400 | Map `details[]` to form fields |
| `UNAUTHORIZED` | 401 | Refresh token or redirect `/login` |
| `FORBIDDEN` | 403 | Show permission denied; hide action if known |
| `NOT_FOUND` | 404 | Show not-found state |
| `CONFLICT` | 409 | Show inline error (duplicate email, slug) |
| `RATE_LIMITED` | 429 | Toast + retry after delay |
| `SUBSCRIPTION_LIMIT` | 403 | Toast (reserved; not thrown by services today) |
| `INTERNAL_ERROR` | 500 | Generic error boundary |

### 3.3 Auth header

```
Authorization: Bearer <accessToken>
```

### 3.4 Pagination defaults (`server/src/utils/pagination.js`)

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `limit` | 20 | 100 |

### 3.5 File uploads

| Endpoint | Field name | Max size | Allowed types |
|----------|------------|----------|---------------|
| `POST .../media` | `file` | 10 MB (`MAX_FILE_SIZE_MB`) | jpeg, png, webp, gif, mp4, pdf |
| `POST .../guests/import` | `file` | 5 MB | CSV |

Media optional body field: `invitationId` (string UUID).

QR endpoint: `format=dataurl` (JSON) or `format=png` (binary image).

### 3.6 Rate limits

- Global: 100 req / 15 min
- Auth + public RSVP POST/PATCH: 20 req / 15 min

---

## 4. TypeScript Domain Model

Mirror Prisma schema (`server/prisma/schema.prisma`). Use these in `client/src/types/models.ts`.

```typescript
// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
export type BillingInterval = 'monthly' | 'yearly' | 'lifetime';

export type InvitationStatus = 'draft' | 'published' | 'archived';
export type SectionType = 'hero' | 'story' | 'schedule' | 'gallery' | 'rsvp' | 'registry' | 'custom';

export type GuestRole = 'host' | 'partner' | 'planner' | 'guest';
export type GuestCategory = 'family' | 'friends' | 'colleagues' | 'vip' | 'wedding_party' | 'other';

export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe';
export type CollaboratorRole = 'owner' | 'partner' | 'planner' | 'viewer';
export type MediaAssetType = 'image' | 'video' | 'document';

// ─── API envelope ────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
    requestId?: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// ─── Event ───────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  ownerId: string;
  title: string;
  partnerOne: string | null;
  partnerTwo: string | null;
  eventDate: string | null;       // ISO date
  eventTimezone: string;
  venueName: string | null;
  venueAddress: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventDetail extends Event {
  invitations: InvitationSummary[];
  _count: { guests: number };
}

// ─── Template ────────────────────────────────────────────────────────────────

export interface InvitationTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string;
  isPremium: boolean;
  minPlanSlug: string | null;
  themeConfig: Record<string, unknown>;
}

// ─── Invitation ──────────────────────────────────────────────────────────────

export interface InvitationSummary {
  id: string;
  eventId: string;
  slug: string;
  status: InvitationStatus;
  headline: string | null;
  subheadline: string | null;
  viewCount: string;              // BigInt serialized as string
  publishedAt: string | null;
  template: Pick<InvitationTemplate, 'id' | 'name' | 'slug' | 'previewImageUrl' | 'isPremium'> | null;
  _count: { sections: number; rsvps: number };
}

export interface Invitation extends InvitationSummary {
  bodyContent: string | null;
  themeConfig: Record<string, unknown>;
  rsvpDeadline: string | null;
  passwordProtected: boolean;
  templateId: string | null;
  template: InvitationTemplate | null;
  event: Pick<Event, 'id' | 'title' | 'partnerOne' | 'partnerTwo' | 'eventDate'>;
  sections: InvitationSection[];
  _count: { rsvps: number };
}

export interface InvitationSection {
  id: string;
  invitationId: string;
  sectionType: SectionType;
  sortOrder: number;
  content: Record<string, unknown>;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Guest ───────────────────────────────────────────────────────────────────

export interface Guest {
  id: string;
  eventId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: GuestRole;
  category: GuestCategory;
  partySize: number;
  plusOneAllowed: boolean;
  accessToken: string;
  inviteSentAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  rsvpStatus: RsvpStatus;
  latestRsvp: {
    id: string;
    status: RsvpStatus;
    attendingCount: number;
    respondedAt: string | null;
    invitation: { id: string; slug: string; headline: string | null };
  } | null;
}

export interface GuestCategoryOption {
  value: GuestCategory;
  label: string;
}

// ─── RSVP ────────────────────────────────────────────────────────────────────

export interface Rsvp {
  id: string;
  guestId: string;
  invitationId: string;
  status: RsvpStatus;
  attendingCount: number;
  dietaryNotes: string | null;
  message: string | null;
  respondedAt: string | null;
  guest: Pick<Guest, 'id' | 'firstName' | 'lastName' | 'email' | 'category' | 'partySize' | 'plusOneAllowed'>;
  invitation: { id: string; slug: string; headline: string | null; eventId: string };
}

export interface RsvpAnalytics {
  summary: {
    totalGuests: number;
    guestsResponded: number;
    guestsPending: number;
    responseRate: number;
    totalAttendingCount: number;
    totalRsvpRecords: number;
  };
  byStatus: Record<RsvpStatus, number>;
  byCategory: Record<string, Record<RsvpStatus, number>>;
  timeline: Array<{ date: string; count: number }>;
  dietaryNotes: Array<{ guest: string; notes: string }>;
  recentMessages: Array<{
    id: string;
    message: string;
    status: RsvpStatus;
    respondedAt: string | null;
    guest: { firstName: string; lastName: string };
  }>;
  invitationId?: string;
}

export interface RsvpSummary {
  totalGuests: number;
  guestsWithRsvp: number;
  guestsWithoutRsvp: number;
  rsvpResponses: number;
  byStatus: Record<RsvpStatus, number>;
  byCategory: Record<string, Record<RsvpStatus, number>>;
  guestCountByCategory: Record<string, number>;
  totalAttendingCount: number;
  responseRate: number;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface MediaAsset {
  id: string;
  eventId: string;
  uploadedBy: string | null;
  invitationId: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  assetType: MediaAssetType;
  fileSizeBytes: string;          // BigInt
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

// ─── Public page ─────────────────────────────────────────────────────────────

export interface PublicInvitationPage {
  invitation: Invitation;
  guest: Pick<Guest, 'id' | 'firstName' | 'lastName' | 'email' | 'partySize' | 'plusOneAllowed' | 'category'> | null;
  rsvp: Rsvp | null;
}

export interface GuestRsvpContext {
  guest: Pick<Guest, 'id' | 'firstName' | 'lastName' | 'email' | 'partySize' | 'plusOneAllowed' | 'category'>;
  rsvp: Pick<Rsvp, 'status' | 'attendingCount'> & Partial<Rsvp>;
  invitation: { id: string; slug: string; rsvpDeadline: string | null };
}

export interface QrCodeResponse {
  dataUrl: string;
  rsvpUrl: string;
  guest: { id: string; firstName: string; lastName: string };
  invitation: { id: string; slug: string };
}

export interface CsvImportResult {
  imported: number;
  guests: Array<Pick<Guest, 'id' | 'firstName' | 'lastName' | 'email' | 'category'>>;
}
```

### Section content shapes (from seed data — JSON `content` field)

| `sectionType` | Expected `content` keys |
|---------------|-------------------------|
| `hero` | `imageUrl`, `overlayOpacity` |
| `story` | `title`, `body` |
| `schedule` | `items: { time, label }[]` |
| `gallery` | `images: { url, alt? }[]` (convention; backend accepts any JSON) |
| `rsvp` | `deadline`, `message` |
| `registry` | `links: { label, url }[]` (convention) |
| `custom` | freeform |

---

## 5. Authentication & Session

### 5.1 Token storage (Zustand + secure persistence)

```typescript
// auth.store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}
```

- Persist `refreshToken` + `user` in `localStorage` (or `sessionStorage` for stricter sessions).
- Keep `accessToken` in memory (Zustand) to reduce XSS exposure.
- On app boot: if `refreshToken` exists → `POST /auth/refresh`.

### 5.2 Axios interceptors (`lib/axios.ts`)

1. Request: attach `Authorization: Bearer ${accessToken}` when present.
2. Response 401: attempt single refresh via `POST /auth/refresh`; retry original request; on failure → `clearSession()` + navigate `/login`.
3. Response 429: surface rate-limit toast.

### 5.3 Auth pages

| Route | Endpoint(s) | Notes |
|-------|-------------|-------|
| `/register` | `POST /auth/register` | Redirect `/dashboard` on 201 |
| `/login` | `POST /auth/login` | Redirect `/dashboard` on 200 |
| `/forgot-password` | `POST /auth/forgot-password` | Always show success message (no enumeration) |
| `/reset-password?token=` | `POST /auth/reset-password` | Token from query string |
| `/dashboard/settings` | `GET /auth/me`, `POST /auth/change-password`, `POST /auth/logout-all` | |
| Logout (header) | `POST /auth/logout` | Body: `{ refreshToken }` → clear session |

### 5.4 Protected route guard

```tsx
// Redirect to /login if no valid session after refresh attempt
<ProtectedRoute><AppLayout /></ProtectedRoute>
```

### 5.5 Password rules (mirror `auth.validator.js`)

- Min 8, max 128 characters
- At least one uppercase, one lowercase, one digit

### 5.6 Dev-only: forgot-password response

In non-production, API may return `devResetToken` and `devResetUrl` — show in dev tools panel only.

---

## 6. Role-Based Access Control

### 6.1 Global roles (`User.role`)

| Role | Effect |
|------|--------|
| `customer` | Standard user |
| `admin` | Full event access on all events (treated as owner + `admin:*`) |

### 6.2 Event collaborator roles (`EventCollaborator.role`)

Defined in `server/src/config/roles.js`. Owner is implicit via `event.ownerId`.

| Permission | owner | partner | planner | viewer |
|------------|:-----:|:-------:|:-------:|:------:|
| `event:read` | ✓ | ✓ | ✓ | ✓ |
| `event:write` | ✓ | ✓ | — | — |
| `event:delete` | ✓ | — | — | — |
| `invitation:read` | ✓ | ✓ | ✓ | ✓ |
| `invitation:write` | ✓ | ✓ | — | — |
| `invitation:publish` | ✓ | ✓ | — | — |
| `guest:read` | ✓ | ✓ | ✓ | ✓ |
| `guest:write` | ✓ | ✓ | ✓ | — |
| `guest:delete` | ✓ | — | ✓ | — |
| `rsvp:read` | ✓ | ✓ | ✓ | ✓ |
| `media:read` | ✓ | ✓ | ✓ | ✓ |
| `media:write` | ✓ | ✓ | — | — |
| `media:delete` | ✓ | — | — | — |
| `collaborator:manage` | ✓ | — | — | — |

### 6.3 Frontend permission hook

**Important:** The backend does **not** expose collaborator role or permissions on any GET endpoint. Implement:

```typescript
function useEventPermissions(event: Event, user: User) {
  const isOwner = event.ownerId === user.id;
  const isAdmin = user.role === 'admin';
  // Collaborator role unknown without new API — use optimistic read-only for non-owners
  return {
    isOwner,
    isAdmin,
    canWrite: isOwner || isAdmin,       // conservative until role API exists
    canDeleteGuests: isOwner || isAdmin,
    canPublish: isOwner || isAdmin,
  };
}
```

**Recommended UX:** Hide destructive actions for non-owners; on `403 FORBIDDEN` show toast `"You don't have permission for this action"`. When backend adds `GET /events/:id/access`, replace hook with server-provided permissions.

### 6.4 Route-level guards

| Action | Minimum permission (server enforced) |
|--------|-------------------------------------|
| View event | `event:read` |
| Edit event | `event:write` |
| Delete event | `event:delete` |
| Create/edit invitation | `invitation:write` |
| Publish invitation | `invitation:publish` |
| Add/edit guests | `guest:write` |
| Delete guest | `guest:delete` |
| Host RSVP edit | `guest:write` |
| Upload media | `media:write` |
| Delete media | `media:delete` |

---

## 7. Application Routes

### 7.1 Public / marketing

| Path | Page | Auth |
|------|------|------|
| `/` | LandingPage | — |
| `/templates` | TemplateGalleryPage | — |

### 7.2 Auth

| Path | Page | Auth |
|------|------|------|
| `/login` | LoginPage | redirect if authed |
| `/register` | RegisterPage | redirect if authed |
| `/forgot-password` | ForgotPasswordPage | — |
| `/reset-password` | ResetPasswordPage | — |

### 7.3 Guest (public invitation)

| Path | Page | Auth |
|------|------|------|
| `/invite/:slug` | PublicInvitationPage | — (`?token=` or `?accessToken=`) |
| `/invite/:slug/rsvp` | GuestRsvpPage | token required in query |

### 7.4 Authenticated app

| Path | Page | Auth |
|------|------|------|
| `/dashboard` | DashboardPage | ✓ |
| `/dashboard/settings` | AccountSettingsPage | ✓ |
| `/dashboard/events` | EventsListPage | ✓ |
| `/dashboard/events/new` | CreateEventPage | ✓ |
| `/dashboard/events/:eventId` | EventHubPage | ✓ |
| `/dashboard/events/:eventId/edit` | EditEventPage | ✓ |
| `/dashboard/events/:eventId/invitations` | InvitationsListPage | ✓ |
| `/dashboard/events/:eventId/invitations/new` | CreateInvitationPage | ✓ |
| `/dashboard/events/:eventId/invitations/:invitationId` | InvitationDetailPage | ✓ |
| `/dashboard/events/:eventId/invitations/:invitationId/edit` | InvitationEditorPage | ✓ |
| `/dashboard/events/:eventId/invitations/:invitationId/analytics` | InvitationAnalyticsPage | ✓ |
| `/dashboard/events/:eventId/guests` | GuestsListPage | ✓ |
| `/dashboard/events/:eventId/guests/new` | CreateGuestPage | ✓ |
| `/dashboard/events/:eventId/guests/import` | ImportGuestsPage | ✓ |
| `/dashboard/events/:eventId/guests/:guestId` | GuestDetailPage | ✓ |
| `/dashboard/events/:eventId/rsvps` | RsvpsPage | ✓ |
| `/dashboard/events/:eventId/rsvps/analytics` | RsvpAnalyticsPage | ✓ |
| `/dashboard/events/:eventId/media` | MediaLibraryPage | ✓ |

### 7.5 System

| Path | Page |
|------|------|
| `*` | NotFoundPage |
| `/unauthorized` | UnauthorizedPage (optional) |

---

## 8. Navigation Structure

### 8.1 Marketing header (`MarketingLayout`)

```
[EverAfter Logo]                    [Templates]  [Sign In]  [Get Started →]
```

### 8.2 Auth layout

Minimal centered card; link back to `/`.

### 8.3 App shell — desktop sidebar

```
┌─────────────────────────┐
│ EverAfter               │
├─────────────────────────┤
│ ○ Dashboard             │
│ ○ Events                │
├─────────────────────────┤
│ (when event selected)   │
│   Overview              │
│   Invitations           │
│   Guests                │
│   RSVPs                 │
│   Media                 │
├─────────────────────────┤
│ ○ Settings              │
│ [Avatar] Name ▾         │
│   Sign out              │
└─────────────────────────┘
```

Event-scoped items appear when `eventId` is in the current route.

### 8.4 App shell — top header

```
Breadcrumbs: Dashboard / Events / {event.title} / Guests
[Search — context-specific]     [+ Quick action]  [Avatar]
```

### 8.5 Breadcrumb map

| Route | Breadcrumb |
|-------|------------|
| `/dashboard` | Dashboard |
| `/dashboard/events` | Dashboard / Events |
| `/dashboard/events/:eventId` | Dashboard / Events / {title} |
| `/dashboard/events/:eventId/guests` | … / Guests |
| `/dashboard/events/:eventId/invitations/:id/edit` | … / Invitations / {headline\|slug} / Edit |

### 8.6 Mobile navigation

- Bottom tab bar: Dashboard | Events | Settings
- Inside event: horizontal scroll tabs (Overview, Invitations, Guests, RSVPs, Media)
- Hamburger for account menu (profile, sign out)

### 8.7 Guest shell

No app navigation. Minimal footer: "Powered by EverAfter". Sticky RSVP CTA when token present.

---

## 9. Module Specifications

### 9.1 Health (dev / ops only)

| Endpoint | UI |
|----------|-----|
| `GET /health` | Dev status badge (optional) |
| `GET /health/db` | Admin dev panel only |

No user-facing health page required.

---

### 9.2 Auth module

#### Service: `features/auth/api/auth.api.ts`

| Method | Function | Endpoint |
|--------|----------|----------|
| `register` | `authApi.register` | `POST /auth/register` |
| `login` | `authApi.login` | `POST /auth/login` |
| `refresh` | `authApi.refresh` | `POST /auth/refresh` |
| `logout` | `authApi.logout` | `POST /auth/logout` |
| `me` | `authApi.me` | `GET /auth/me` |
| `forgotPassword` | `authApi.forgotPassword` | `POST /auth/forgot-password` |
| `resetPassword` | `authApi.resetPassword` | `POST /auth/reset-password` |
| `changePassword` | `authApi.changePassword` | `POST /auth/change-password` |
| `logoutAll` | `authApi.logoutAll` | `POST /auth/logout-all` |

#### RegisterPage — form fields

| Field | Validation | Error handling |
|-------|------------|----------------|
| email | email, max 255 | 409 conflict → "Account exists" |
| password | password rules | Zod + API details |
| firstName | required, max 100 | |
| lastName | required, max 100 | |

**Loading:** button spinner. **Success:** toast + redirect `/dashboard`. **Empty:** N/A.

#### LoginPage

| Field | Validation |
|-------|------------|
| email | email |
| password | min 1 |

**Error:** 401 → "Invalid email or password" (generic). **Rate limit:** 429 toast.

#### ForgotPasswordPage

Single email field. **Always** show: "If an account exists, a reset link has been sent."

#### ResetPasswordPage

| Field | Validation |
|-------|------------|
| password | password rules |
| confirmPassword | must match (client only) |

Token from `?token=` query. **Error:** 400 invalid/expired token.

#### AccountSettingsPage (tabs)

**Profile tab:** display `GET /auth/me` fields (read-only — no profile update endpoint exists).

**Security tab:**
- Change password form → `POST /auth/change-password`
- "Sign out all devices" → `POST /auth/logout-all` + local logout

---

### 9.3 Templates (public)

#### `GET /public/templates`

**Pages:** LandingPage (showcase section), TemplateGalleryPage

**Query keys:** `['templates']` — staleTime 1h

**UI:** Card grid with `previewImageUrl`, `name`, `description`, `isPremium` badge, `minPlanSlug` label.

**Empty:** "No templates available."

**Note:** Selecting a template on CreateInvitationPage stores `templateId` for `POST .../invitations`.

---

### 9.4 Events module

#### Service: `features/events/api/events.api.ts`

| Function | Endpoint |
|----------|----------|
| `list` | `GET /events` |
| `get` | `GET /events/:eventId` |
| `create` | `POST /events` |
| `update` | `PATCH /events/:eventId` |
| `remove` | `DELETE /events/:eventId` |

#### EventsListPage

- **Data:** `GET /events` (no pagination — returns merged owned + accepted collaborations)
- **Display:** cards with title, partners, date, venue, guest count from detail fetch or list item
- **Empty:** "Create your first event" CTA → `/dashboard/events/new`
- **Loading:** skeleton cards
- **Actions:** click → EventHub; owner sees delete with confirm dialog

#### CreateEventPage / EditEventPage

| Field | Type | Validation |
|-------|------|------------|
| title | text | required, max 255 |
| partnerOne | text | optional, max 100 |
| partnerTwo | text | optional, max 100 |
| eventDate | date | optional, ISO date `YYYY-MM-DD` |
| eventTimezone | select | default `UTC`, max 64 |
| venueName | text | optional, max 255 |
| venueAddress | textarea | optional |

**Create success:** redirect to `/dashboard/events/:eventId`.  
**Delete:** `DELETE` → redirect `/dashboard/events`. Confirm dialog. Owner only.

#### EventHubPage

- **Data:** `GET /events/:eventId`
- **Widgets:** invitation count, guest `_count.guests`, link cards to sub-modules
- **Quick stats:** `GET .../guests/rsvp-summary` for RSVP overview

---

### 9.5 Invitations module

#### Service: `features/invitations/api/invitations.api.ts`

| Function | Endpoint |
|----------|----------|
| `list` | `GET /events/:eventId/invitations` |
| `get` | `GET /events/:eventId/invitations/:invitationId` |
| `create` | `POST /events/:eventId/invitations` |
| `update` | `PATCH /events/:eventId/invitations/:invitationId` |
| `publish` | `POST .../invitations/:invitationId/publish` |
| `archive` | `POST .../invitations/:invitationId/archive` |
| `remove` | `DELETE .../invitations/:invitationId` |
| `listSections` | `GET .../invitations/:invitationId/sections` |
| `createSection` | `POST .../sections` |
| `updateSection` | `PATCH .../sections/:sectionId` |
| `removeSection` | `DELETE .../sections/:sectionId` |
| `reorderSections` | `PATCH .../sections/reorder` |
| `rsvpAnalytics` | `GET .../invitations/:invitationId/rsvp-analytics` |

#### InvitationsListPage

**Query params:** `page`, `limit`, `status`, `templateId`, `search`/`q`, `sortBy`, `sortOrder`

| Filter | Values |
|--------|--------|
| status | draft, published, archived |
| sortBy | createdAt, updatedAt, publishedAt, headline, viewCount |

**Table columns:** headline/slug, status chip, template, sections count, RSVP count, viewCount, publishedAt, actions

**Status chips (design tokens):**

| Status | Style |
|--------|-------|
| draft | Warm Beige `#EDE5DA` |
| published | Champagne Gold `#D8C2A3` |
| archived | Sandstone border |

**Empty:** "Create your first invitation"

#### CreateInvitationPage

| Field | Validation |
|-------|------------|
| slug | `^[a-z0-9]+(-[a-z0-9]+)*$`, max 100, required |
| templateId | optional UUID (from templates list) |
| headline | max 255 |
| subheadline | max 2000 |
| bodyContent | max 10000 |
| rsvpDeadline | date optional |
| passwordProtected | boolean |
| themeConfig | JSON editor (advanced) |

**Business rules (UI must enforce messaging):**
- Slug conflict → 409
- Template applies `themeConfig` + default sections when `sections` omitted

#### InvitationEditorPage (multi-step)

Roman numeral step indicator (per `docs/sitemap.md`):

| Step | Section | Editable via |
|------|---------|--------------|
| I | Details | `PATCH` invitation (headline, slug, rsvpDeadline, …) |
| II | Story | section `story` content |
| III | Schedule | section `schedule` content |
| IV | Gallery | section `gallery` + media picker |
| V | RSVP | section `rsvp` + invitation `rsvpDeadline` |
| VI | Preview & Publish | read-only preview + publish/archive actions |

**Section management:**
- Drag-and-drop reorder → `PATCH .../sections/reorder` with `orderedIds: string[]`
- Toggle visibility → `PATCH` section `isVisible`
- Add section → `POST .../sections`

**Publish rules:**
- `POST .../publish` — fails if already published (409) or archived (400)
- Cannot set `status: 'draft'` on published invitation via PATCH (400) — use archive

**Archive:** `POST .../archive`

**Preview link:** `/invite/{slug}` (only works when published)

#### InvitationAnalyticsPage

**Data:** `GET .../invitations/:invitationId/rsvp-analytics`

**Charts:** byStatus pie, timeline bar, byCategory stacked bar, dietary notes list, recent messages

---

### 9.6 Guests module

#### Service: `features/guests/api/guests.api.ts`

| Function | Endpoint |
|----------|----------|
| `list` | `GET /events/:eventId/guests` |
| `get` | `GET /events/:eventId/guests/:guestId` |
| `create` | `POST /events/:eventId/guests` |
| `update` | `PATCH /events/:eventId/guests/:guestId` |
| `remove` | `DELETE /events/:eventId/guests/:guestId` |
| `listCategories` | `GET /events/:eventId/guests/categories` |
| `rsvpSummary` | `GET /events/:eventId/guests/rsvp-summary` |
| `rsvpTracking` | `GET /events/:eventId/guests/rsvp-tracking` |
| `importCsv` | `POST /events/:eventId/guests/import` |
| `generateQr` | `GET /events/:eventId/guests/:guestId/qr` |
| `markInviteSent` | `POST /events/:eventId/guests/:guestId/mark-invite-sent` |

#### GuestsListPage — DataTable

**Query params:** `page`, `limit`, `category`, `rsvpStatus`, `invitationId`, `search`/`q`, `sortBy`, `sortOrder`

| sortBy | default |
|--------|---------|
| lastName | ✓ (default asc) |

**Columns:** name, email, category, partySize, rsvpStatus chip, inviteSentAt, actions

**RSVP status chips:**

| Status | Color |
|--------|-------|
| pending | Warm Beige |
| attending | Champagne Gold |
| declined | Sandstone border |
| maybe | outline variant |

**Empty:** "Add guests individually or import CSV"

**Toolbar:** Search, category filter, RSVP status filter, invitation filter, "Import CSV", "Add guest"

#### CreateGuestPage / GuestDetailPage

| Field | Validation |
|-------|------------|
| firstName | required, max 100 |
| lastName | required, max 100 |
| email | optional email |
| category | enum, default `other` |
| partySize | 1–20, default 1 |
| plusOneAllowed | boolean |
| notes | max 500 |

**GuestDetailPage additional actions:**
- **Copy invite link:** `{APP_URL}/invite/{publishedSlug}?token={accessToken}` (client-built; same as QR URL)
- **Download QR:** `GET .../qr?format=png` (blob download) or `format=dataurl` (display)
- **Mark invite sent:** `POST .../mark-invite-sent` → updates `inviteSentAt`
- **Delete guest:** `DELETE` (requires `guest:delete`)

**Note:** `accessToken` is returned on guest object — show in "Invite link" panel for hosts.

#### ImportGuestsPage

- File input: `.csv`, max 5 MB
- `POST` multipart field `file`
- **CSV columns** (aliases supported): firstName, lastName, email, partySize, category, plusOneAllowed, notes
- Max 500 rows per upload
- **Success:** show `imported` count + table of created guests
- **Error:** 400 with `details` array `{ line, message }` for CSV validation failures

**Download template button:** provide sample CSV (client-generated).

---

### 9.7 RSVPs module

#### Service: `features/rsvps/api/rsvps.api.ts`

| Function | Endpoint |
|----------|----------|
| `list` | `GET /events/:eventId/rsvps` |
| `updateByHost` | `PATCH /events/:eventId/rsvps/:rsvpId` |
| `eventAnalytics` | `GET /events/:eventId/rsvps/analytics` |

#### RsvpsPage

**Query params:** `page`, `limit`, `status`, `invitationId`, `search`, `sortBy` (respondedAt, createdAt, status), `sortOrder`

**Table:** guest name, invitation, status, attendingCount, dietaryNotes, message, respondedAt

**Row action:** Edit RSVP dialog → `PATCH .../rsvps/:rsvpId`

| Field | Validation |
|-------|------------|
| status | pending, attending, declined, maybe |
| attendingCount | 0–20; ≥1 if attending |
| dietaryNotes | max 500 |
| message | max 1000 |

**Business rule:** attending requires `attendingCount >= 1`; non-attending forces count 0.

#### RsvpAnalyticsPage

**Data:** `GET /events/:eventId/rsvps/analytics`

Includes `recentMessages` (up to 50). Same chart components as invitation analytics.

**Dashboard widget:** use `GET .../guests/rsvp-summary` for compact stats.

---

### 9.8 Public invitation & guest RSVP

#### Service: `features/public/api/public.api.ts`

| Function | Endpoint |
|----------|----------|
| `getTemplates` | `GET /public/templates` |
| `getPublicPage` | `GET /public/invitations/:slug/page?token=` |
| `getPublicInvitation` | `GET /public/invitations/:slug` (legacy) |
| `getGuestRsvp` | `GET /public/invitations/:slug/rsvp?accessToken=` |
| `submitRsvp` | `POST /public/invitations/:slug/rsvp` |
| `updateGuestRsvp` | `PATCH /public/invitations/:slug/rsvp` |

#### PublicInvitationPage (`/invite/:slug`)

**Query:** `token` or `accessToken` (optional — personalizes guest + RSVP)

**Data:** `GET /public/invitations/:slug/page`

**Render:** invitation `themeConfig`, sections by `sectionType`, event details

**Section renderers:** `HeroSection`, `StorySection`, `ScheduleSection`, `GallerySection`, `RsvpSection`, `RegistrySection`, `CustomSection`

**CTA:** If token present → inline RSVP or link to `/invite/:slug/rsvp?accessToken=`

**Errors:**
- 404 → "Invitation not found or not published"
- 401 → "Invalid guest link"

**Note:** `passwordProtected` field exists on invitation but is **not enforced** by public endpoints — do not build password gate unless backend adds it.

#### GuestRsvpPage

**Requires:** `accessToken` in query

**Load:** `GET /public/invitations/:slug/rsvp?accessToken=`

**Form (submit):** `POST` body:

| Field | Validation |
|-------|------------|
| accessToken | required |
| status | attending, declined, maybe (not pending on submit) |
| attendingCount | 0–20; ≥1 if attending; ≤ partySize |
| dietaryNotes | max 500 |
| message | max 1000 |

**Update existing:** `PATCH` with same fields (partial)

**Business rules:**
- RSVP deadline passed → 400
- `attendingCount` cannot exceed `guest.partySize`
- Update without prior submit → 400 "submit first"

**Success:** thank-you state with message from API (`"Thank you! Your RSVP has been recorded."`)

**Loading:** skeleton form. **Empty token:** "Invalid invitation link" with support text.

---

### 9.9 Media module

#### Service: `features/media/api/media.api.ts`

| Function | Endpoint |
|----------|----------|
| `list` | `GET /events/:eventId/media` |
| `upload` | `POST /events/:eventId/media` |
| `remove` | `DELETE /events/:eventId/media/:mediaId` |

#### MediaLibraryPage

- **Grid** of assets with thumbnail (image/video icon/pdf icon)
- **Upload dropzone:** `multipart/form-data`, field `file`, optional `invitationId`
- **Delete:** confirm dialog → `DELETE`
- **Copy URL:** `fileUrl` is relative `/uploads/{uuid}.ext` — prefix with API origin in production
- **Empty:** "Upload photos for your invitation gallery"
- **Errors:** file type not allowed, size exceeded (10 MB)

**Integration:** Invitation editor gallery section opens media picker from this library.

---

## 10. Complete API → Frontend Mapping

| # | Method | Endpoint | Service | Page / Component |
|---|--------|----------|---------|------------------|
| 1 | GET | `/health` | — | Dev only |
| 2 | GET | `/health/db` | — | Dev only |
| 3 | POST | `/auth/register` | `authApi.register` | RegisterPage |
| 4 | POST | `/auth/login` | `authApi.login` | LoginPage |
| 5 | POST | `/auth/refresh` | `authApi.refresh` | axios interceptor |
| 6 | POST | `/auth/logout` | `authApi.logout` | AppHeader |
| 7 | POST | `/auth/forgot-password` | `authApi.forgotPassword` | ForgotPasswordPage |
| 8 | POST | `/auth/reset-password` | `authApi.resetPassword` | ResetPasswordPage |
| 9 | GET | `/auth/me` | `authApi.me` | AccountSettings, boot |
| 10 | POST | `/auth/logout-all` | `authApi.logoutAll` | AccountSettings |
| 11 | POST | `/auth/change-password` | `authApi.changePassword` | AccountSettings |
| 12 | GET | `/events` | `eventsApi.list` | DashboardPage, EventsListPage |
| 13 | POST | `/events` | `eventsApi.create` | CreateEventPage |
| 14 | GET | `/events/:eventId` | `eventsApi.get` | EventHubPage, breadcrumbs |
| 15 | PATCH | `/events/:eventId` | `eventsApi.update` | EditEventPage |
| 16 | DELETE | `/events/:eventId` | `eventsApi.remove` | EditEventPage |
| 17 | GET | `/events/:eventId/invitations` | `invitationsApi.list` | InvitationsListPage |
| 18 | POST | `/events/:eventId/invitations` | `invitationsApi.create` | CreateInvitationPage |
| 19 | GET | `/events/:eventId/invitations/:id` | `invitationsApi.get` | InvitationEditorPage |
| 20 | PATCH | `/events/:eventId/invitations/:id` | `invitationsApi.update` | InvitationEditorPage |
| 21 | POST | `.../invitations/:id/publish` | `invitationsApi.publish` | InvitationEditorPage |
| 22 | POST | `.../invitations/:id/archive` | `invitationsApi.archive` | InvitationEditorPage |
| 23 | DELETE | `.../invitations/:id` | `invitationsApi.remove` | InvitationsListPage |
| 24 | GET | `.../invitations/:id/rsvp-analytics` | `invitationsApi.rsvpAnalytics` | InvitationAnalyticsPage |
| 25 | GET | `.../invitations/:id/sections` | `invitationsApi.listSections` | InvitationEditorPage |
| 26 | POST | `.../invitations/:id/sections` | `invitationsApi.createSection` | InvitationEditorPage |
| 27 | PATCH | `.../sections/reorder` | `invitationsApi.reorderSections` | SectionList DnD |
| 28 | PATCH | `.../sections/:sectionId` | `invitationsApi.updateSection` | SectionEditor |
| 29 | DELETE | `.../sections/:sectionId` | `invitationsApi.removeSection` | SectionEditor |
| 30 | GET | `/events/:eventId/guests` | `guestsApi.list` | GuestsListPage |
| 31 | POST | `/events/:eventId/guests` | `guestsApi.create` | CreateGuestPage |
| 32 | GET | `/events/:eventId/guests/:guestId` | `guestsApi.get` | GuestDetailPage |
| 33 | PATCH | `/events/:eventId/guests/:guestId` | `guestsApi.update` | GuestDetailPage |
| 34 | DELETE | `/events/:eventId/guests/:guestId` | `guestsApi.remove` | GuestDetailPage |
| 35 | GET | `.../guests/categories` | `guestsApi.listCategories` | Guest forms |
| 36 | GET | `.../guests/rsvp-summary` | `guestsApi.rsvpSummary` | Dashboard, EventHub |
| 37 | GET | `.../guests/rsvp-tracking` | `guestsApi.rsvpTracking` | RsvpsPage (tracking tab) |
| 38 | POST | `.../guests/import` | `guestsApi.importCsv` | ImportGuestsPage |
| 39 | GET | `.../guests/:guestId/qr` | `guestsApi.generateQr` | GuestDetailPage |
| 40 | POST | `.../guests/:guestId/mark-invite-sent` | `guestsApi.markInviteSent` | GuestDetailPage |
| 41 | GET | `/events/:eventId/rsvps` | `rsvpsApi.list` | RsvpsPage |
| 42 | PATCH | `/events/:eventId/rsvps/:rsvpId` | `rsvpsApi.updateByHost` | RsvpEditDialog |
| 43 | GET | `/events/:eventId/rsvps/analytics` | `rsvpsApi.eventAnalytics` | RsvpAnalyticsPage |
| 44 | GET | `/events/:eventId/media` | `mediaApi.list` | MediaLibraryPage |
| 45 | POST | `/events/:eventId/media` | `mediaApi.upload` | MediaUploadDropzone |
| 46 | DELETE | `/events/:eventId/media/:mediaId` | `mediaApi.remove` | MediaLibraryPage |
| 47 | GET | `/public/templates` | `publicApi.getTemplates` | LandingPage, TemplateGallery |
| 48 | GET | `/public/invitations/:slug/page` | `publicApi.getPublicPage` | PublicInvitationPage |
| 49 | GET | `/public/invitations/:slug` | `publicApi.getPublicInvitation` | Legacy fallback |
| 50 | GET | `/public/invitations/:slug/rsvp` | `publicApi.getGuestRsvp` | GuestRsvpPage |
| 51 | POST | `/public/invitations/:slug/rsvp` | `publicApi.submitRsvp` | GuestRsvpPage |
| 52 | PATCH | `/public/invitations/:slug/rsvp` | `publicApi.updateGuestRsvp` | GuestRsvpPage |

---

## 11. Component Architecture

### 11.1 Layout components

| Component | Responsibility |
|-----------|----------------|
| `MarketingLayout` | Public nav, footer |
| `AuthLayout` | Centered auth card |
| `AppLayout` | Sidebar + header + breadcrumbs + `<Outlet>` |
| `GuestLayout` | Full-bleed invitation, no dashboard chrome |
| `EventLayout` | Wraps event-scoped routes; provides `eventId` context |

### 11.2 Shared components (`components/`)

| Component | Used by |
|-----------|---------|
| `DataTable` | Guests, Invitations, RSVPs lists |
| `Pagination` | All paginated tables |
| `SearchInput` | Debounced search → query param |
| `FilterSelect` | Status, category filters |
| `StatusChip` | Invitation, RSVP, invite-sent status |
| `ConfirmDialog` | Delete actions |
| `EmptyState` | All list pages |
| `PageHeader` | Title + description + primary action |
| `LoadingSkeleton` | Cards, tables, forms |
| `ErrorAlert` | API errors |
| `FileDropzone` | Media upload, CSV import |
| `QrCodeDisplay` | Guest detail |
| `CopyToClipboard` | Invite links, slug |
| `RomanNumeralSteps` | Invitation editor |
| `SectionRenderer` | Public invitation |
| `AnalyticsCharts` | RSVP analytics pages |
| `ThemeProvider` | Apply invitation `themeConfig` on guest pages |

### 11.3 Shadcn UI mapping

| Shadcn | Usage |
|--------|-------|
| Button | CTAs |
| Input, Textarea | Forms |
| Select | Category, status, timezone |
| Form | React Hook Form wrapper |
| Table | DataTables |
| Dialog | Edit RSVP, delete confirm |
| DropdownMenu | Row actions |
| Tabs | Event hub, settings, editor steps |
| Card | Dashboard widgets, event cards |
| Badge | Status chips |
| Toast (Sonner) | Success/error notifications |
| Sheet | Mobile nav |
| Calendar | eventDate, rsvpDeadline |
| Avatar | User menu |
| Skeleton | Loading states |

### 11.4 Feature component hierarchy (example: Guests)

```
GuestsListPage
├── PageHeader
├── GuestFilters (search, category, rsvpStatus)
├── DataTable<Guest>
│   └── GuestRowActions (view, delete)
├── Pagination
└── EmptyState

GuestDetailPage
├── PageHeader
├── GuestForm (edit mode)
├── InvitePanel
│   ├── CopyToClipboard (rsvpUrl)
│   ├── QrCodeDisplay
│   └── MarkInviteSentButton
└── DeleteGuestButton
```

---

## 12. State Management

### 12.1 TanStack Query key conventions

```typescript
['auth', 'me']
['events']
['events', eventId]
['events', eventId, 'invitations', params]
['events', eventId, 'invitations', invitationId]
['events', eventId, 'guests', params]
['events', eventId, 'guests', guestId]
['events', eventId, 'rsvps', params]
['events', eventId, 'rsvps', 'analytics']
['events', eventId, 'media']
['templates']
['public', 'invitation', slug, token]
```

### 12.2 Mutation invalidation rules

| Mutation | Invalidate |
|----------|------------|
| Create event | `['events']` |
| Update event | `['events', eventId]` |
| Create/update guest | `['events', eventId, 'guests']`, `['events', eventId, 'rsvps']` |
| Import CSV | same as guest |
| Publish invitation | `['events', eventId, 'invitations']` |
| Submit guest RSVP | `['public', 'invitation', slug]` |
| Upload media | `['events', eventId, 'media']` |

### 12.3 Zustand stores

| Store | State |
|-------|-------|
| `auth.store` | user, tokens, session actions |
| `ui.store` | sidebar collapsed, theme (optional) |
| `editor.store` | invitation wizard step, unsaved changes flag |

### 12.4 URL state

Persist table filters in URL search params for shareable/bookmarkable views:

```
/dashboard/events/:eventId/guests?page=2&category=family&rsvpStatus=pending&search=chen
```

---

## 13. Form Validation (Zod Mirrors)

Create `features/{module}/schemas.ts` duplicating backend validators.

### 13.1 `authSchemas.ts`

```typescript
export const passwordSchema = z.string()
  .min(8).max(128)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number');

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});
// … loginSchema, changePasswordSchema, resetPasswordSchema, forgotPasswordSchema
```

### 13.2 `eventSchemas.ts`

Mirror `createEventSchema` / `updateEventSchema`.

### 13.3 `invitationSchemas.ts`

Include `slugSchema` with regex `/^[a-z0-9]+(-[a-z0-9]+)*$/`.

### 13.4 `guestSchemas.ts`

Mirror `createGuestSchema`; categories from API or static enum.

### 13.5 `rsvpSchemas.ts`

- `guestSubmitRsvpSchema` — mirror `submitRsvpSchema` + refine attendingCount vs partySize (client-side; server also validates)
- `hostUpdateRsvpSchema` — mirror `hostUpdateRsvpSchema`

### 13.6 API error → form field mapping

```typescript
function applyApiValidationErrors(error: ApiError, setError: UseFormSetError) {
  error.error.details?.forEach(({ field, message }) => {
    setError(field as FieldPath, { message });
  });
}
```

---

## 14. Backend Gaps — Do Not Build

The following exist in the **database schema** or **RBAC config** but have **no REST API**. Do not build UI for these until backend endpoints exist:

| Feature | Reason |
|---------|--------|
| Subscription / billing management | No `GET /plans`, no Stripe, `SUBSCRIPTION_LIMIT` never thrown |
| Collaborator invite/manage UI | `COLLABORATOR_MANAGE` defined but no routes |
| Admin panel | `admin` role exists; no admin routes |
| User profile update (name, avatar) | No `PATCH /auth/me` |
| Email verification flow | `emailVerifiedAt` field; no verify endpoint |
| In-app notifications | No notification model or API |
| RSVP / guest export (CSV, PDF) | No export endpoints |
| `passwordProtected` invitation gate | Field stored; public service does not check it |
| Guest `role` field editing | Not in create/update validators |
| Event `coverImageUrl` direct upload | Field on model; no dedicated endpoint (use media + manual URL or PATCH event if API extended) |
| Real-time updates / WebSockets | Not implemented |
| Audit log viewer | Table in DB schema; no API |

### Landing page pricing section

If shown, use **static marketing copy** only — not API-driven.

---

## 15. Development Task Breakdown

### Phase 0 — Foundation (Week 1)

- [ ] Vite + React + TS + Tailwind + Shadcn setup
- [ ] Design tokens from `client/DESIGN (2).md`
- [ ] Axios client + interceptors + API types
- [ ] TanStack Query provider + Zustand auth store
- [ ] React Router with layout shells
- [ ] `ProtectedRoute` + auth boot refresh
- [ ] Shared: `DataTable`, `Pagination`, `StatusChip`, `EmptyState`, `PageHeader`, toasts

### Phase 1 — Auth & Events (Week 2)

- [ ] Login, Register, Forgot/Reset password pages
- [ ] Account settings (me, change password, logout all)
- [ ] Dashboard page (events list summary)
- [ ] Events list, create, edit, delete
- [ ] Event hub overview

### Phase 2 — Invitations (Week 3–4)

- [ ] Templates fetch on create flow
- [ ] Invitations list with filters/pagination
- [ ] Create invitation
- [ ] Invitation editor (6 steps, sections CRUD, reorder)
- [ ] Publish / archive flows
- [ ] Public invitation page + section renderers

### Phase 3 — Guests & RSVPs (Week 5)

- [ ] Guests list with filters/search/sort
- [ ] Create/edit/delete guest
- [ ] CSV import page
- [ ] Guest detail: QR, invite link, mark sent
- [ ] RSVPs list + host edit dialog
- [ ] RSVP analytics pages (event + invitation)
- [ ] Guest RSVP public form

### Phase 4 — Media & Polish (Week 6)

- [ ] Media library upload/delete
- [ ] Gallery section media picker integration
- [ ] Landing page + template gallery (public templates API)
- [ ] Mobile responsive pass
- [ ] Error boundaries, 404 page
- [ ] E2E smoke tests for auth + create event + publish invitation + guest RSVP

### Phase 5 — Hardening

- [ ] Permission-aware UI (owner vs collaborator 403 handling)
- [ ] URL-persisted table state
- [ ] Optimistic updates for guest RSVP status
- [ ] Image URL resolution (`/uploads` base URL config)
- [ ] Accessibility audit (forms, tables, focus management)

---

## Appendix A — Query hook examples

```typescript
// features/guests/hooks/useGuests.ts
export function useGuests(eventId: string, params: ListGuestsParams) {
  return useQuery({
    queryKey: ['events', eventId, 'guests', params],
    queryFn: () => guestsApi.list(eventId, params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateGuest(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGuestInput) => guestsApi.create(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
      toast.success('Guest added');
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data.error.message ?? 'Failed to add guest');
    },
  });
}
```

## Appendix B — Environment variables (client)

```env
VITE_API_BASE_URL=/api/v1
VITE_APP_URL=http://localhost:5173
VITE_UPLOADS_BASE_URL=http://localhost:3001
```

## Appendix C — Design reference

Visual system: `client/DESIGN (2).md` — Playfair Display + Inter, pearl white surfaces, champagne gold accents, glassmorphic navigation, status chip colors per `docs/sitemap.md`.

---

*This specification is derived entirely from the EverAfter server codebase as of the current repository state. Update this document when new API routes are added.*
