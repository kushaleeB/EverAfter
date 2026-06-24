# EverAfter — Guest Management API

Base: `/api/v1/events/:eventId/guests`

## Architecture

```
Routes → Auth + RBAC + Validation → Controller → Service → Repository → Prisma
```

## Endpoints

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | `/` | guest:read | List guests (pagination, filter, search) |
| POST | `/` | guest:write | Create guest |
| GET | `/:guestId` | guest:read | Get guest with RSVP data |
| PATCH | `/:guestId` | guest:write | Update guest |
| DELETE | `/:guestId` | guest:delete | Soft delete |
| POST | `/import` | guest:write | CSV bulk import |
| GET | `/categories` | guest:read | List guest category options |
| GET | `/rsvp-summary` | rsvp:read | RSVP stats by status & category |
| GET | `/rsvp-tracking` | rsvp:read | Guest list with RSVP status |
| GET | `/:guestId/qr` | guest:read | Generate RSVP QR code |
| POST | `/:guestId/mark-invite-sent` | guest:write | Mark invite as sent |

## Guest Categories

`family` · `friends` · `colleagues` · `vip` · `wedding_party` · `other`

## List Query Parameters

| Param | Description |
|-------|-------------|
| `page`, `limit` | Pagination |
| `category` | Filter by guest category |
| `rsvpStatus` | Filter: pending, attending, declined, maybe |
| `invitationId` | Scope RSVP filter to specific invitation |
| `search` / `q` | Search name, email, notes |
| `sortBy` | lastName, firstName, createdAt, category, inviteSentAt |
| `sortOrder` | asc \| desc |

## CSV Import

`POST /import` with `multipart/form-data`, field name `file`.

**CSV columns:** firstName, lastName, email, partySize, category, plusOneAllowed, notes

```csv
firstName,lastName,email,partySize,category,plusOneAllowed,notes
Sarah,Chen,sarah@example.com,2,family,true,Vegetarian
Marcus,Wright,marcus@example.com,1,friends,false,
```

Max 500 rows per upload.

## QR Code

`GET /:guestId/qr?format=dataurl` — JSON with base64 data URL  
`GET /:guestId/qr?format=png` — PNG image response  
`GET /:guestId/qr?invitationId=uuid` — QR for specific invitation

QR encodes: `{APP_URL}/invite/{slug}?token={accessToken}`

## RSVP Summary Response

```json
{
  "totalGuests": 50,
  "guestsWithRsvp": 32,
  "guestsWithoutRsvp": 18,
  "responseRate": 64,
  "byStatus": { "attending": 28, "declined": 3, "maybe": 1, "pending": 18 },
  "byCategory": { "family": { "attending": 12, "pending": 5 } },
  "guestCountByCategory": { "family": 20, "friends": 30 }
}
```

## Database Migration

Run `database/migrations/003_guest_category.sql` in Supabase to add the `category` column.
