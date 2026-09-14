import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Item, FilterType, StatsData, SemanticSearchResult } from './types';
import * as api from './api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { QuickCreateBar } from './components/QuickCreateBar';
import { NoteEditorModal } from './components/NoteEditorModal';
import { StatsDrawer } from './components/StatsDrawer';
import { PwaInstallModal } from './components/PwaInstallModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { BackupModal } from './components/BackupModal';
import { SemanticSearchResults } from './components/SemanticSearchResults';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useToast } from './components/Toast';
import {
  FileText,
  CheckSquare,
  Pin,
  Trash2,
  Archive,
  Layers,
  X,
  BarChart3,
  HardDrive,
  Keyboard,
  Plus,
} from 'lucide-react';

/** Segnaposto mostrato durante il primo caricamento, al posto di uno stato vuoto ingannevole. */
const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-stone-200/70 bg-white p-5 flex flex-col gap-3">
    <div className="skeleton h-4 w-1/3 rounded-full" />
    <div className="skeleton h-5 w-3/4 rounded-lg" />
    <div className="skeleton h-3 w-full rounded-full" />
    <div className="skeleton h-3 w-5/6 rounded-full" />
    <div className="skeleton h-7 w-24 rounded-full mt-2" />
  </div>
);

export const App: React.FC = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Modals state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<Item | null>(null);

  // PWA Prompt & Standalone detection
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Un modale aperto gestisce da sé Esc e la tastiera: le scorciatoie
  // globali restano silenti per non interferire con la modifica in corso.
  const isAnyModalOpen =
    Boolean(editingItem) || isStatsOpen || isPwaModalOpen || isShortcutsOpen || isBackupOpen || Boolean(pendingPermanentDelete);
  const isAnyModalOpenRef = useRef(isAnyModalOpen);
  isAnyModalOpenRef.current = isAnyModalOpen;

  // Debounce della ricerca testuale: evita una richiesta per ogni tasto premuto.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        // I modali chiudono da soli; qui restano solo i pannelli leggeri.
        setIsStatsOpen(false);
        setIsPwaModalOpen(false);
        setIsShortcutsOpen(false);
        setIsBackupOpen(false);
        setIsMobileMenuOpen(false);
        if (isInput) target.blur();
        return;
      }

      if (isAnyModalOpenRef.current) return;

      // Combinations with Cmd/Ctrl
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          focusQuickCreate();
          return;
        }
        if (e.shiftKey && (e.key === 't' || e.key === 'T')) {
          e.preventDefault();
          setFilter('tasks');
          return;
        }
        if (e.shiftKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          setIsStatsOpen((prev) => !prev);
          return;
        }
        if (e.shiftKey && (e.key === 'b' || e.key === 'B')) {
          e.preventDefault();
          setIsBackupOpen((prev) => !prev);
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          return;
        }
      }

      if (isInput || e.metaKey || e.ctrlKey || e.altKey) return;

      // Single-key shortcuts (when no input is focused)
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        focusQuickCreate();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setFilter('tasks');
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsGridView((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsStatsOpen((prev) => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setIsBackupOpen((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    const focusQuickCreate = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const titleInput = document.querySelector('input[placeholder="Titolo della nota..."]') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
      } else {
        const trigger = document.querySelector('[data-quick-create-trigger]') as HTMLElement;
        trigger?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load items & stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        api.fetchItems(filter, selectedTag, !isSemanticSearch ? debouncedQuery : undefined),
        api.fetchStats(),
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('Impossibile contattare il server. Controlla che il backend sia attivo.', { variant: 'error' });
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [filter, selectedTag, debouncedQuery, isSemanticSearch, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Semantic search trigger
  useEffect(() => {
    if (!isSemanticSearch || !searchQuery.trim()) {
      setSemanticResults([]);
      setIsSemanticLoading(false);
      return;
    }

    setIsSemanticLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await api.searchSemantic(searchQuery.trim(), 8);
        setSemanticResults(results);
      } catch (e) {
        console.error('Semantic search error:', e);
        showToast('Ricerca semantica non riuscita.', { variant: 'error' });
      } finally {
        setIsSemanticLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [isSemanticSearch, searchQuery, showToast]);

  // Handle URL shortcut parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const view = params.get('view');

    if (action === 'new-task') {
      setFilter('tasks');
    } else if (view === 'stats') {
      setIsStatsOpen(true);
    }
  }, []);

  // Item Actions
  const handleCreate = async (data: {
    title: string;
    content: string;
    color: string;
    dueDate: string | null;
    tags: string[];
    isPinned: boolean;
  }) => {
    try {
      const newItem = await api.createItem(data);
      setItems((prev) => [newItem, ...prev]);
      api.fetchStats().then(setStats).catch(() => {});
      showToast(data.dueDate ? 'Task creato.' : 'Nota creata.', { variant: 'success' });
    } catch (err) {
      console.error('Failed to create item:', err);
      showToast('Creazione non riuscita. Riprova.', { variant: 'error' });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Item>) => {
    try {
      const updated = await api.updateItem(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to update item:', err);
      showToast('Salvataggio non riuscito. Le modifiche non sono state applicate.', { variant: 'error' });
      loadData();
    }
  };

  const handleToggleTimer = async (id: string) => {
    try {
      const { item: updated } = await api.toggleTimer(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to toggle timer:', err);
      showToast('Il timer non è stato aggiornato.', { variant: 'error' });
    }
  };

  /** Sposta nel cestino con possibilità di annullare l'operazione. */
  const handleTrash = async (id: string) => {
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await api.deleteItem(id, false);
      api.fetchStats().then(setStats).catch(() => {});
      showToast('Spostato nel cestino.', {
        variant: 'success',
        action: {
          label: 'Annulla',
          onClick: async () => {
            try {
              await api.restoreItem(id);
              await loadData();
              showToast('Elemento ripristinato.', { variant: 'success' });
            } catch {
              showToast('Ripristino non riuscito.', { variant: 'error' });
            }
          },
        },
      });
    } catch (err) {
      console.error('Failed to trash item:', err);
      setItems(previous);
      showToast('Spostamento nel cestino non riuscito.', { variant: 'error' });
    }
  };

  /** L'eliminazione definitiva non è reversibile: passa sempre da una conferma. */
  const handleDeleteRequest = (id: string) => {
    if (filter === 'trash') {
      const target = items.find((i) => i.id === id) || null;
      setPendingPermanentDelete(target);
      return;
    }
    handleTrash(id);
  };

  const confirmPermanentDelete = async () => {
    const target = pendingPermanentDelete;
    setPendingPermanentDelete(null);
    if (!target) return;
    try {
      await api.deleteItem(target.id, true);
      setItems((prev) => prev.filter((item) => item.id !== target.id));
      api.fetchStats().then(setStats).catch(() => {});
      showToast('Elemento eliminato definitivamente.', { variant: 'success' });
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('Eliminazione non riuscita.', { variant: 'error' });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const restored = await api.restoreItem(id);
      if (filter === 'trash') {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setItems((prev) => [restored, ...prev]);
      }
      api.fetchStats().then(setStats).catch(() => {});
      showToast('Elemento ripristinato.', { variant: 'success' });
    } catch (err) {
      console.error('Failed to restore item:', err);
      showToast('Ripristino non riuscito.', { variant: 'error' });
    }
  };

  const handleSelectSemanticResult = async (id: string) => {
    try {
      const item = await api.fetchItem(id);
      setEditingItem(item);
    } catch (e) {
      console.error('Failed to load item for semantic result:', e);
      showToast('Impossibile aprire il risultato selezionato.', { variant: 'error' });
    }
  };

  const openQuickCreate = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const trigger = document.querySelector('[data-quick-create-trigger]') as HTMLElement;
    trigger?.click();
  };

  // Group items by Pinned vs Others (unless trash or archived view)
  const pinnedItems = items.filter((i) => i.isPinned);
  const regularItems = items.filter((i) => !i.isPinned);

  // Extract all unique tags
  const allTags = stats ? Object.keys(stats.tagCounts) : [];

  const sidebarStats = stats
    ? {
        notesCount: stats.notesCount,
        tasksCount: stats.tasksCount,
        pendingTasksCount: stats.pendingTasksCount,
        activeTimersCount: stats.activeTimersCount,
        totalHoursTracked: stats.totalHoursTracked,
      }
    : undefined;

  const showSkeleton = isLoading && !hasLoadedOnce;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] overflow-x-hidden w-full">
      {/* Salto rapido al contenuto per chi naviga da tastiera */}
      <a
        href="#contenuto-principale"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-white focus:shadow-modal focus:text-sm focus:font-semibold"
      >
        Vai al contenuto
      </a>

      {/* Main App Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSemanticSearch={isSemanticSearch}
        onToggleSemanticSearch={() => setIsSemanticSearch((prev) => !prev)}
        isGridView={isGridView}
        onToggleGridView={() => setIsGridView(!isGridView)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onRefresh={loadData}
        isLoading={isLoading}
        isPwaInstallable={Boolean(deferredPrompt) || !isStandalone}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Slide-over Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex animate-in fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu sezioni"
            className="relative w-4/5 max-w-xs bg-[#FBFBFA] h-full shadow-2xl p-4 flex flex-col z-50 overflow-y-auto border-r border-slate-200 animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <img src="/logo-light.png" alt="" aria-hidden="true" className="w-8 h-8 rounded-xl object-cover shadow-soft" />
                <span className="font-serif font-bold text-lg text-slate-900">J.U.N.T.</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Chiudi menu"
                className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <Sidebar
              currentFilter={filter}
              onSelectFilter={setFilter}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              tags={allTags}
              stats={sidebarStats}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Extra Menu Actions */}
            <div className="mt-auto pt-4 border-t border-slate-200/80 flex flex-col gap-2 text-xs">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsStatsOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-700 bg-white border border-slate-200 font-semibold shadow-2xs"
              >
                <BarChart3 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Statistiche &amp; timer</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBackupOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-700 bg-white border border-slate-200 font-semibold shadow-2xs"
              >
                <HardDrive className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Backup / import &amp; export</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsShortcutsOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-slate-700 bg-white border border-slate-200 font-semibold shadow-2xs"
              >
                <Keyboard className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Scorciatoie da tastiera</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Navigation Sidebar (Desktop only) */}
        <div className="hidden md:block">
          <Sidebar
            currentFilter={filter}
            onSelectFilter={setFilter}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            tags={allTags}
            stats={sidebarStats}
          />
        </div>

        {/* Center Workspace */}
        <main id="contenuto-principale" className="flex-1 flex flex-col min-w-0">
          {/* Quick Create Note/Task Bar (Only when not in trash or archive) */}
          {filter !== 'trash' && filter !== 'archived' && (
            <QuickCreateBar onCreate={handleCreate} />
          )}

          {/* AI Semantic Search Results Section */}
          {isSemanticSearch && (
            searchQuery.trim() ? (
              <SemanticSearchResults
                query={searchQuery}
                results={semanticResults}
                isLoading={isSemanticLoading}
                onSelectResult={handleSelectSemanticResult}
                onClear={() => {
                  setIsSemanticSearch(false);
                  setSearchQuery('');
                }}
              />
            ) : (
              <div className="mb-8 p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70 text-sm text-purple-900">
                Ricerca semantica attiva: scrivi un concetto e l'AI locale troverà le note affini per significato,
                non solo per parole esatte.
              </div>
            )
          )}

          {/* Stato di caricamento iniziale */}
          {showSkeleton && (
            <div className={isGridView ? 'masonry-grid' : 'flex flex-col gap-3'} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={isGridView ? 'masonry-item' : ''}>
                  <CardSkeleton />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {items.length === 0 && !isLoading && hasLoadedOnce && (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center text-amber-800 shadow-soft mb-2">
                {filter === 'tasks' ? (
                  <CheckSquare className="w-8 h-8" aria-hidden="true" />
                ) : filter === 'trash' ? (
                  <Trash2 className="w-8 h-8 text-slate-500" aria-hidden="true" />
                ) : filter === 'archived' ? (
                  <Archive className="w-8 h-8 text-blue-600" aria-hidden="true" />
                ) : (
                  <FileText className="w-8 h-8" aria-hidden="true" />
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800">
                {debouncedQuery.trim()
                  ? 'Nessun risultato per questa ricerca'
                  : filter === 'trash'
                  ? 'Il cestino è vuoto'
                  : filter === 'archived'
                  ? 'Nessun elemento archiviato'
                  : filter === 'tasks'
                  ? 'Nessun task in sospeso'
                  : 'Nessuna nota trovata'}
              </h3>
              <p className="text-sm text-slate-600 max-w-sm">
                {debouncedQuery.trim()
                  ? 'Prova con parole diverse, oppure attiva la ricerca semantica AI per cercare per significato.'
                  : filter === 'trash'
                  ? 'Gli elementi eliminati appariranno qui prima di essere rimossi definitivamente.'
                  : filter === 'tasks'
                  ? 'Imposta una data di scadenza su qualsiasi nota per trasformarla in un task.'
                  : 'Crea la tua prima nota per iniziare.'}
              </p>

              {debouncedQuery.trim() ? (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all"
                  >
                    Azzera ricerca
                  </button>
                  {!isSemanticSearch && (
                    <button
                      onClick={() => setIsSemanticSearch(true)}
                      className="px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-2xs transition-all"
                    >
                      Cerca per significato
                    </button>
                  )}
                </div>
              ) : (
                filter !== 'trash' &&
                filter !== 'archived' && (
                  <button
                    onClick={openQuickCreate}
                    className="mt-2 px-4 py-2.5 text-sm font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Crea la prima nota
                  </button>
                )
              )}
            </div>
          )}

          {/* Pinned Section */}
          {pinnedItems.length > 0 && filter !== 'trash' && filter !== 'archived' && (
            <section className="mb-8" aria-label="Elementi in evidenza">
              <div className="text-[11px] font-sans font-bold tracking-widest text-amber-900/90 uppercase mb-3 flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-amber-800 fill-current" aria-hidden="true" />
                <span>In evidenza ({pinnedItems.length})</span>
              </div>
              <div className={isGridView ? 'masonry-grid' : 'flex flex-col gap-3'}>
                {pinnedItems.map((item) => (
                  <div key={item.id} className={isGridView ? 'masonry-item' : ''}>
                    <NoteCard
                      item={item}
                      onEdit={setEditingItem}
                      onToggleTimer={handleToggleTimer}
                      onToggleComplete={(id, completed) => handleUpdate(id, { isCompleted: completed })}
                      onTogglePin={(id, pinned) => handleUpdate(id, { isPinned: pinned })}
                      onArchive={(id, archived) => handleUpdate(id, { isArchived: archived })}
                      onTrash={handleDeleteRequest}
                      onChangeColor={(id, color) => handleUpdate(id, { color })}
                      onUpdateContent={(id, newContent) => handleUpdate(id, { content: newContent })}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Regular Items / Other Section */}
          {regularItems.length > 0 && (
            <section aria-label="Elenco note e task">
              {pinnedItems.length > 0 && filter !== 'trash' && filter !== 'archived' && (
                <div className="text-[11px] font-sans font-bold tracking-widest text-stone-500 uppercase mb-3 flex items-center gap-1.5 px-1">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Altre note &amp; task ({regularItems.length})</span>
                </div>
              )}
              <div className={isGridView ? 'masonry-grid' : 'flex flex-col gap-3'}>
                {regularItems.map((item) => (
                  <div key={item.id} className={isGridView ? 'masonry-item' : ''}>
                    <NoteCard
                      item={item}
                      onEdit={setEditingItem}
                      onToggleTimer={handleToggleTimer}
                      onToggleComplete={(id, completed) => handleUpdate(id, { isCompleted: completed })}
                      onTogglePin={(id, pinned) => handleUpdate(id, { isPinned: pinned })}
                      onArchive={(id, archived) => handleUpdate(id, { isArchived: archived })}
                      onTrash={handleDeleteRequest}
                      onRestore={handleRestore}
                      onChangeColor={(id, color) => handleUpdate(id, { color })}
                      onUpdateContent={(id, newContent) => handleUpdate(id, { content: newContent })}
                      isTrashView={filter === 'trash'}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Note / Task Edit Modal */}
      <NoteEditorModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdate}
        onDelete={handleDeleteRequest}
        onToggleTimer={handleToggleTimer}
      />

      {/* Productivity Stats Drawer Modal */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      {/* PWA Experience Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPrompt}
        isStandalone={isStandalone}
        onInstalled={() => {
          setIsStandalone(true);
          setDeferredPrompt(null);
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsHelpModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Backup / Import & Export Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onImportSuccess={loadData}
        items={items}
      />

      {/* Conferma eliminazione definitiva */}
      <ConfirmDialog
        isOpen={Boolean(pendingPermanentDelete)}
        title="Eliminare definitivamente?"
        description={`"${pendingPermanentDelete?.title || 'Senza titolo'}" verrà rimosso dal database locale. L'operazione non può essere annullata.`}
        confirmLabel="Elimina per sempre"
        onConfirm={confirmPermanentDelete}
        onCancel={() => setPendingPermanentDelete(null)}
      />
    </div>
  );
};
