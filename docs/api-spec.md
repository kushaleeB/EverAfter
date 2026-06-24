# EverAfter — API Specification

> REST API served by Express on port `3001`. All authenticated routes require a `Bearer` JWT token.

**Base URL:** `http://localhost:3001/api`

---

## Authentication

### `POST /auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Eleanor",
  "lastName": "Ashford"
}
```

**Response `201`:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "firstName": "Eleanor", "lastName": "Ashford" },
  "token": "jwt_token"
}
```

### `POST /auth/login`

**Request Body:**
```json
{ "email": "user@example.com", "password": "securePassword123" }
```

**Response `200`:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "firstName": "Eleanor", "lastName": "Ashford" },
  "token": "jwt_token"
}
```

### `GET /auth/me`

Returns the authenticated user's profile.

**Response `200`:**
```json
{ "id": "uuid", "email": "user@example.com", "firstName": "Eleanor", "lastName": "Ashford", "avatarUrl": null }
```

---

## Events

### `GET /events`

List all events for the authenticated user.

**Response `200`:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Eleanor & James",
      "partnerOne": "Eleanor",
      "partnerTwo": "James",
      "eventDate": "2026-09-12",
      "venueName": "The Glasshouse at Syon",
      "coverImage": null,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### `POST /events`

**Request Body:**
```json
{
  "title": "Eleanor & James",
  "partnerOne": "Eleanor",
  "partnerTwo": "James",
  "eventDate": "2026-09-12",
  "venueName": "The Glasshouse at Syon",
  "venueAddress": "Syon Park, Brentford, London"
}
```

**Response `201`:** Event object.

### `GET /events/:id`

**Response `200`:** Single event object.

### `PATCH /events/:id`

Partial update of event fields.

### `DELETE /events/:id`

**Response `204`:** No content.

---

## Invitations

### `GET /events/:eventId/invitation`

Get the invitation for an event (authenticated).

### `PUT /events/:eventId/invitation`

Create or update invitation content.

**Request Body:**
```json
{
  "headline": "Together, Forever",
  "subheadline": "We invite you to celebrate our wedding",
  "bodyContent": "Join us for an evening of love...",
  "themeConfig": { "primaryColor": "#6d5c43" },
  "sections": [
    { "sectionType": "hero", "sortOrder": 0, "content": {}, "isVisible": true }
  ]
}
```

### `POST /events/:eventId/invitation/publish`

Publish the invitation. Generates slug if not set.

**Response `200`:**
```json
{ "slug": "eleanor-and-james", "status": "published", "publishedAt": "2026-06-22T00:00:00Z" }
```

### `POST /events/:eventId/invitation/archive`

Archive a published invitation.

### `GET /invitations/:slug` _(public)_

Fetch a published invitation by slug for the guest-facing page.

**Response `200`:**
```json
{
  "headline": "Together, Forever",
  "subheadline": "We invite you to celebrate our wedding",
  "event": { "partnerOne": "Eleanor", "partnerTwo": "James", "eventDate": "2026-09-12" },
  "sections": [],
  "themeConfig": {}
}
```

---

## Guests

### `GET /events/:eventId/guests`

List all guests for an event.

### `POST /events/:eventId/guests`

Add a single guest.

**Request Body:**
```json
{ "email": "guest@example.com", "firstName": "Sarah", "lastName": "Chen", "partySize": 2 }
```

### `POST /events/:eventId/guests/import`

Bulk import guests from CSV.

### `PATCH /events/:eventId/guests/:guestId`

Update guest details.

### `DELETE /events/:eventId/guests/:guestId`

**Response `204`:** No content.

---

## RSVPs

### `GET /events/:eventId/rsvps`

List all RSVPs with guest details (authenticated).

**Response `200`:**
```json
{
  "summary": { "total": 50, "attending": 32, "declined": 5, "pending": 13 },
  "rsvps": []
}
```

### `POST /invitations/:slug/rsvp` _(public)_

Submit or update an RSVP via guest access token.

**Request Body:**
```json
{
  "accessToken": "hex_token",
  "status": "attending",
  "attendingCount": 2,
  "dietaryNotes": "Vegetarian",
  "message": "So excited to celebrate with you!"
}
```

**Response `200`:** RSVP object.

---

## Media

### `GET /events/:eventId/media`

List media assets for an event.

### `POST /events/:eventId/media`

Upload a media file (multipart/form-data).

**Response `201`:**
```json
{ "id": "uuid", "fileName": "hero.jpg", "fileUrl": "/uploads/hero.jpg", "mimeType": "image/jpeg" }
```

### `DELETE /events/:eventId/media/:mediaId`

**Response `204`:** No content.

---

## Health

### `GET /health`

**Response `200`:**
```json
{ "status": "ok", "service": "everafter-api" }
```

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": []
  }
}
```

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid request body |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate slug or email |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
