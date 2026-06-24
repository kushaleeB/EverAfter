# EverAfter — RSVP System API

## Public Endpoints (no auth)

Base: `/api/v1/public`

### Public Invitation Page
```
GET /invitations/:slug/page?token={accessToken}
```
Returns invitation content, optional guest context, and existing RSVP.

### Get Guest RSVP
```
GET /invitations/:slug/rsvp?accessToken={token}
```

### Submit RSVP
```
POST /invitations/:slug/rsvp
{
  "accessToken": "hex_token",
  "status": "attending",
  "attendingCount": 2,
  "dietaryNotes": "Vegetarian",
  "message": "Can't wait to celebrate!"
}
```

### Update RSVP
```
PATCH /invitations/:slug/rsvp
{
  "accessToken": "hex_token",
  "status": "declined",
  "message": "Sorry we can't make it"
}
```

## Authenticated Endpoints

Base: `/api/v1/events/:eventId`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/rsvps` | List RSVPs (pagination, filter, search) |
| GET | `/rsvps/analytics` | Event RSVP analytics |
| PATCH | `/rsvps/:rsvpId` | Host updates guest RSVP |
| GET | `/invitations/:id/rsvp-analytics` | Per-invitation analytics |

## Analytics Response

```json
{
  "summary": {
    "totalGuests": 50,
    "guestsResponded": 32,
    "guestsPending": 18,
    "responseRate": 64,
    "totalAttendingCount": 58
  },
  "byStatus": { "attending": 28, "declined": 3, "maybe": 1, "pending": 18 },
  "byCategory": { "family": { "attending": 12, "pending": 5 } },
  "timeline": [{ "date": "2026-06-20", "count": 5 }],
  "dietaryNotes": [{ "guest": "Sarah Chen", "notes": "Vegetarian" }],
  "recentMessages": [{ "guest": { "firstName": "Sarah" }, "message": "So excited!" }]
}
```

## Validation Rules

- `attendingCount` must be ≥ 1 when status is `attending`
- `attendingCount` cannot exceed guest `partySize`
- RSVP blocked after `rsvpDeadline` on invitation
- Guest authenticated via `accessToken` only

## Database

- Table: `rsvps` — see `database/rsvp-schema.sql`
- Migration: `database/migrations/004_rsvp_enhancements.sql`
