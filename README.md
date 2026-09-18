# Space

**Space** is a visual collaboration workspace: documents, canvases, and mind
maps, organized into shared workspaces with team members and roles.

## Features

- **Workspaces** — create workspaces, invite members, and manage roles
  (`OWNER` / `EDITOR` / `VIEWER`).
- **Documents** — a rich-text editor (Tiptap) with headings, tables, task
  lists, code blocks, links, and inline comments.
- **Canvas** — a Konva-powered drawing surface: rectangles, ellipses, arrows,
  lines, freehand pencil, text, and sticky notes, with pan/zoom, selection,
  resize, and double-click text editing.
- **Mind maps** — node-based mind maps with automatic layout (`dagre`).
- **Auth** — email/password signup and login with JWT access + refresh
  tokens.
- **Real-time** — a WebSocket gateway (Socket.io) for live updates.

## Tech stack

| | |
|---|---|
| **Frontend** (`ui/`) | Vue 3, Vuetify 4, Pinia, Vue Router, Vite, TailwindCSS, Konva / vue-konva, Tiptap, Vitest |
| **Backend** (`services/`) | NestJS, Prisma, PostgreSQL, Passport + JWT, Socket.io |
| **Monorepo** | pnpm workspaces |

## Project structure

```
Space/
├── ui/          # Vue 3 frontend (@space/ui)
├── services/    # NestJS backend (@space/services)
│   ├── src/     # auth, workspace, document, canvas, mindmap, comment, gateway modules
│   └── prisma/  # schema, migrations, seed script
└── package.json # root scripts, orchestrates both packages via pnpm
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- A PostgreSQL database — either Docker, or your own local/remote instance

## Getting started

### 1. Install dependencies

From the repo root (installs both `ui` and `services`):

```bash
pnpm install
```

### 2. Start PostgreSQL

The backend ships a `docker-compose.yml` for a local Postgres instance:

```bash
docker compose -f services/docker-compose.yml up -d
```

This starts Postgres on `localhost:5432` with database `space` / user
`postgres` / password `postgres` (matching the example env below). If you'd
rather use your own Postgres, just point `DATABASE_URL` at it instead.

### 3. Configure environment variables

Copy the root example env file into the backend package (NestJS loads `.env`
from its own working directory):

```bash
cp .env.example services/.env
```

Adjust values if needed — at minimum `DATABASE_URL` and `JWT_SECRET`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/space?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

The frontend doesn't need an env file for local development — Vite's dev
server proxies `/api` and `/ws` to `http://localhost:4000` automatically (see
`ui/vite.config.ts`). Set `VITE_API_URL` in `ui/.env` only if you're pointing
the frontend at a different/deployed backend.

### 4. Set up the database

Run migrations and (optionally) seed an admin user + default workspace:

```bash
pnpm --filter @space/services db:migrate
pnpm --filter @space/services db:seed
```

### 5. Run the backend

```bash
pnpm dev:services
```

Runs on `http://localhost:4000`, API routes are prefixed with `/api`.

### 6. Run the frontend

In a separate terminal:

```bash
pnpm dev:ui
```

Runs on `http://localhost:3000`.

### 7. Open the app

Visit `http://localhost:3000` and sign up, or log in with the seeded admin
account (if step 4's seed succeeded): `admin@space.io` / `admin@123`.

---

You can also start both packages at once from the root with `pnpm dev`
(runs `dev:ui` and `dev:services` in parallel).

## Available scripts

Run from the repo root:

| Script | Description |
|---|---|
| `pnpm dev` | Run frontend + backend together |
| `pnpm dev:ui` / `pnpm dev:services` | Run just one package |
| `pnpm build` | Build both packages |
| `pnpm lint` / `pnpm lint:fix` | Lint the whole repo |
| `pnpm format` / `pnpm format:check` | Prettier format / check |

Backend-specific (`pnpm --filter @space/services <script>`):

| Script | Description |
|---|---|
| `db:migrate` | Run Prisma migrations (dev) |
| `db:migrate:deploy` | Apply migrations (production) |
| `db:studio` | Open Prisma Studio |
| `db:seed` | Seed an admin user + default workspace |

Frontend-specific (`pnpm --filter @space/ui <script>`):

| Script | Description |
|---|---|
| `test` | Run unit tests (Vitest) |
| `build` | Type-check (`vue-tsc`) and build for production |
