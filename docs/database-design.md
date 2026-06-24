# EverAfter — Database Design

> PostgreSQL 15+ relational schema for the luxury wedding invitation platform.

---

## Entity Relationship Overview

```
users ──────────────┐
  │                 │ owner_id
  │                 ▼
  │              events ──────────────┐
  │                 │                 │ event_id
  │                 ├──── invitations  │
  │                 │         │       │
  │                 │         ├──── invitation_sections
  │                 │         │
  │                 ├──── guests ───── rsvps
  │                 │
  │                 └──── media_assets
  │
  └──── (uploaded_by) media_assets
```

---

## Tables

### `users`

Account holders — couples, partners, and planners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary key |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `first_name` | VARCHAR(100) | NOT NULL | Given name |
| `last_name` | VARCHAR(100) | NOT NULL | Family name |
| `avatar_url` | TEXT | nullable | Profile image URL |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Last modification |

---

### `events`

A wedding event belonging to a user. One user may own multiple events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `owner_id` | UUID | FK → `users.id`, ON DELETE CASCADE | Event owner |
| `title` | VARCHAR(255) | NOT NULL | Display title (e.g. "Eleanor & James") |
| `partner_one` | VARCHAR(100) | nullable | First partner name |
| `partner_two` | VARCHAR(100) | nullable | Second partner name |
| `event_date` | DATE | nullable | Wedding date |
| `venue_name` | VARCHAR(255) | nullable | Venue display name |
| `venue_address` | TEXT | nullable | Full venue address |
| `cover_image` | TEXT | nullable | Hero/cover image URL |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last modification |

**Indexes:** `idx_events_owner` on `owner_id`

---

### `invitations`

The editorial invitation page for an event. One invitation per event.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `event_id` | UUID | FK → `events.id`, ON DELETE CASCADE | Parent event |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| `status` | `invitation_status` | NOT NULL, default `draft` | `draft`, `published`, `archived` |
| `headline` | VARCHAR(255) | nullable | Main display headline |
| `subheadline` | TEXT | nullable | Supporting text |
| `body_content` | TEXT | nullable | Primary body copy |
| `theme_config` | JSONB | NOT NULL, default `{}` | Design tokens override |
| `published_at` | TIMESTAMPTZ | nullable | When invitation went live |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last modification |

**Indexes:** `idx_invitations_event`, `idx_invitations_slug`, `idx_invitations_status`

---

### `invitation_sections`

Modular content blocks within an invitation (hero, story, schedule, gallery, rsvp).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `invitation_id` | UUID | FK → `invitations.id`, ON DELETE CASCADE | Parent invitation |
| `section_type` | VARCHAR(50) | NOT NULL | Block type identifier |
| `sort_order` | INTEGER | NOT NULL, default 0 | Display order |
| `content` | JSONB | NOT NULL, default `{}` | Section-specific payload |
| `is_visible` | BOOLEAN | NOT NULL, default TRUE | Toggle visibility |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last modification |

**Section types:** `hero`, `story`, `schedule`, `gallery`, `rsvp`, `registry`

**Indexes:** `idx_sections_invitation` on `invitation_id`

---

### `guests`

Invitees associated with an event. Accessed via unique token for RSVP.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `event_id` | UUID | FK → `events.id`, ON DELETE CASCADE | Parent event |
| `email` | VARCHAR(255) | nullable | Contact email |
| `first_name` | VARCHAR(100) | NOT NULL | Given name |
| `last_name` | VARCHAR(100) | NOT NULL | Family name |
| `role` | `guest_role` | NOT NULL, default `guest` | `host`, `partner`, `planner`, `guest` |
| `party_size` | INTEGER | NOT NULL, default 1 | Max attendees in party |
| `access_token` | VARCHAR(64) | NOT NULL, UNIQUE | RSVP authentication token |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last modification |

**Indexes:** `idx_guests_event`, `idx_guests_token`

---

### `rsvps`

Guest responses to an invitation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `guest_id` | UUID | FK → `guests.id`, ON DELETE CASCADE | Responding guest |
| `invitation_id` | UUID | FK → `invitations.id`, ON DELETE CASCADE | Target invitation |
| `status` | `rsvp_status` | NOT NULL, default `pending` | `pending`, `attending`, `declined`, `maybe` |
| `attending_count` | INTEGER | NOT NULL, default 0 | Number attending |
| `dietary_notes` | TEXT | nullable | Dietary restrictions |
| `message` | TEXT | nullable | Personal message to couple |
| `responded_at` | TIMESTAMPTZ | nullable | When guest responded |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last modification |

**Unique constraint:** `(guest_id, invitation_id)` — one RSVP per guest per invitation

**Indexes:** `idx_rsvps_invitation`, `idx_rsvps_status`

---

### `media_assets`

Uploaded images and files for an event.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `event_id` | UUID | FK → `events.id`, ON DELETE CASCADE | Parent event |
| `uploaded_by` | UUID | FK → `users.id`, ON DELETE SET NULL | Uploader |
| `file_name` | VARCHAR(255) | NOT NULL | Original filename |
| `file_url` | TEXT | NOT NULL | Storage URL |
| `mime_type` | VARCHAR(100) | NOT NULL | MIME type |
| `file_size` | INTEGER | nullable | Size in bytes |
| `alt_text` | VARCHAR(255) | nullable | Accessibility alt text |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation |

**Indexes:** `idx_media_event` on `event_id`

---

## Enums

| Enum | Values |
|------|--------|
| `invitation_status` | `draft`, `published`, `archived` |
| `rsvp_status` | `pending`, `attending`, `declined`, `maybe` |
| `guest_role` | `host`, `partner`, `planner`, `guest` |

---

## Design Decisions

1. **JSONB for flexible content** — Invitation sections and theme config use JSONB to support the editorial block editor without schema migrations per section type.

2. **Slug-based public access** — Published invitations are accessed via human-readable slugs (`/invite/eleanor-and-james`), not UUIDs.

3. **Guest access tokens** — RSVPs are authenticated via a per-guest hex token rather than requiring guest accounts, reducing friction for invitees.

4. **Cascade deletes** — Deleting an event cascades to invitations, guests, RSVPs, and media, keeping the data model clean.

5. **Auto-updated timestamps** — A shared `set_updated_at()` trigger maintains `updated_at` on all mutable tables.

---

## Setup

```bash
# Create database
createdb everafter

# Apply schema
psql -d everafter -f database/schema.sql

# Load seed data
psql -d everafter -f database/seed.sql
```
