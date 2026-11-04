# Technical Requirements Document (TRD)
## Shortcut Hub

**Companion to:** PRD.md
**Status:** Draft v2.0 — updated for the Appwrite Cloud migration (see README.md for the full history/rationale)

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) + TypeScript | File-based routing, RSC where useful, first-class Vercel support |
| Styling | Tailwind CSS | Fast, consistent design-token driven styling |
| Motion | Framer Motion | Declarative, physics-based micro-interactions |
| Icons | lucide-react | Lightweight, consistent icon set |
| Backend / DB | **Appwrite Cloud + Next.js API routes** | Appwrite stores auth/data; verified Next.js routes on Vercel authorize database requests |
| Frontend hosting | Vercel | Requested target; ideal for Next.js |
| Backend hosting | Vercel + Appwrite Cloud | Next.js hosts the access-control API; Appwrite remains the managed auth/database service |
| Client ↔ Backend | `appwrite` JS SDK (auth) + Next.js API | User JWTs are checked server-side; database API keys never reach the browser |

## 2. Why Appwrite Cloud (and Why This Needed No Vercel Workaround)

The project originally used PocketBase, a single Go binary with an embedded SQLite file — which
meant it needed its own persistent host (Fly.io/Railway) since Vercel's serverless functions
have no writable, persistent filesystem. Appwrite Cloud removes that split entirely: it's a
managed service reachable over HTTPS from anywhere, including Vercel's edge/serverless runtime,
so there is nothing to self-host. The deployment is simply:

- **Frontend (Next.js):** deployed to **Vercel**.
- **Backend (auth + database):** **Appwrite Cloud**, configured once through its console — no
  Dockerfile, no volume, no second deploy pipeline.

## 3. Architecture — Clean Architecture, 4 Layers (unchanged by the migration)

```
src/
├── domain/                     # Pure business logic. Zero framework imports.
│   ├── entities/
│   │   └── shortcut.ts         # Shortcut entity + Category enum + validation
│   └── repositories/
│       └── shortcut-repository.ts   # Interface only (port) — no implementation
│
├── application/                # Use cases. Depends only on domain.
│   ├── usecases/
│   │   ├── list-shortcuts.ts
│   │   ├── create-shortcut.ts
│   │   ├── update-shortcut.ts
│   │   └── delete-shortcut.ts
│   └── dto/
│       └── shortcut-dto.ts
│
├── infrastructure/             # Adapters. Implements domain ports.
│   ├── appwrite/
│   │   ├── client.ts             # Appwrite SDK Client/Account/Databases singletons
│   │   ├── auth.ts               # AppwriteAuthService — wraps the Account API
│   │   └── repositories/
│   │       └── shortcut-repository.ts  # Implements ShortcutRepository via Appwrite Databases
│   └── di/
│       └── container.ts          # Wires interface -> implementation (composition root)
│
└── (presentation)               # Next.js App Router, components, hooks — at repo-root
    ├── app/                      # routes (login, dashboard)
    ├── components/               # ShortcutCard, CommandBar, CategoryChips, etc.
    └── hooks/                    # useShortcuts(), useAuth() — call use cases, not Appwrite directly
```

**Dependency rule (why the migration was a two-file change):** `presentation` depends on
`application`, `application` depends on `domain`, `infrastructure` depends on `domain`
(implements its interfaces) — but nothing in `domain` or `application` ever imported
PocketBase, and nothing in them imports Appwrite either. Migrating backends meant writing new
files under `infrastructure/appwrite/`, pointing `infrastructure/di/container.ts` at the new
repository class, and rewriting `useAuth` (the one hook that necessarily talks to a specific
auth API). Every use case, every component, and the entire `domain/` layer were untouched.

## 4. Data Model — Appwrite Database `shortcut_hub_db`, Collection `shortcuts`

| Attribute | Type | Rules |
|---|---|---|
| `$id` | string (auto) | Appwrite document ID |
| `name` | string(100) | required |
| `url` | url | required |
| `category` | enum | required; values: `Email, Social Media, Entertainment, Development, AI, Education, Career, Jobs, Freelancing, Other` |
| `owner` | string(36) | required; set to the creator's user ID on create |
| `$createdAt` / `$updatedAt` | datetime (auto) | Appwrite defaults |

**Access control:** Collection-level permissions and per-document user permissions are empty.
The Next.js API verifies the caller's Appwrite JWT and email verification status, then scopes
database reads by `owner` and checks ownership before updating/deleting documents. Direct
browser access is denied by Appwrite permissions.

`status` (Available / Missing) remains **derived at render time** from whether `url` is
non-empty — never stored, so it can't drift out of sync (unchanged from v1).

Full schema reference: `appwrite/schema.json`. Seed data (44 real shortcuts): `appwrite/seed-data.json`.

## 5. API Surface (via verified Next.js routes)

| Use case | Appwrite call |
|---|---|
| List shortcuts | `GET /api/shortcuts` (verified user, owner-filtered) |
| Create shortcut | `POST /api/shortcuts` (server assigns owner) |
| Update shortcut | `PATCH /api/shortcuts/:id` (server verifies ownership) |
| Delete shortcut | `DELETE /api/shortcuts/:id` (server verifies ownership) |
| Login | `account.createEmailPasswordSession(email, password)` |
| Current user | `account.get()` |
| Logout | `account.deleteSession('current')` |

## 6. Frontend State & Data Flow (unchanged shape, new backend underneath)

`useShortcuts()` hook → calls the four use cases (via the DI container) → use cases call the
repository interface → the injected Appwrite implementation hits the API. Local component state
holds the working list + optimistic updates (add/delete update UI immediately, roll back on
error) so the UI never blocks on network round-trips.

```
UI event → hook → usecase → repository → Next.js verified API route → Appwrite database API
```

## 7. Environment Variables

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID=
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=
APPWRITE_API_KEY=
```

Only the `NEXT_PUBLIC_*` values are public. `APPWRITE_API_KEY` is a server-only secret used by
the verified API routes and must never be prefixed `NEXT_PUBLIC_` or committed.

## 8. Deployment Steps (summary — full step-by-step in README.md)

1. **Backend:** create an Appwrite Cloud project, database, and `shortcuts` collection through
   the console (README §4–§8), matching `appwrite/schema.json`.
2. **Frontend/API:** push repo to GitHub → import into Vercel → set the `NEXT_PUBLIC_APPWRITE_*`
   env vars and server-only `APPWRITE_API_KEY` → deploy. Root directory is the repo root.

## 9. Non-Functional Requirements

- **Performance:** first contentful paint < 1.5s on 4G; shortcut grid renders from a single
  `listDocuments` call (44 rows today, still trivially small at 500+).
- **Accessibility:** visible keyboard focus states, semantic landmarks, `Cmd/Ctrl+K` opens
  search without a mouse, all interactive elements reachable by keyboard.
- **Resilience:** optimistic UI rolls back with a toast on request failure; Appwrite being
  briefly unreachable shows a retry state, not a blank screen.
- **Motion:** respects `prefers-reduced-motion` — animations degrade to instant state changes.
