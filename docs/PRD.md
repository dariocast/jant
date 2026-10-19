# Jant Atlas — Product Requirements Document

**Branch:** `feat/capacities-inspired-workspace`  
**Status:** MVP local-first  
**Version:** 0.3.0

## 1. Product intent

Jant Atlas is a calm, local-first workspace for capturing thoughts and keeping their context through explicit connections. It is inspired by the general interaction principles of modern object-based knowledge tools, but uses original implementation, copy, visual treatment, and data structures.

The branch is a deliberate replacement of the original Jant notes/tasks interface. Jant's warm palette, pastel colors, editorial typography, spacing, borders, and soft card treatment are retained as the visual foundation.

## 2. Goals

- Let a user capture a thought without designing a folder structure first.
- Represent knowledge as objects rather than only chronological notes.
- Make relationships and backlinks visible without forcing graph maintenance.
- Keep the first usable version offline and usable without an account.
- Preserve a path toward future export, synchronization, and collaboration.
- Keep the product small enough to understand, run, and evolve locally.

## 3. MVP scope

### 3.1 Workspace views

- **Today:** objects created today.
- **Inbox:** objects tagged `inbox`.
- **Library:** all objects, with type filtering.
- **Connections:** objects that contain explicit links.

### 3.2 Object types

The MVP supports five object types:

- Note
- Project
- Source
- Person
- Task

Every object has:

```text
id: string
type: note | project | source | person | task
title: string
content: string
tags: string[]
links: string[]
createdAt: ISO timestamp
```

### 3.3 Core interactions

- Quick capture input.
- New-object modal with type, title, content, and tags.
- Search across title, content, and tags.
- `Cmd/Ctrl + K` command palette.
- Select an object to inspect related objects and backlinks.
- Filter Library by object type.
- Persist objects in browser `localStorage`.
- Seed the workspace with representative example objects on first load.

## 4. Visual requirements

The Atlas UI must retain the useful Jant visual language:

- background: `#FBFBFA`;
- warm cream surfaces;
- amber accent centered on `#FEF3C7`;
- pastel object colors;
- Lora/Fraunces serif headings;
- Plus Jakarta Sans interface text;
- soft borders and restrained shadows;
- visible keyboard focus states;
- reduced-motion support;
- mobile-friendly touch targets.

The MVP must not reuse proprietary Capacities assets, source code, branding, or marketing copy.

## 5. Technical architecture

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- Browser `localStorage`

The active application lives in `frontend/src/App.tsx`. The old Jant frontend components are intentionally removed from this branch.

### Runtime

The Docker image is a two-stage build:

1. Node builds the frontend.
2. Nginx serves the static `dist/` output on port `3000`.

The former Hono/Prisma/ONNX runtime is not loaded by the MVP container. Its source is retained only as historical material for a future sync/API service.

## 6. Non-goals for this MVP

- User accounts or authentication.
- Cloud synchronization.
- Multi-user collaboration.
- AI-generated content or embeddings.
- Block editor parity with a mature commercial product.
- Attachments, web clipping, and rich media.
- Native mobile application parity.
- Payments or subscription features.

## 7. Acceptance criteria

A release candidate satisfies all of the following:

- `npm ci` succeeds in `frontend/`.
- `npm run test:contract` passes.
- `npm run build` passes with TypeScript checking enabled.
- `docker compose build` succeeds on the target architecture.
- `docker compose up` serves the app at `http://localhost:3000`.
- The served page returns HTTP 200 and contains the Atlas title.
- A user can create an object, reload the page, and see it again.
- Search returns matching title/content/tag results.
- Connections show seeded related objects and contextual backlinks.
- The UI remains usable at mobile viewport widths.

## 8. Next milestones

1. Add explicit link editing/autocomplete between objects.
2. Add JSON export/import with schema versioning.
3. Add a block-oriented editor while keeping plain-text portability.
4. Add a small persistence API and optional sync, without making it mandatory.
5. Add browser-level interaction tests.
6. Re-evaluate whether the old backend should be replaced by a minimal Atlas sync service.

## 9. Risks and decisions

### Local storage limits

`localStorage` is intentionally used for the MVP because it removes setup and makes the first interaction immediate. It is not suitable for large attachments or multi-device sync; export must be added before expanding the data model substantially.

### Explicit links versus automatic graph inference

The MVP uses explicit links and backlinks because they are explainable, reversible, and deterministic. Automatic semantic relationships can be evaluated later, but must not obscure user intent.

### Legacy backend

The old backend contains functionality that is outside the current MVP. It is excluded from the Docker runtime to avoid unnecessary dependencies and ARM-specific ONNX failures. It should not be reintroduced until the Atlas data model and sync requirements are explicit.
