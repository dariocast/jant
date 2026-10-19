# STATE.md - Jant Atlas

## Version

`v0.3.0` on branch `feat/capacities-inspired-workspace`.

## Current direction

The branch is a deliberate cleanup/replacement of the original Jant product. The old notes/tasks interface is removed from the frontend. The Jant visual language is retained:

- warm `#FBFBFA` background;
- pastel object palette;
- amber `#FEF3C7` accent;
- Lora/Fraunces serif typography;
- Plus Jakarta Sans UI typography;
- soft borders, cards and editorial spacing.

## Frontend

- React 18 + Vite + Tailwind CSS + Lucide React.
- Local-first object workspace in `frontend/src/App.tsx`.
- Views: Today, Inbox, Library and Connections.
- Object types: note, project, source, person and task.
- Search, tags, explicit links/backlinks, quick capture and creation modal.
- Browser persistence under `jant-atlas-objects-v1` in `localStorage`.
- Contract test: `npm run test:contract`.
- Production build: `npm run build`.

## Runtime

The branch is served as a static local-first frontend. The Docker image builds `frontend/` and serves its `dist/` output with Nginx on port 3000. The old Hono/Prisma/ONNX backend is no longer in the runtime path; its source remains only as historical material for a future sync service.

## Verification

From `frontend/`:

```bash
npm ci
npm run test:contract
npm run build
npm run dev
```

For the container:

```bash
docker compose up --build
```

Then open `http://localhost:3000`.
