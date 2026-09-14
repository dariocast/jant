# STATE.md - J.U.N.T. Project Status

## Version
Current Version: `v0.2.1` (Consistent across Backend, Frontend, Mobile, and Docker)

## Architecture & Brand Updates
- **Brand Identity**:
  - Official high-res brand logos integrated (`logo-light.png`, `logo-dark.png`)
  - App launcher icons generated across Android, iOS, Web and macOS via `flutter_launcher_icons`
- **Typography & UI**:
  - Open, modern **Lora** and **Fraunces** serif typography from Google Fonts, paired with **Plus Jakarta Sans** for maximum editorial readability and visual balance
  - Clean semantic icons throughout (removed ambiguous sparkle icons from standard creation/save actions)
- **Keyboard Shortcuts (`/frontend`)**:
  - Full keyboard shortcuts navigation (`N`/`C` create note, `T` new task, `/` search, `G` toggle layout, `S` stats, `B` backup/import dialog, `?` shortcuts help dialog, `Esc` dismiss modals)
  - Dedicated shortcuts help dialog accessible from the top navigation bar (`Keyboard` icon)
- **Data Import & Export**:
  - Backend endpoints: `GET /api/items/backup/export` and `POST /api/items/backup/import`
  - Frontend Backup/Restore modal supporting JSON full backup (with auto-vectorization) and Markdown file export
- **Markdown Formatting (Web & Mobile)**:
  - Web: Live markdown rendering with headings, bold/italic, blockquotes, code blocks, lists, and interactive checkbox toggling (`- [ ]` / `- [x]`) directly on cards and in editor preview
  - Mobile: Full Markdown rendering via `flutter_markdown` in note cards and live Markdown preview tab in `EditItemScreen`
- **Backend (`/backend`)**:
  - Hono (TypeScript, Node.js 22), SQLite + Prisma ORM
  - Embeddings: Transformers.js (`all-MiniLM-L6-v2`, 384 dimensions)
  - Native Model Context Protocol (MCP) Server at `/mcp`
- **Frontend (`/frontend`)**:
  - React 18 + Vite + Tailwind CSS + Lucide React
  - Pastel Color Palette + Wide Serif Typography (*Lora* / *Fraunces* + *Plus Jakarta Sans*)
- **Mobile (`/mobile`)**:
  - Flutter + BLoC architecture (`flutter_bloc`)
  - Offline-first local SQLite cache (`sqflite`) + sync + native launcher icons + `flutter_markdown`

## Milestones Roadmap
- [x] Milestone 0: Architecture, Docs & Repository Setup (`v0.1.0-alpha.0`)
- [x] Milestone 1: Hono Backend with Unified Entity, Transformers.js Embeddings, SQLite & MCP Server (`v0.1.0-alpha.1`)
- [x] Milestone 2: React Frontend with Keep UI, Pastel Theme, Time Tracking & PWA (`v0.1.0-beta.1`)
- [x] Milestone 3: Flutter Mobile App with BLoC, SQLite Cache & Sync (`v0.1.0-rc.1`)
- [x] Milestone 4: Docker Containerization, Production Scripts & Release Tag (`v0.1.0`)
- [x] Milestone 5: Brand Identity & Open Serif Typography Integration (`v0.1.1`)
- [x] Milestone 6: Native Mobile Launcher Icons via `flutter_launcher_icons` (`v0.1.2`)
- [x] Milestone 7: UI Cleanup - Removed banner and cleaned modal labels (`v0.1.3`)
- [x] Milestone 8: Keyboard Shortcuts, Icon Polish, Import/Export Backup & Full Markdown Support (`v0.2.0`)
- [x] Milestone 9: UX & Accessibility Review — feedback, undo, conferme distruttive e parità web/mobile (`v0.2.1`)

## UX & Accessibility Review (v0.2.1)
**Frontend (`/frontend`)**
- Corretta violazione delle *Rules of Hooks* in `NoteEditorModal` (hook dichiarati dopo un `return null`)
- Ricerca semantica AI ora raggiungibile dall'interfaccia (toggle ✦ nella barra di ricerca)
- Nessuna via d'uscita perde le modifiche: `Esc`, `X` e clic sullo sfondo salvano coerentemente
- Toast globali con azione **Annulla** sullo spostamento nel cestino; conferma esplicita sull'eliminazione definitiva
- Debounce di 300 ms sulla ricerca testuale (prima una richiesta per ogni tasto)
- Modali con `role="dialog"`, focus trap, blocco dello scroll di fondo e ripristino del focus
- Aree di tocco ≥44 px, `aria-label` sui controlli icona, focus ring visibile, zoom riabilitato, supporto `prefers-reduced-motion`
- Skeleton di caricamento al posto dello stato vuoto ingannevole; stati vuoti con azione suggerita

**Mobile (`/mobile`)**
- Undo sullo spostamento nel cestino e ripristino dal cestino (`RestoreItemEvent`)
- Conferma sulle eliminazioni; `PopScope` salva anche all'uscita con il gesto di sistema
- Timer, campo tag e barra Markdown disponibili anche in `EditItemScreen` (parità con il web)
- Debounce di 300 ms sulla ricerca; `RefreshIndicator` che attende la sincronizzazione reale
- Filtro attivo sempre visibile nella barra superiore e voce evidenziata nel drawer
- Sezioni "In evidenza" / "Altre note & task" come sul web; `ValueKey` sulle schede
- Aree di tocco 48 dp, tooltip e `Semantics` sui controlli icona, spazio finale sotto il FAB
- Localizzazione italiana di date picker e formati data (`flutter_localizations`)
