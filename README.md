# Shortcut Hub

Shortcut Hub is a personal web app for managing a curated list of favorite websites. Instead of keeping links in a spreadsheet, the project gives the user a clean dashboard where they can sign in, search, filter, add, edit, delete, import, and export shortcuts. The product is designed for a single owner, but the architecture keeps the domain logic separated from the framework and storage layer so it can evolve without a rewrite.

## Project purpose

- Replace spreadsheet-based shortcut management with a fast web interface
- Group links by category such as AI, Jobs, Education, Development, and Career
- Search and filter instantly while browsing saved links
- Keep data private to a verified Appwrite user account
- Support lightweight data migration from Excel/CSV exports
- Provide a polished, daily-use dashboard instead of a raw CRUD table

## Core features

- Email/password authentication with Appwrite
- Email verification and password reset flow
- Secure server-side database access using validated JWTs and server API keys
- Search by shortcut name or category
- Category chips and grouped layout
- Add, edit, and delete shortcut actions
- URL validation and missing/available status indication
- Backup and restore through CSV/XLSX import/export
- Analytics view for category usage and growth trends
- Responsive interface designed for desktop and mobile browsers

## Tech stack

- Frontend: Next.js 14, React 18, TypeScript
- Styling: Tailwind CSS
- UI motion: Framer Motion
- Charts: Recharts
- Auth and storage: Appwrite Cloud
- Import/export: XLSX and Papa Parse
- Hosting: Vercel

## Architecture

Shortcut Hub follows a layered clean-architecture approach with dependency flow pointing inward.

- Domain layer: business entities, validation rules, and repository contracts
- Application layer: use cases for listing, creating, updating, deleting, and importing shortcuts
- Infrastructure layer: Appwrite adapters, verified API wrappers, export/import helpers, and DI wiring
- Presentation layer: Next.js App Router pages, components, hooks, and contexts

### Dependency rule

The codebase keeps framework, SDK, and database concerns outside the domain. In practice:

- `src/domain` contains pure business objects and validation logic
- `src/application` depends only on domain contracts and entities
- `src/infrastructure` implements those contracts with Appwrite-specific code
- `src/app` and `src/components` consume application and infrastructure services without owning business logic

### Request and data flow

1. User signs in through Appwrite auth
2. Client hooks fetch or mutate data through Next.js API routes
3. The API route validates the user JWT and confirms the account is verified
4. The server route calls Appwrite through a server-only API key
5. Repositories map Appwrite documents to domain entity objects
6. Use cases enforce business rules before saving or updating records
7. UI state refreshes reactively and renders the updated shortcut dashboard

## Main system responsibilities

### Authentication

The app uses Appwrite Account APIs for:

- email/password login
- registration
- email verification
- password recovery
- OAuth-style redirect flow support for Google login

The client layer reads session state from the Appwrite client while the server layer verifies the JWT on every protected API route.

### Data model

The primary business object is a shortcut:

- `id`
- `name`
- `url`
- `category`
- `owner`
- `created`
- `updated`

Shortcut validation is performed in the domain layer and includes:

- name required and max length
- URL required and valid
- category required
- URL normalization to ensure it always has a protocol if needed

### Categories

Categories are dynamic. Users can create custom categories, and the app validates the value before storing it. The system keeps an `owner` field on category records so data remains scoped to the authenticated user.

### Import / export

The project includes business logic and file-handling helpers for:

- importing CSV/Excel data into the Appwrite database
- validating rows before insert
- preparing export payloads for backup files
- generating downloadable spreadsheet output

## File and folder structure

