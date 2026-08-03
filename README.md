# Shortcut Hub

A personal launchpad for your saved website shortcuts — search, filter by category, and
add/remove sites in one click. Built to replace a spreadsheet as your daily "open my sites"
tool, backed by **Appwrite Cloud**.

Docs: [`docs/PRD.md`](docs/PRD.md) · [`docs/TRD.md`](docs/TRD.md)

---

## 1. Project Overview

Shortcut Hub is a single-page app that lists every site you've saved, grouped by category
(AI tools, job boards, learning platforms, etc.), with instant search and a one-click add/remove
flow. It's built for one person's daily use, but the architecture doesn't assume that forever.

**Architecture — Clean Architecture, 4 layers:**

```
domain          → entities + repository interfaces. No framework code, ever.
application     → use cases (list/create/update/delete). Depends only on domain.
infrastructure  → adapters that implement domain interfaces (Appwrite, in this build).
presentation    → Next.js routes, React components, hooks.
```

The dependency rule only points inward: `presentation` depends on `application`, `application`
depends on `domain`, and `infrastructure` implements `domain`'s interfaces — but `domain` and
`application` never import a specific backend SDK. That's *why* this project could move from
PocketBase to Appwrite by rewriting one folder (`infrastructure/appwrite/`) and one hook
(`useAuth`), without touching a single component, use case, or entity.

**Why Appwrite Cloud:** it's a managed backend-as-a-service — authentication, a document
database, and permissions, all reachable over HTTPS with no server for you to run or patch.
For a project deployed on Vercel (stateless, serverless), that's a materially simpler pairing
than a self-hosted backend: there's no second host to provision, no Dockerfile, no persistent
volume to manage. You configure Appwrite once through its web console and the app talks to it
directly from the browser, governed by the permission rules set up in §8.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend | Appwrite Cloud |
| Database | Appwrite Databases (document store) |
| Authentication | Appwrite Account API — email & password |
| Hosting (frontend) | Vercel |
| Hosting (backend) | Appwrite Cloud (fully managed — nothing to deploy yourself) |
| Deployment | `git push` → Vercel auto-deploy |
| Backup & Restore | `xlsx` (SheetJS) and `papaparse`, both lazy-loaded on demand |

---

## 3. Prerequisites

