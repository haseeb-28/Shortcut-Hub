# Product Requirements Document (PRD)
## Shortcut Hub — Personal Website Launchpad

**Author:** Haseeb Ur Rehman
**Status:** Draft v1.0
**Date:** August 2026

---

## 1. Problem Statement

Haseeb currently keeps ~44 frequently-used links (job boards, AI tools, learning platforms,
freelancing dashboards, career portals) in a static Excel sheet. This is fine as a personal
archive but has real friction as a daily tool:

- No fast way to *open* a site — has to find the row, click a hyperlink cell.
- No search-as-you-type.
- No way to add/remove a shortcut from a phone or a browser without opening Excel.
- No visual/at-a-glance grouping by what the link is *for* (job hunting vs. AI tools vs. learning).
- Not shareable as a live "home base" — it's a file, not a place.

**Shortcut Hub** turns that spreadsheet into a personal, always-available web app: a single
page that lists every saved shortcut, grouped and searchable, that Haseeb can open from any
device, and where adding or removing a link takes one action instead of a spreadsheet edit.

## 2. Goals

| # | Goal | Success signal |
|---|---|---|
| G1 | Replace the Excel sheet as the daily-use tool for opening saved sites | Used instead of Book1.xlsx within 2 weeks of launch |
| G2 | Add or remove a shortcut in under 10 seconds | No page reload, optimistic UI, 1 modal + 1 click |
| G3 | Find any shortcut in under 3 seconds | Instant client-side search/filter, no server round-trip on keystroke |
| G4 | Feel like a personal, well-designed product, not a generic CRUD table | Distinct visual identity, motion, category color-coding |
| G5 | Be cheap and low-maintenance to run | Free-tier hosting (Vercel + Appwrite Cloud), no ops babysitting |

## 3. Non-Goals (v1)

- Multi-user / team sharing (this is a personal tool; architecture should not *block* it later,
  but v1 ships single-owner).
- Browser extension / new-tab-page replacement (candidate for v2).
- Click analytics / "most visited" ranking (candidate for v2 — data model should not preclude it).
- Native mobile app (the web app must be responsive/PWA-friendly instead).

## 4. Target User

Just Haseeb, initially. Persona: a developer/freelancer/job-seeker who keeps 15–20 browser
tabs pinned across job boards, AI tools, and learning platforms, and wants one bookmarked page
that opens all of them, grouped by intent.

## 5. Core User Stories

1. As the user, I can see all my saved shortcuts on one page, grouped by category, the moment
   I open the site.
2. As the user, I can type into a search box and see the list filter instantly by name or
   category.
3. As the user, I can filter by clicking a category chip (AI, Jobs, Education, Development, etc.).
4. As the user, I can click a shortcut card (or its "Open" action) to open the site in a new tab.
5. As the user, I can add a new shortcut via a modal (name, URL, category) and see it appear in
   the grid immediately.
6. As the user, I can remove a shortcut with a confirm step, and see it disappear immediately.
7. As the user, I can edit an existing shortcut's name/category/URL.
8. As the user, I log in (single account) so my shortcut list is private and persists in the
   cloud, not just in a browser's local storage.
9. As the user, if a shortcut has no URL or a broken-looking one, I can see that flagged
   ("Missing"/"Available" status), matching what the spreadsheet used to show me.
10. As the user, the app looks and feels intentional — not a bare admin table — because I'll be
    looking at it every day.

## 6. Functional Requirements

- **Auth:** Single-user email/password login (Appwrite Cloud built-in auth). No public sign-up.
- **List/Read:** Fetch and render all shortcuts belonging to the logged-in user.
- **Create:** Form with `name` (required), `url` (required, validated), `category` (required,
  from a fixed enum, extensible).
- **Update:** Edit any field of an existing shortcut.
- **Delete:** Remove a shortcut, with an "Are you sure?" confirmation (destructive action).
- **Search:** Client-side fuzzy match on name + category as the user types, debounced.
- **Filter:** Category chip bar; clicking a chip narrows the visible grid; "All" resets it.
- **Status badge:** Derived, not stored — `Available` if `url` is non-empty and looks like a
  valid URL, else `Missing`.
- **Empty states:** First-run ("no shortcuts yet — add your first one") and
  no-search-results states, each with a clear next action.
- **Responsive:** Usable at 360px (phone) through desktop widths.

## 7. Data Migration

The existing 44 shortcuts (from `Book1.xlsx` / `Website_Shortcuts_Hub.xlsx`) are the seed data
for the `shortcuts` collection — provided as `appwrite/seed-data.json` for import, so the
user starts with their real, current list rather than an empty app.

## 8. Success Metrics (informal, personal-tool scale)

- App is opened at least as often per week as the Excel file was previously.
- Zero manual `.xlsx` edits after week 2.
- Add/remove flow used at least once without needing to check the README.

## 9. Risks / Open Questions

- **Backend, simplified:** the project originally targeted PocketBase, a stateful Go binary +
  SQLite file that cannot run on Vercel's serverless functions and needed its own persistent
  host. It has since migrated to Appwrite Cloud, a managed service reachable over HTTPS from
  Vercel directly — see TRD §2 and README.md for the full rationale. This entry is kept here so
  the "why" isn't lost, not because it's still an open risk.
- **Single-user auth today, multi-user tomorrow?** Data model keeps an `owner` relation field
  from day one so this isn't a rewrite later, even though v1 enforces single-owner rules.
