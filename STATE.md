# STATE.md - J.A.N.T. Project Status

## Version
Current Version: `v0.1.0` (Consistent across Backend, Frontend, Mobile, and Docker)

## Architecture Overview
- **Backend (`/backend`)**:
  - Hono (TypeScript, Node.js 22)
  - SQLite (`dev.db`) + Prisma ORM
  - Embeddings: Transformers.js (`@xenova/transformers`, `all-MiniLM-L6-v2`, 384 dimensions)
  - Native Model Context Protocol (MCP) Server at `/mcp`
  - Unified entity architecture & JSON array time logs
- **Frontend (`/frontend`)**:
  - React 18 + Vite + Tailwind CSS + Lucide React
  - Pastel Color Palette + Typography match (*Playfair Display* serif paired with *Plus Jakarta Sans*)
  - Progressive Web App (PWA) with **Supercell Store Pattern**:
    - `manifest.json` with narrow and wide high-res screenshots, icons, and shortcuts
    - Educational In-App interactive carousel modal, OS detection (Chromium prompt, iOS Safari step-by-step icons), standalone detection, and discrete banner
- **Mobile (`/mobile`)**:
  - Flutter + BLoC architecture (`flutter_bloc`)
  - Offline-first local SQLite cache (`sqflite`)
  - Background persistent timer & Hono API synchronization
- **DevOps & Root (`/`)**:
  - Multi-stage `Dockerfile` + `docker-compose.yml`
  - Zero-config `start.sh` bootstrap script
  - Complete Git milestone tagging (`v0.1.0-alpha.0`, `v0.1.0-alpha.1`, `v0.1.0-beta.1`, `v0.1.0-rc.1`, `v0.1.0`)

## Milestones Roadmap
- [x] Milestone 0: Architecture, Docs & Repository Setup (`v0.1.0-alpha.0`)
- [x] Milestone 1: Hono Backend with Unified Entity, Transformers.js Embeddings, SQLite & MCP Server (`v0.1.0-alpha.1`)
- [x] Milestone 2: React Frontend with Keep UI, Pastel Theme, Time Tracking & Supercell Store PWA Pattern (`v0.1.0-beta.1`)
- [x] Milestone 3: Flutter Mobile App with BLoC, SQLite Cache & Sync (`v0.1.0-rc.1`)
- [x] Milestone 4: Docker Containerization, Production Scripts, Full Verification & Release Tag (`v0.1.0`)
