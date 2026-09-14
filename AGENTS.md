# AGENTS.md

**Tech Stack**
* Backend: Hono (TypeScript).
* Database: SQLite locale + estensione `sqlite-vec`. Nessun cloud.
* ORM: Prisma.
* Web UI: Vite (React) compilata come SPA statica servita dal backend.
* Mobile: Flutter, Dart, Bloc.
* AI/Embeddings: Transformers.js (integrato nel backend Node.js/Bun).

**Struttura Repository (Tassativa)**
* `/backend`: API Hono, server MCP nativo, file SQLite.
* `/frontend`: Codice React/Vite.
* `/mobile`: Progetto Flutter.
* `/` (Root): Documentazione (AGENTS.md, PRODUCT.md, STATE.md), script di bootstrap, eventuali file Docker per deploy.

**Regole di Sviluppo**
* Entità Unica: Modello database singolo per note e task.
* Time Tracking: Array serializzato in JSON nel DB `[{start, end}]`.
* Ricerca Vettoriale: Utilizzare BLOB per salvare i vettori compatibili con `sqlite-vec`.
* MCP: Endpoint Hono progettati per agire nativamente come Model Context Protocol Server.
