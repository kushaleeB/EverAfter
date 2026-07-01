# EverAfter

A luxury wedding invitation platform built with a **Quiet Luxury** editorial aesthetic — understated elegance, cinematic photography, and timeless design.

## Overview

EverAfter lets couples create beautiful, magazine-quality digital wedding invitations, manage guest lists, and track RSVPs. The platform prioritizes emotional resonance over functional density, targeting a discerning audience who values premium craftsmanship.

## Monorepo structure

This repository is an **npm workspaces** monorepo:

```
everafter/
├── client/              @everafter/client — React 19 + Vite + TypeScript
├── server/              @everafter/server — Express API + Prisma
├── database/            PostgreSQL schema, migrations, seeds
├── docs/                Specifications and architecture
├── .github/             CI workflows and PR templates
├── package.json         Root workspace scripts
└── .env.example         Environment template (copy to .env)
```

| Package | Port | Description |
|---------|------|-------------|
| `@everafter/client` | 5173 | React SPA (proxies `/api` → server) |
| `@everafter/server` | 3001 | REST API at `/api/v1` |

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express (Node.js), Prisma |
| Database | PostgreSQL 15+ (Supabase) |
| Styling | Custom design tokens (Playfair Display + Inter) |

## Getting started

### Prerequisites

- **Node.js 20+** (`nvm use` reads `.nvmrc`)
- **npm 10+**
- PostgreSQL 15+ or Supabase project

### 1. Clone and install

```bash
git clone <repository-url>
cd everafter

cp .env.example .env
# Edit .env — DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

npm install
npm run db:generate
```

### 2. Database setup

Apply schema in Supabase SQL Editor or locally:

```bash
psql -d everafter -f database/schema.sql
psql -d everafter -f database/seed.sql
```

Run migrations in `database/migrations/` as needed.

### 3. Development

```bash
# Client (5173) + server (3001) together
npm run dev

# Or run individually
npm run dev:client
npm run dev:server
```

### 4. Production build

```bash
npm run build:client   # outputs to client/dist
npm start              # runs Express server
```

### 5. Deploy API to Railway

The Express backend is configured for [Railway](https://railway.app) in `server/` (`Dockerfile`, `railway.toml`).

1. Create a new Railway project → **Deploy from GitHub repo** → select this repository.
2. In service **Settings**, set **Root Directory** to `server`.
3. Add environment variables (see `.env.example` → Railway section):
   - `NODE_ENV=production`
   - `DATABASE_URL` (Supabase Postgres)
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
   - `APP_URL` (production frontend URL)
   - `CORS_ORIGIN` (comma-separated: production frontend + `http://localhost:5173` for local testing)
4. Deploy. Railway assigns a public URL (e.g. `https://everafter-api.up.railway.app`).
5. Verify: `GET https://<your-railway-url>/api/v1/health`
6. Point local frontend at the hosted API in `.env.local`:
   ```
   VITE_API_PROXY_TARGET=https://<your-railway-url>
   ```
   Then run `npm run dev:remote`.

**Note:** Uploaded files are stored on the container disk and reset on redeploy. For production, plan to move media to Supabase Storage or S3.

## Root scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start client and server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Express API with `--watch` |
| `npm run build` | Build client for production |
| `npm run start` | Start production server |
| `npm run lint` | Lint client |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio |

## Design system

The visual direction follows a **Modern Editorial** style rooted in warm neutrals:

- **Primary:** Champagne Gold (`#D8C2A3`) and Muted Bronze (`#B18A63`)
- **Typography:** Playfair Display (headlines) + Inter (body/UI)
- **Layout:** 12-column grid, 120px+ section gaps, generous whitespace

See `client/DESIGN.md` for the full design token reference.

## Documentation

| Doc | Description |
|-----|-------------|
| [Site Map](docs/sitemap.md) | Routes, navigation, user roles |
| [API Spec](docs/api-spec.md) | REST endpoints |
| [Frontend Spec](docs/FRONTEND_SPECIFICATION.md) | Complete frontend blueprint |
| [Database Design](docs/database-design.md) | Schema and relationships |
| [Contributing](CONTRIBUTING.md) | Branch naming, commits, PR workflow |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, [Conventional Commits](https://www.conventionalcommits.org/), and PR guidelines.

## License

Private — All rights reserved.