```text
shortcut-hub/
├─ .env.example
├─ .gitignore
├─ .next/
├─ .next-dev/
├─ .vscode/
├─ appwrite/
│  ├─ revoke-client-document-access.mjs
│  ├─ schema.json
│  ├─ seed-data.json
│  └─ seed-import.mjs
├─ docs/
│  ├─ PRD.md
│  └─ TRD.md
├─ public/
│  └─ shortcut-hub-logo.png
├─ src/
│  ├─ app/
│  │  ├─ analytics/page.tsx
│  │  ├─ forgot-password/page.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ login/page.tsx
│  │  ├─ page.tsx
│  │  ├─ reset-password/page.tsx
│  │  ├─ settings/page.tsx
│  │  ├─ signup/page.tsx
│  │  ├─ verification-pending/page.tsx
│  │  ├─ verify-email/page.tsx
│  │  └─ api/
│  │     ├─ _lib/verified-appwrite.ts
│  │     ├─ categories/[id]/route.ts
│  │     ├─ categories/route.ts
│  │     ├─ shortcuts/[id]/route.ts
│  │     └─ shortcuts/route.ts
│  ├─ application/
│  │  ├─ dto/
│  │  │  ├─ import-export-dto.ts
│  │  │  └─ shortcut-dto.ts
│  │  └─ usecases/
│  │     ├─ create-shortcut.ts
│  │     ├─ delete-shortcut.ts
│  │     ├─ import-shortcuts.ts
│  │     ├─ list-shortcuts.ts
│  │     ├─ prepare-export-data.ts
│  │     ├─ update-shortcut.ts
│  │     └─ validate-import-rows.ts
│  ├─ components/
│  │  ├─ backup/
│  │  │  ├─ DropZone.tsx
│  │  │  ├─ ExportDialog.tsx
│  │  │  ├─ ImportDialog.tsx
│  │  │  └─ ImportPreviewTable.tsx
│  │  ├─ charts/
│  │  │  ├─ CategoryBarChart.tsx
│  │  │  ├─ CategoryPieChart.tsx
│  │  │  ├─ ChartCard.tsx
│  │  │  ├─ ChartTooltip.tsx
│  │  │  ├─ GrowthAreaChart.tsx
│  │  │  └─ GrowthLineChart.tsx
│  │  ├─ AddCategoryModal.tsx
│  │  ├─ AddEditModal.tsx
│  │  ├─ AnimatedBackground.tsx
│  │  ├─ AnimatedCounter.tsx
│  │  ├─ CategoryChips.tsx
│  │  ├─ CategorySelect.tsx
│  │  ├─ CommandBar.tsx
│  │  ├─ ConfirmDeleteModal.tsx
│  │  ├─ DashboardStats.tsx
│  │  ├─ EmptyState.tsx
│  │  ├─ FloatingInput.tsx
│  │  ├─ Footer.tsx
│  │  ├─ NavBar.tsx
│  │  ├─ NavigationSplash.tsx
│  │  ├─ PasswordInput.tsx
│  │  ├─ PasswordStrengthMeter.tsx
│  │  ├─ ResendVerificationEmail.tsx
│  │  ├─ ShortcutCard.tsx
│  │  ├─ ShortcutGrid.tsx
│  │  ├─ ShortcutPreviewModal.tsx
│  │  ├─ SplashScreen.tsx
│  │  ├─ StatCard.tsx
│  │  ├─ StatsBar.tsx
│  │  └─ ToastStack.tsx
│  ├─ context/
│  │  ├─ CategoryContext.tsx
│  │  └─ ThemeContext.tsx
│  ├─ domain/
│  │  ├─ entities/
│  │  │  ├─ category.ts
│  │  │  ├─ password.ts
│  │  │  └─ shortcut.ts
│  │  └─ repositories/
│  │     ├─ category-repository.ts
│  │     └─ shortcut-repository.ts
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  ├─ useCategories.ts
│  │  ├─ useExport.ts
│  │  ├─ useImport.ts
│  │  ├─ useShortcuts.ts
│  │  └─ useToastQueue.ts
│  ├─ infrastructure/
│  │  ├─ appwrite/
│  │  │  ├─ auth.ts
│  │  │  ├─ client.ts
│  │  │  ├─ repositories/
│  │  │  │  ├─ category-repository.ts
│  │  │  │  └─ shortcut-repository.ts
│  │  │  └─ verified-api.ts
│  │  ├─ di/
│  │  │  └─ container.ts
│  │  ├─ io/
│  │  │  ├─ export-formatters.ts
│  │  │  ├─ file-download.ts
│  │  │  └─ import-parsers.ts
│  ├─ lib/
│  │  ├─ analytics.ts
│  │  ├─ navigation.ts
│  │  └─ utils.ts
├─ .env.local
├─ APPWRITE_PASSWORD_RECOVERY_SETUP.md
├─ next-env.d.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ tsconfig-output.json
├─ tsconfig.tsbuildinfo
├─ vercel.json
└─ README.md
```

## Environment configuration

Create a local environment file based on `.env.example`:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID=your_shortcuts_collection_id
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=your_categories_collection_id
APPWRITE_API_KEY=your_server_key
```

Notes:

- `NEXT_PUBLIC_*` variables are safe to expose to browser code
- `APPWRITE_API_KEY` must stay on the server and should never be sent to the frontend
- Appwrite database permission model should keep collection-level permissions empty while document security remains enabled

## Appwrite setup summary

1. Create an Appwrite project
2. Enable email/password auth
3. Create a database named `shortcut_hub_db`
4. Create a `shortcuts` collection with fields for `name`, `url`, `category`, and `owner`
5. Create a `categories` collection for user-defined category names
6. Add indexes for `owner` and `category`
7. Configure server-side verification and API key access as described in the project docs

The `appwrite/schema.json` file captures the intended collection layout and is useful as a reference when manually creating the collections in the Appwrite console.

### Email verification configuration

- Add both `localhost` and the deployed app's domain as Web platforms in the Appwrite project. The app builds verification links from the current origin and sends users to `/verify-email`.
- Enable Email/Password authentication and allow unverified users to create a session. The resend API requires an authenticated user; without that setting, a new user cannot request another verification link until Appwrite permits sign-in.
- Configure Appwrite's email delivery (SMTP and a valid sender) so verification messages can be delivered.
- No extra URL environment variable is required. Local development uses the current localhost origin; production uses the deployed site's origin.

## Project docs

- `docs/PRD.md` — product requirements and goals
- `docs/TRD.md` — technical requirements and design decisions
- `appwrite/schema.json` — database schema reference
- `appwrite/seed-data.json` — seeded shortcut list used for import

## Development workflow

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run start
```

## Summary

Shortcut Hub is a personal launchpad for saved web links, implemented as a modern Next.js application with a clean layered architecture and Appwrite-backed persistence. It balances simplicity with maintainability: the domain remains framework-agnostic, the infrastructure is isolated, and the interface is designed for regular daily use.
