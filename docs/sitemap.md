# EverAfter — Site Map

> Luxury wedding invitation platform with a "Quiet Luxury" editorial aesthetic.

## Public Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Brand hero, value proposition, cinematic photography |
| `/login` | Sign In | Email/password authentication |
| `/register` | Sign Up | Account creation for couples and planners |
| `/invite/:slug` | Guest Invitation | Public-facing invitation page (published only) |
| `/invite/:slug/rsvp` | RSVP Form | Guest response flow via access token |

## Authenticated — Dashboard

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Overview | Event summary, RSVP stats, quick actions |
| `/dashboard/events` | Events List | All events owned by the user |
| `/dashboard/events/new` | Create Event | New wedding event wizard |
| `/dashboard/events/:id` | Event Detail | Event settings, date, venue, cover image |
| `/dashboard/events/:id/invitation` | Invitation Editor | Multi-step editorial invitation builder |
| `/dashboard/events/:id/guests` | Guest Management | Guest list, import, access tokens |
| `/dashboard/events/:id/rsvps` | RSVP Dashboard | Response tracking and export |
| `/dashboard/events/:id/media` | Media Library | Uploaded photos and assets |
| `/dashboard/settings` | Account Settings | Profile, password, notifications |

## Invitation Editor — Step Flow

The invitation creation flow uses a horizontal step indicator with Roman numeral markers:

| Step | Section | Description |
|------|---------|-------------|
| I | Details | Headline, subheadline, couple names, date |
| II | Story | Editorial narrative block |
| III | Schedule | Timeline of ceremony and reception |
| IV | Gallery | Photo grid with parallax hero |
| V | RSVP | Deadline, custom message, dietary options |
| VI | Preview & Publish | Live preview, slug, publish/archive |

## Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│  Logo          Dashboard  Events  Settings  Avatar  │  ← Glassmorphic nav (authenticated)
└─────────────────────────────────────────────────────┘

Public Landing:
┌─────────────────────────────────────────────────────┐
│  Logo                              Sign In  Get Started │
└─────────────────────────────────────────────────────┘
```

## User Roles & Access

| Role | Access |
|------|--------|
| **Host** | Full CRUD on events, invitations, guests, media |
| **Partner** | Co-edit invitation, view RSVPs |
| **Planner** | Manage guests and RSVPs on behalf of host |
| **Guest** | View published invitation, submit RSVP via token |

## Status Chips (UI)

| Status | Color Token | Context |
|--------|-------------|---------|
| Draft | Warm Beige `#EDE5DA` | Unpublished invitation |
| Published | Champagne Gold `#D8C2A3` | Live invitation |
| Sent | Soft Graphite `#444444` on beige | Guest invite dispatched |
| Pending | Warm Beige | Awaiting RSVP |
| Attending | Champagne Gold | Confirmed RSVP |
| Declined | Sandstone border | Declined RSVP |
