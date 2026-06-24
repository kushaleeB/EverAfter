# EverAfter — Invitation CRUD API

Base: `/api/v1/events/:eventId/invitations`

## Architecture

```
Routes → Middleware (auth, RBAC, validate) → Controller → Service → Repository → Prisma
```

## Invitation Endpoints

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | `/` | invitation:read | List with pagination, filter, search |
| POST | `/` | invitation:write | Create invitation |
| GET | `/:invitationId` | invitation:read | Get by ID |
| PATCH | `/:invitationId` | invitation:write | Update invitation |
| DELETE | `/:invitationId` | invitation:write | Soft delete |
| POST | `/:invitationId/publish` | invitation:publish | Publish invitation |
| POST | `/:invitationId/archive` | invitation:write | Archive invitation |

## Section Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/:invitationId/sections` | List sections |
| POST | `/:invitationId/sections` | Create section |
| PATCH | `/:invitationId/sections/reorder` | Reorder sections |
| PATCH | `/:invitationId/sections/:sectionId` | Update section |
| DELETE | `/:invitationId/sections/:sectionId` | Soft delete section |

## List Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (default 20, max 100) |
| `status` | draft \| published \| archived | Filter by status |
| `templateId` | uuid | Filter by template |
| `search` or `q` | string | Search headline, subheadline, slug, body |
| `sortBy` | createdAt \| updatedAt \| publishedAt \| headline \| viewCount | Sort field |
| `sortOrder` | asc \| desc | Sort direction (default desc) |

## Example List Response

```json
{
  "success": true,
  "data": [ { "id": "...", "slug": "eleanor-and-james", "status": "draft" } ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Create Example

```json
POST /api/v1/events/:eventId/invitations
{
  "slug": "eleanor-and-james",
  "templateId": "uuid",
  "headline": "Together, Forever",
  "subheadline": "We invite you to celebrate",
  "sections": [
    { "sectionType": "hero", "sortOrder": 0, "content": { "imageUrl": "/hero.jpg" } }
  ]
}
```