- **Node.js** 18.18 or newer (`node -v` to check)
- **npm** 9 or newer (ships with Node)
- **Git**
- An **Appwrite Cloud** account — free, sign up at [cloud.appwrite.io](https://cloud.appwrite.io)
- A **Vercel** account — free, sign up at [vercel.com](https://vercel.com), can sign in with GitHub

---

## 4. Creating an Appwrite Cloud Project

Every click, in order:

1. Go to **[cloud.appwrite.io](https://cloud.appwrite.io)**.
2. Click **Sign up** → enter your email and a password → click **Sign up**.
3. Check your inbox for a verification email → click the verification link.
4. Back in the console, you'll be asked to **Create Organization**. Give it any name (e.g.
   "Personal") → click **Create**.
5. Click **Create Project**.
6. Enter a project name — e.g. `Shortcut Hub` → click **Create**.
7. You'll land on the project's **Overview** page. Copy the **Project ID** shown near the top
   (it looks like `66f1a2b3c4d5e6f7a8b9`) — you'll paste this into `.env.local` in §9.
8. On the same Overview page, note the **API Endpoint** shown — for Appwrite Cloud this is
   `https://cloud.appwrite.io/v1` unless you're on a custom region, in which case use the
   endpoint shown there instead.

*(Screenshot placeholder: Appwrite Cloud "Create Project" screen)*

---

## 5. Authentication Setup

1. In your project's left sidebar, click **Auth**.
2. Click the **Settings** tab (top of the Auth page).
3. Under **Auth methods**, find **Email/Password** and make sure the toggle is **on** (it's on
   by default for a new project — verify it here).
4. Leave **Session length** at its default (365 days) unless you have a reason to change it —
   this controls how long a signed-in session stays valid.
5. No further configuration is required for email/password. (Google OAuth would be enabled from
   this same **Auth methods** list later — see the FAQ in §16.)
6. Go to the **Users** tab → click **Create user** → enter your email, a password, and your
   name → click **Create**. This is the one account the app will sign in as. Copy this user's
   **User ID** (click into the user, it's shown at the top) if you plan to use the optional bulk
   seed script in §10.

*(Screenshot placeholder: Auth → Settings → Email/Password toggle)*

---

## 6. Database Setup

1. In the left sidebar, click **Databases**.
2. Click **Create database**.
3. Name it `shortcut_hub_db` → click **Create**. Copy the **Database ID** shown at the top of
   the database page — you'll need it in §9.
4. Inside the database, click **Create collection**.
5. Name it `shortcuts` → click **Create**. Copy the **Collection ID** shown at the top — also
   needed in §9.
6. You're now on the collection's **Attributes** tab. Click **Create attribute** and add each of
   the following, one at a time (exact settings in the table in §7):
   - `name` — type **String**, size `100`, **Required** ✓
   - `url` — type **URL**, **Required** ✓
   - `category` — type **Enum**, add the 10 values listed in §7, **Required** ✓
   - `owner` — type **String**, size `36`, **Required** ✓
7. Go to the **Indexes** tab → **Create index**:
   - Key `owner_idx`, type **Key**, attribute `owner`, order **ASC** → **Create**.
   - Key `category_idx`, type **Key**, attribute `category`, order **ASC** → **Create**.
     (Indexes make filtered/sorted queries fast — not required for correctness at this scale,
     but cheap to add now.)
8. Go to the **Settings** tab of the collection:
   - Scroll to **Permissions**. Under **Document security**, toggle it **on**. This is what
     makes per-document `Permission.read/update/delete(Role.user(...))` calls (set by the app
     when it creates a shortcut) actually take effect — see §8.
   - Still in **Permissions**, add one collection-level permission: **Role → Users** (any
     logged-in user), action **Create**. This is what lets a signed-in user add new shortcuts;
     read/update/delete stay governed entirely by each document's own permissions from
     Document Security, not by a collection-level rule.

*(Screenshot placeholder: Collection → Settings → Permissions, showing Document Security on and Create: Users)*

---

## 7. Collection Schema

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String (max 100) | Yes | — | The display name of the shortcut, e.g. "LinkedIn" |
| `url` | URL | Yes | — | Full URL, e.g. `https://linkedin.com/feed` |
| `category` | Enum | Yes | — | One of: `Email`, `Social Media`, `Entertainment`, `Development`, `AI`, `Education`, `Career`, `Jobs`, `Freelancing`, `Other` |
| `owner` | String (max 36) | Yes | — | The Appwrite User ID that created this shortcut; set automatically by the app, never typed by hand |

(`$id`, `$createdAt`, `$updatedAt` are provided automatically by Appwrite on every document and
don't need to be created manually.)

---

## 8. Permissions — How "Users Can Only See Their Own Shortcuts" Works

Two things combine to enforce this, both configured in §6:

1. **Document Security is on** for the `shortcuts` collection, and the collection has no
   collection-level read/update/delete permission — only a collection-level **Create** for
   Users. That means read/update/delete are decided **per document**, not by a blanket rule.
2. **Every document is created with explicit permissions** — this happens in code, not in the
   console: `src/infrastructure/appwrite/repositories/shortcut-repository.ts` creates each
   shortcut with:
   ```ts
   Permission.read(Role.user(userId)),
   Permission.update(Role.user(userId)),
   Permission.delete(Role.user(userId)),
   ```
   where `userId` is the currently signed-in user's ID. Appwrite enforces this at the API level
   — there is no way for the client to read, edit, or delete a document it wasn't granted access
   to, regardless of what the frontend code tries to send.
3. As a second layer, `list()` also filters with `Query.equal('owner', userId)`, so even within
   "documents this session can see," the query itself is scoped to the current user's `owner`
   value.

No user can ever access another user's records, and this is enforced by Appwrite's API, not by
anything the browser promises to do.

---

## 9. Environment Variables

Copy `.env.example` to `.env.local` and fill in four values:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID=
```

Where each one comes from:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Project **Overview** page, "API Endpoint" (usually `https://cloud.appwrite.io/v1`) |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Project **Overview** page, "Project ID" (§4 step 7) |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | **Databases → shortcut_hub_db**, ID shown at the top (§6 step 3) |
| `NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID` | **Databases → shortcut_hub_db → shortcuts**, ID shown at the top (§6 step 5) |

All four are safe to expose in client-side code (hence the `NEXT_PUBLIC_` prefix, which Next.js
bundles into the browser build) — Appwrite's web SDK is designed for this, and access is
controlled by the permissions from §8, not by keeping these values secret.

---

## 10. Local Development

```bash
npm install
cp .env.example .env.local   # then fill in the four values from §9
npm run dev
```

Open `http://localhost:3000` → you'll land on `/login` → sign in with the user account you
created in §5 step 6.

**Optional: bulk-load your real shortcuts.** `appwrite/seed-data.json` has 44 real entries
migrated from the original spreadsheet. Either add them one by one through the app's own "Add
shortcut" button, or run the provided script once:

```bash
npm install node-appwrite --no-save
APPWRITE_API_KEY=<console → Overview → Integrate → API keys, create one with databases.write> \
APPWRITE_USER_ID=<console → Auth → Users → your user → User ID> \
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<from §9> \
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<from §9> \
NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID=<from §9> \
node appwrite/seed-import.mjs
```

This uses Appwrite's **server** SDK with an API key, so only ever run it locally — never commit
the key or ship it to the browser.

---

## 11. Deploy to Vercel

1. Push this repository to GitHub (`git init && git add . && git commit -m "Shortcut Hub" && git remote add origin <your-repo-url> && git push -u origin main`, or use GitHub Desktop).
2. Go to **[vercel.com/new](https://vercel.com/new)** → **Import Git Repository** → pick this repo.
3. Vercel will auto-detect **Next.js** as the framework — leave the build settings at their
   defaults (root directory = repo root, build command `next build`).
4. Before deploying, expand **Environment Variables** and add all four from §9 (same values as
   your `.env.local`).
5. Click **Deploy**.
6. Once it finishes, click the deployment URL, confirm you land on `/login`, and sign in with
   your Appwrite user to verify the whole chain (Vercel → Appwrite Cloud) is wired correctly.
7. **Verification:** add a shortcut through the UI, refresh the page, confirm it persisted; open
   the Appwrite console → Databases → shortcut_hub_db → shortcuts and confirm the document
   appears there too.

*(Screenshot placeholder: Vercel "Import Project" screen with environment variables expanded)*

---

## 12. Production Checklist

- [ ] All four `NEXT_PUBLIC_APPWRITE_*` variables set in Vercel (not just `.env.local`)
- [ ] Document Security is **on** for the `shortcuts` collection (§6, §8)
- [ ] Collection-level permission is **Create: Users** only — no blanket Read/Update/Delete
- [ ] At least one real user account exists in Appwrite Auth → Users
- [ ] Sign-in, add, edit, delete, and search all verified against the deployed (not local) app
- [ ] `appwrite/seed-import.mjs` was run locally only, and `APPWRITE_API_KEY` was never committed
- [ ] `.env.local` is listed in `.gitignore` (it is, by default, in this repo)

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank page / stuck on loading | `NEXT_PUBLIC_APPWRITE_ENDPOINT` or `PROJECT_ID` wrong or missing | Recheck §9 against the Appwrite Overview page; redeploy after fixing env vars |
| "Project with the requested ID could not be found" | Wrong `PROJECT_ID`, or endpoint region mismatch | Copy the Project ID again from the console; confirm the endpoint matches your project's region |
| "Missing Project ID" style errors in the browser console | Env vars not set in Vercel, or `.env.local` missing locally | Add/verify the four `NEXT_PUBLIC_APPWRITE_*` vars, then redeploy or restart `npm run dev` |
| "Invalid API Key" (only relevant to `seed-import.mjs`) | API key missing `databases.write` scope, or expired | Create a new key: Console → Overview → Integrate → API keys, grant `databases.write` |
| **401 Unauthorized** on any request | No active session — you're not signed in, or the session expired | Go to `/login` and sign in again |
| **403 Permission denied** creating/reading a shortcut | Document Security is off, or collection-level Create permission missing | Recheck §6 step 8 and §8 |
| Shortcuts from one account showing for another | `owner` not being set on create, or Document Security off | Confirm §6 step 8 (Document Security **on**); confirm `shortcut-repository.ts` is setting `owner` and per-document permissions on create |
| **404 Collection not found** | Wrong `DATABASE_ID` or `COLLECTION_ID` | Recopy both IDs from Databases → shortcut_hub_db → shortcuts in the console |
| Network / CORS errors in the browser console | Localhost or your Vercel domain isn't in Appwrite's allowed platforms | Console → your project → **Overview → Platforms** → **Add platform → Web app** → add `http://localhost:3000` for dev and your `*.vercel.app` domain for production |
| `seed-import.mjs` fails immediately with "Missing required env var" | One of the required env vars wasn't exported in your shell | Re-run the full command from §10 with every variable set on the same line, or `export` them first |

---

## 14. Folder Structure

```
shortcut-hub/
├── docs/
│   ├── PRD.md
│   └── TRD.md
├── appwrite/
│   ├── schema.json           # reference: exact attributes/indexes/permissions to create
│   ├── seed-data.json        # your 44 real shortcuts, ready to import
│   └── seed-import.mjs       # optional bulk-import script (server SDK)
├── src/
│   ├── domain/                 # entities + repository interface — no framework imports
│   │   ├── entities/shortcut.ts
│   │   ├── entities/password.ts           # validation + strength scoring, no library dep
│   │   └── repositories/shortcut-repository.ts
│   ├── application/             # use cases — depends only on domain
│   │   ├── usecases/
│   │   │   ├── list-shortcut.ts, create-/update-/delete-shortcut.ts
│   │   │   ├── prepare-export-data.ts     # shapes shortcuts for export (no library dep)
│   │   │   ├── validate-import-rows.ts    # classifies rows valid/duplicate/invalid
│   │   │   └── import-shortcuts.ts        # runs an already-previewed import
│   │   └── dto/
│   │       ├── shortcut-dto.ts
│   │       └── import-export-dto.ts       # ExportRow, ImportPreview, DuplicateStrategy, etc.
│   ├── infrastructure/
│   │   ├── appwrite/
│   │   │   ├── client.ts         # Appwrite Client/Account/Databases singletons
│   │   │   ├── auth.ts           # AppwriteAuthService (email/password + Google OAuth)
│   │   │   └── repositories/
│   │   │       └── shortcut-repository.ts
│   │   ├── io/
│   │   │   ├── export-formatters.ts   # JSON/CSV/XLSX encoders (CSV/XLSX libs lazy-loaded)
│   │   │   ├── import-parsers.ts      # JSON/CSV/XLSX readers (same lazy-load pattern)
│   │   │   └── file-download.ts       # browser download trigger
│   │   └── di/
│   │       └── container.ts      # composition root: interface -> Appwrite implementation
│   ├── hooks/                   # useAuth, useShortcuts, useExport, useImport, useToastQueue
│   ├── components/
│   │   ├── backup/               # DropZone, ExportDialog, ImportDialog, ImportPreviewTable
│   │   ├── PasswordInput.tsx, PasswordStrengthMeter.tsx
│   │   └── ...                    # CommandBar, CategoryChips, ShortcutCard, modals, toasts
│   └── app/                     # /login, /forgot-password, /reset-password, / (dashboard), /analytics, /settings
├── vercel.json
├── APPWRITE_PASSWORD_RECOVERY_SETUP.md   # beginner-friendly manual setup guide
└── .env.example
```

---

## 15. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Vercel (Frontend)                       │
│                                                                    │
│   presentation/  →  app/, components/, hooks/                     │
│         │                                                          │
│         ▼                                                          │
│   application/   →  use cases (List/Create/Update/DeleteShortcut)  │
│         │                                                          │
│         ▼                                                          │
│   domain/        →  Shortcut entity + ShortcutRepository (port)    │
│         ▲                                                          │
│         │ implements                                               │
│   infrastructure/appwrite/  →  AppwriteShortcutRepository,          │
│                                  AppwriteAuthService                │
└───────────────────────────┬────────────────────────────────────────┘
                             │  HTTPS (Appwrite Web SDK)
                             ▼
                 ┌───────────────────────────┐
                 │       Appwrite Cloud        │
                 │  Auth · Database · API      │
                 │  (managed, no server to run)│
                 └───────────────────────────┘
```

---

## 16. FAQ

**Why Appwrite?**
Managed auth + database + permissions in one service, reachable directly from a Vercel-hosted
frontend with nothing to self-host — simpler ops than the previous PocketBase setup, at the
same "small personal app" scale.

**Why not PocketBase?**
PocketBase is a great single-binary backend, but it needs a persistent process and disk, which
means a second hosting provider alongside Vercel (Fly.io/Railway). Appwrite Cloud removes that
second deploy entirely. Either is a reasonable choice — this migration was about reducing moving
parts, not about PocketBase being wrong.

**Can I migrate later (to Supabase, Firebase, self-hosted Appwrite, etc.)?**
Yes — that's the point of the `domain`/`application` split. Write a new class in
`infrastructure/` that implements `ShortcutRepository`, point `infrastructure/di/container.ts`
at it, and update `useAuth` if the new backend has a different auth API. Nothing else changes.

**Can I add Google Login?**
It's already wired up — there's a "Continue with Google" button on the login page, backed by
`AppwriteAuthService.loginWithGoogle()` in `src/infrastructure/appwrite/auth.ts`. The one thing
left to do on your side is enable the provider in the Appwrite console: **Auth → Settings → Auth
methods → Google**, with a Google OAuth client ID/secret from the Google Cloud Console. Until
that's enabled, clicking the button will redirect to Google and then bounce back with an error —
the login page shows a friendly message for that case rather than a blank failure.

**How do permissions work, in one sentence?**
Each shortcut document is created with read/update/delete permission granted only to its
creator's user ID, and the collection has Document Security turned on, so Appwrite enforces
per-document ownership at the API level regardless of what the client requests — see §8.

---

## 17. Backup & Restore

Appwrite Cloud's free tier doesn't include automatic backups of your database, so Shortcut Hub
handles this itself: **Settings → Backup & Restore** lets you export everything to a file, and
import it back — into this account, a fresh one, or after any accidental data loss.

### Export

Go to **Settings → Export Data**, pick a format, and a file downloads immediately (nothing is
uploaded anywhere — it's generated entirely in your browser):

| Format | Best for |
|---|---|
| **JSON** | Full-fidelity backup — the safest choice if you plan to re-import later |
| **CSV** | Opening in Excel, Google Sheets, Numbers |
| **Excel (.xlsx)** | A ready-to-browse workbook, no import step needed to view it |

Filenames follow the pattern `shortcut-hub-backup-YYYY-MM-DD.<ext>`. Only shortcuts belonging to
the currently signed-in user are included — the same permission scoping from §8 applies here too.

### Import

Go to **Settings → Import Data**, then drag a file onto the drop zone (or click it to browse).
Supported formats: `.json` (an array of objects), `.csv` (with a header row), and `.xlsx`/`.xls`
(first sheet is read). Column names are matched loosely — `name`/`Name`/`Site Name`,
`url`/`URL`/`Site Link`, `category`/`Category` are all recognized, so exports from the original
spreadsheet or another tool typically work without renaming columns first.

Before anything is written to your account, you get a **preview**:

```
Total records   158
Valid            154
Duplicates         3
Invalid            1
```

with a scrollable table of every row and its status. Invalid rows (missing name, missing/invalid
URL) are automatically excluded and never imported — hover a row's status badge to see why it was
flagged.

### Duplicate Handling

A row counts as a duplicate if its URL (normalized — case, `http`/`https`, and trailing slash are
ignored) matches either an existing saved shortcut or another row earlier in the same file. When
duplicates are found, choose how to handle them before importing:

- **Skip duplicates** — only the genuinely new shortcuts are added.
- **Replace existing** — the saved shortcut's name/category/URL are overwritten with the imported version.
- **Keep both** — the duplicate is imported anyway, as a separate, additional shortcut.

### Confirmation & Progress

The preview screen doubles as the confirmation step — it shows exactly how many shortcuts will
be imported given your chosen duplicate strategy before you click **Import**. Once confirmed, a
progress bar tracks `done / total` as each row is written; a toast confirms the result afterward
("154 shortcuts imported successfully.", "3 duplicate shortcuts skipped.").

### Error Handling

Handled gracefully, with a plain-language message instead of a crash or a blank screen: invalid
JSON, a CSV with no header row, a corrupted/unreadable `.xlsx`, an empty file, a file over the
5MB size limit, an unsupported extension, and individual row failures during the import itself
(counted and reported, without stopping the rest of the import).

### Backup Recommendations

Since there's no automatic backup on Appwrite's free tier, export a JSON backup periodically —
right after a big batch of additions is a good habit. **Settings** shows how long it's been since
your last export (tracked locally in your browser, not on the server) as a nudge.

---

## 18. Forgot Password Setup

Password recovery uses **Appwrite's native recovery flow** end-to-end — there's no custom token
system in this app's own code. Appwrite issues a one-time secret, emails it inside a link to your
app, and validates that secret (including expiry and single-use) when the password is updated.

### The flow

1. **Login page** has a "Forgot password?" link under the password field → `/forgot-password`.
2. **`/forgot-password`** takes an email and calls `account.createRecovery(email, redirectUrl)`.
   The UI always shows the same message — *"If an account exists for this email, a password
   recovery email has been sent."* — whether or not the email matched an account, so the app
   never reveals which emails are registered.
3. Appwrite emails a link to `redirectUrl` with `?userId=...&secret=...` appended automatically.
4. **`/reset-password`** reads those two params, and on submit calls
   `account.updateRecovery(userId, secret, newPassword)`. Success shows "Password Updated
   Successfully" and auto-redirects to `/login` after ~2.5 seconds.
5. If the link is missing its params, already used, expired, or otherwise rejected by Appwrite,
   the page shows a "This link is no longer valid" state with a **Request New Recovery Email**
   button back to `/forgot-password` — the specific rejection reason from Appwrite is never
   surfaced, just "no longer valid," so nothing about *why* it failed leaks either.

### One-time setup required

This feature needs two things configured on Appwrite's side before it can actually send an
email — a **Recovery URL** and an **SMTP provider** (Appwrite Cloud doesn't send email without
one). Both are one-time, click-by-click setup covered in full, beginner-friendly detail in
**[`APPWRITE_PASSWORD_RECOVERY_SETUP.md`](APPWRITE_PASSWORD_RECOVERY_SETUP.md)** — start there if
you haven't configured either yet.

### Troubleshooting

See `APPWRITE_PASSWORD_RECOVERY_SETUP.md` §5 for a full table (recovery email not received,
link expired, SMTP authentication failed, sender not verified, invalid redirect URL, and more).
The short version: most "email never arrived" issues trace back to SMTP not being configured yet
(Appwrite Cloud has no default mail sender), and most "invalid link" issues trace back to the
Recovery URL in Appwrite not exactly matching where `/reset-password` is actually hosted.
