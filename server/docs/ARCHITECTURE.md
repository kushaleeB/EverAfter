# EverAfter Server — Architecture

Enterprise-grade Express.js backend for the luxury wedding invitation SaaS platform.

## Folder Structure

```
server/
├── prisma/
│   └── schema.prisma          # Prisma ORM models (maps to PostgreSQL schema)
├── uploads/                   # Local file storage (swap for S3 in production)
├── src/
│   ├── server.js              # Entry point, graceful shutdown
│   ├── app.js                 # Express app composition
│   ├── config/
│   │   ├── env.js             # Zod-validated environment config
│   │   └── roles.js           # RBAC permission matrix
│   ├── api/
│   │   └── v1/                # API version 1
│   │       └── routes/        # Route definitions only
│   ├── controllers/           # HTTP layer — parse request, call service, send response
│   ├── services/              # Business logic, Prisma queries, domain rules
│   ├── middleware/            # Cross-cutting concerns
│   ├── validators/            # Zod schemas for request validation
│   ├── lib/                   # Shared infrastructure (Prisma, JWT)
│   ├── errors/                # AppError class, error codes
│   └── utils/                 # Helpers (asyncHandler, response formatters)
└── package.json
```

## Layered Architecture

```
Request
  → Middleware (auth, RBAC, validation, rate limit)
    → Controller (thin HTTP adapter)
      → Service (business logic)
        → Prisma (data access)
  → Error middleware (consistent JSON errors)
```

**Rule:** Controllers never call Prisma directly. Services never touch `req`/`res`.

## API Design (v1)

Base URL: `/api/v1`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | — | Service health |
| GET | `/health/db` | — | Database connectivity |
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Issue JWT pair |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | — | Revoke session |
| GET | `/auth/me` | JWT | Current user profile |
| GET | `/events` | JWT | List user's events |
| POST | `/events` | JWT | Create event |
| GET | `/events/:eventId` | JWT + RBAC | Get event |
| PATCH | `/events/:eventId` | JWT + RBAC | Update event |
| DELETE | `/events/:eventId` | JWT + RBAC | Soft-delete event |
| GET | `/events/:eventId/invitations` | JWT + RBAC | List invitations |
| POST | `/events/:eventId/invitations` | JWT + RBAC | Create invitation |
| POST | `/events/:eventId/invitations/:id/publish` | JWT + RBAC | Publish |
| GET | `/events/:eventId/guests` | JWT + RBAC | List guests |
| POST | `/events/:eventId/guests` | JWT + RBAC | Add guest |
| GET | `/events/:eventId/guests/rsvp-summary` | JWT + RBAC | RSVP stats |
| GET | `/events/:eventId/media` | JWT + RBAC | List media |
| POST | `/events/:eventId/media` | JWT + RBAC | Upload file |
| GET | `/public/templates` | — | List templates |
| GET | `/public/invitations/:slug` | — | Public invitation page |
| POST | `/public/invitations/:slug/rsvp` | — | Guest RSVP |

### Response Envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

## Validation Strategy

- **Zod** schemas in `validators/` — single source of truth for shape + constraints
- **`validate()` middleware** — parses `body`, `params`, or `query`; replaces `req[source]` with typed output
- Validation errors return `400` with field-level `details` array
- Prisma `P2002` (unique) and `P2025` (not found) mapped in error middleware

## RBAC Model

**Global roles** (`users.role`):
- `customer` — standard SaaS user
- `admin` — full platform access

**Event roles** (`event_collaborators.role`):
- `owner` — implicit via `events.owner_id`
- `partner` — co-edit invitations, view RSVPs
- `planner` — manage guests and RSVPs
- `viewer` — read-only

Permissions checked via `requireEventAccess(PERMISSIONS.*)` middleware.

## Security Best Practices

| Concern | Implementation |
|---------|----------------|
| Authentication | JWT access tokens (15m) + refresh token rotation stored in `user_sessions` |
| Password hashing | bcrypt, 12 salt rounds |
| Authorization | RBAC middleware with per-event permission matrix |
| Input validation | Zod on all mutating endpoints |
| Rate limiting | Global (100/15min) + auth endpoints (20/15min) |
| HTTP headers | Helmet.js |
| CORS | Configurable origin, credentials support |
| File uploads | MIME whitelist, size limit, UUID filenames |
| SQL injection | Prisma parameterized queries |
| Error leakage | Production hides stack traces; operational errors only |
| Request tracing | `X-Request-Id` on every request |
| Soft deletes | Application-layer `deletedAt` — no hard deletes on core entities |
| Graceful shutdown | SIGTERM/SIGINT disconnects Prisma |

## Getting Started

```bash
cd server
npm install
npm run db:generate    # Generate Prisma client
npm run dev            # Start with --watch
```

Ensure `DATABASE_URL` is set in root `.env` (or `SUPABASE_URL` with a `postgresql://` connection string).
