# Contributing to EverAfter

Thank you for contributing. This repository is an **npm workspaces monorepo**.

## Repository layout

```
everafter/
├── client/          @everafter/client — React + Vite frontend
├── server/          @everafter/server — Express API + Prisma
├── database/        SQL schema, migrations, seeds
└── docs/            Specifications and architecture
```

## Prerequisites

- **Node.js 20+** (see `.nvmrc`)
- **npm 10+**
- PostgreSQL 15+ (or Supabase)

## Setup

```bash
# From repository root
cp .env.example .env
# Edit .env with your database URL and JWT secrets

npm install
npm run db:generate
```

## Development

```bash
# Run client (5173) + server (3001) together
npm run dev

# Or individually
npm run dev:client
npm run dev:server
```

## Branch naming

| Prefix | Use |
|--------|-----|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Tooling, deps, config |
| `docs/` | Documentation only |
| `refactor/` | Code changes without behavior change |

Examples: `feature/guest-csv-import`, `fix/rsvp-deadline-validation`

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>

[optional body]
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no logic change) |
| `refactor` | Refactoring |
| `test` | Tests |
| `chore` | Build, tooling, deps |
| `perf` | Performance |

**Scopes:** `client`, `server`, `db`, `docs`, `ci`

Examples:

```
feat(client): add guest list data table with pagination
fix(server): prevent publish of archived invitations
chore: add monorepo workspace configuration
docs: update frontend specification
```

## Pull requests

1. Branch from `main`
2. Keep PRs focused (one feature or fix per PR)
3. Update docs when changing API or routes
4. Do not commit `.env`, secrets, or `server/uploads/*` (except `.gitkeep`)
5. Fill out the PR template

## Code style

- **JavaScript (server):** ES modules, 2-space indent, async/await
- **TypeScript (client):** strict mode, functional React components
- Match existing patterns in the module you are editing
- Run `npm run lint` in `client/` before submitting frontend changes

## Environment variables

- Root `.env` is loaded by the server (`server/src/config/env.js`)
- Never commit real credentials
- Use `.env.example` as the source of truth for required variables

## Database changes

1. Add migration SQL under `database/migrations/`
2. Update `server/prisma/schema.prisma` if needed
3. Run `npm run db:generate` from the repo root
4. Document changes in `docs/database-design.md`

## Questions

Open a discussion or issue before large architectural changes.
