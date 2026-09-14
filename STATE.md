# STATE.md - J.A.N.T. Project Status

## Version
Current Version: `v0.1.0`

## Architecture Overview
- **Backend (`/backend`)**: Hono (TypeScript, Node.js), Prisma ORM, SQLite (`dev.db`), `sqlite-vec` / vector embeddings using Transformers.js (`@xenova/transformers`), native MCP Server (`/mcp` SSE/POST).
- **Frontend (`/frontend`)**: React 18 + Vite + Tailwind CSS + Lucide React + PWA Supercell Store Pattern + Pastel UI (Playfair Display + Plus Jakarta Sans).
- **Mobile (`/mobile`)**: Flutter + BLoC + local SQLite offline cache + background timer + share intent handler.
- **Root**: Dockerfile, docker-compose.yml, bootstrap script.

## Milestones Roadmap
- [x] Milestone 0: Architecture, Docs & Repository Setup (`v0.1.0-alpha.0`)
- [ ] Milestone 1: Hono Backend with Unified Entity, Transformers.js Embeddings, SQLite & MCP Server (`v0.1.0-alpha.1`)
- [ ] Milestone 2: React Frontend with Keep UI, Pastel Theme, Time Tracking & Supercell Store PWA Pattern (`v0.1.0-beta.1`)
- [ ] Milestone 3: Flutter Mobile App with BLoC, SQLite Cache & Sync (`v0.1.0-rc.1`)
- [ ] Milestone 4: Docker Containerization, Production Scripts, Full Verification & Release Tag (`v0.1.0`)
