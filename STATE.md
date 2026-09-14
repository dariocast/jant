# STATE.md - J.U.N.T. Project Status

## Version
Current Version: `v0.1.1` (Consistent across Backend, Frontend, Mobile, and Docker)

## Architecture & Brand Updates
- **Brand Identity**:
  - Official high-res brand logos integrated (`logo-light.png`, `logo-dark.png`)
  - Updated PWA app icons and mobile app bar/drawer assets
- **Typography**:
  - Replaced narrow Playfair Display with open, modern **Lora** and **Fraunces** serif typography from Google Fonts, paired with **Plus Jakarta Sans** for maximum editorial readability and visual balance
- **Backend (`/backend`)**:
  - Hono (TypeScript, Node.js 22), SQLite + Prisma ORM
  - Embeddings: Transformers.js (`all-MiniLM-L6-v2`, 384 dimensions)
  - Native Model Context Protocol (MCP) Server at `/mcp`
- **Frontend (`/frontend`)**:
  - React 18 + Vite + Tailwind CSS + Lucide React
  - Pastel Color Palette + Wide Serif Typography (*Lora* / *Fraunces* + *Plus Jakarta Sans*)
  - Progressive Web App (PWA) Supercell Store Pattern
- **Mobile (`/mobile`)**:
  - Flutter + BLoC architecture (`flutter_bloc`)
  - Offline-first local SQLite cache (`sqflite`) + sync + brand assets

## Milestones Roadmap
- [x] Milestone 0: Architecture, Docs & Repository Setup (`v0.1.0-alpha.0`)
- [x] Milestone 1: Hono Backend with Unified Entity, Transformers.js Embeddings, SQLite & MCP Server (`v0.1.0-alpha.1`)
- [x] Milestone 2: React Frontend with Keep UI, Pastel Theme, Time Tracking & Supercell Store PWA Pattern (`v0.1.0-beta.1`)
- [x] Milestone 3: Flutter Mobile App with BLoC, SQLite Cache & Sync (`v0.1.0-rc.1`)
- [x] Milestone 4: Docker Containerization, Production Scripts & Release Tag (`v0.1.0`)
- [x] Milestone 5: Brand Identity & Open Serif Typography Integration (`v0.1.1`)
