# PRODUCT.md

**Visione**
J.A.N.T. (Just Another Notes & Tasks). App FOSS self-hosted, ultra-leggera a zero costi. Sostituisce Google Keep e Tasks integrando time tracking e AI.

**Core Features (Backend & Web)**
* UI a griglia/lista (Keep-style) con colori.
* Unified Entity: Una nota diventa task assegnando `dueDate`.
* Play/Stop Timer: Logging temporale atomico su ogni card.
* Ricerca Semantica: Embeddings generati localmente salvati in SQLite.

**Mobile (Flutter)**
* Offline-first con cache SQLite locale e sync in background.
* Architettura Bloc.
* Ricezione intent nativi dell'OS per condivisione rapida testo/link.
* Timer in background persistente.
