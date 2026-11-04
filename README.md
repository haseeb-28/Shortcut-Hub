# 🚀 Shortcut Hub

<p align="center">
  <strong>Your personal launchpad for the web.</strong>
  <br />
  Save, organize, search, and manage your favorite websites in one place.
  <br /><br />
  <a href="https://shortcut-hub-two.vercel.app/">
    <strong>🌐 Visit Live Website</strong>
  </a>
</p>

<p align="center">
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
  ![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?logo=appwrite&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
</p>

---

## ✨ Overview

Shortcut Hub is a personal web application that replaces spreadsheet-based bookmark management with a clean, organized dashboard.

It lets you save your favorite websites, group them into categories, find links instantly, and manage your collection without the clutter of traditional bookmark lists.

**Live Demo:** https://shortcut-hub-two.vercel.app/

## 🌟 Features

- **Authentication:** Secure email/password authentication with Appwrite.
- **Email Verification:** Account verification and password recovery.
- **Shortcut Management:** Add, edit, delete, and organize website links.
- **Smart Search:** Quickly find shortcuts by name or category.
- **Dynamic Categories:** Create and manage custom categories.
- **Category Filtering:** Browse shortcuts using category filters.
- **Import & Export:** Back up and restore shortcut collections using CSV and Excel files.
- **Analytics Dashboard:** View category statistics and shortcut growth.
- **URL Validation:** Validate links and identify missing or unavailable URLs.
- **Responsive Design:** Optimized for desktop and mobile screens.
- **Secure Data Access:** Server-side API routes validate user JWTs and account verification before accessing protected data.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework and application routing |
| React 18 | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | UI animations |
| Recharts | Data visualization |
| Appwrite Cloud | Authentication and database |
| XLSX | Excel import and export |
| Papa Parse | CSV parsing |
| Vercel | Deployment |

## 🏗️ Architecture

Shortcut Hub follows a layered architecture inspired by Clean Architecture principles.

```text
src/
├── app/             # Pages, layouts and API routes
├── application/     # DTOs and business use cases
├── domain/          # Entities, validation and contracts
├── infrastructure/  # Appwrite, repositories and DI
├── components/      # Reusable UI components
├── context/         # Application state and providers
├── hooks/           # Custom React hooks
└── lib/              # Shared utilities
```

**Architecture principles:**

- Domain logic remains independent of frameworks and storage.
- Application use cases depend on domain contracts.
- Infrastructure implements repository contracts.
- Presentation components communicate through application services and hooks.
- Protected database operations run through authenticated server-side API routes.

## ⚙️ Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- An Appwrite Cloud project

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd shortcut-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID=your_shortcuts_collection_id
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=your_categories_collection_id

APPWRITE_API_KEY=your_server_api_key
```

Keep `APPWRITE_API_KEY` private. Never expose it through client-side code or commit it to Git.

### 4. Configure Appwrite

- Create an Appwrite project.
- Enable Email/Password authentication.
- Configure email verification and password recovery.
- Add localhost and your deployed domain as Web platforms.
- Create the database and required collections.
- Configure collection permissions and document security as described in the project setup.
- Create a server API key with the permissions required by the application.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build
npm run start
```

## 🔐 Security

- Appwrite handles user authentication.
- Protected API routes validate the user's JWT.
- Email verification is required for protected application data.
- Database operations are performed server-side using a private API key.
- User records are scoped to their authenticated owner.
- Client-side code does not receive server API credentials.

## 🌍 Deployment

The application is deployed on Vercel.

**Live Application:** [https://shortcut-hub-two.vercel.app/](https://shortcut-hub-two.vercel.app/)

For production deployment, configure the required environment variables in Vercel and register the production domain in Appwrite.

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript and Appwrite.
  <br />
  <strong>Shortcut Hub · Your links, organized.</strong>
</p>