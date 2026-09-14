import React, { useState, useEffect, useCallback } from 'react';
import { Item, FilterType, StatsData, SemanticSearchResult } from './types';
import * as api from './api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { QuickCreateBar } from './components/QuickCreateBar';
import { NoteEditorModal } from './components/NoteEditorModal';
import { StatsDrawer } from './components/StatsDrawer';
import { PwaInstallModal } from './components/PwaInstallModal';
import { PwaBanner } from './components/PwaBanner';
import { SemanticSearchResults } from './components/SemanticSearchResults';
import {
  FileText,
  CheckSquare,
  Sparkles,
  Trash2,
  Archive,
  Layers,
} from 'lucide-react';

export const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Modals state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

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

  // Load items & stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [itemsData, statsData] = await Promise.all([
        api.fetchItems(filter, selectedTag, !isSemanticSearch ? searchQuery : undefined),
        api.fetchStats(),
      ]);
      setItems(itemsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, selectedTag, searchQuery, isSemanticSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Semantic search trigger
  useEffect(() => {
    if (!isSemanticSearch || !searchQuery.trim()) {
      setSemanticResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await api.searchSemantic(searchQuery.trim(), 8);
        setSemanticResults(results);
      } catch (e) {
        console.error('Semantic search error:', e);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [isSemanticSearch, searchQuery]);

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
      // Update stats
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Item>) => {
    try {
      const updated = await api.updateItem(id, updates);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleToggleTimer = async (id: string) => {
    try {
      const { item: updated } = await api.toggleTimer(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to toggle timer:', err);
    }
  };

  const handleTrash = async (id: string) => {
    try {
      await api.deleteItem(id, filter === 'trash');
      setItems((prev) => prev.filter((item) => item.id !== id));
      api.fetchStats().then(setStats).catch(() => {});
    } catch (err) {
      console.error('Failed to trash/delete item:', err);
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
    } catch (err) {
      console.error('Failed to restore item:', err);
    }
  };

  const handleSelectSemanticResult = async (id: string) => {
    try {
      const item = await api.fetchItem(id);
      setEditingItem(item);
    } catch (e) {
      console.error('Failed to load item for semantic result:', e);
    }
  };

  // Group items by Pinned vs Others (unless trash or archived view)
  const pinnedItems = items.filter((i) => i.isPinned);
  const regularItems = items.filter((i) => !i.isPinned);

  // Extract all unique tags
  const allTags = stats ? Object.keys(stats.tagCounts) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA]">
      {/* Top Discrete PWA Banner */}
      <PwaBanner
        onOpenModal={() => setIsPwaModalOpen(true)}
        isStandalone={isStandalone}
      />

      {/* Main App Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSemanticSearch={isSemanticSearch}
        onToggleSemanticSearch={() => setIsSemanticSearch(!isSemanticSearch)}
        isGridView={isGridView}
        onToggleGridView={() => setIsGridView(!isGridView)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        onRefresh={loadData}
        isLoading={isLoading}
        isPwaInstallable={Boolean(deferredPrompt) || !isStandalone}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <Sidebar
          currentFilter={filter}
          onSelectFilter={setFilter}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          tags={allTags}
          stats={stats ? {
            notesCount: stats.notesCount,
            tasksCount: stats.tasksCount,
            pendingTasksCount: stats.pendingTasksCount,
            activeTimersCount: stats.activeTimersCount,
            totalHoursTracked: stats.totalHoursTracked,
          } : undefined}
        />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Quick Create Note/Task Bar (Only when not in trash or archive) */}
          {filter !== 'trash' && filter !== 'archived' && (
            <QuickCreateBar onCreate={handleCreate} />
          )}

          {/* AI Semantic Search Results Section */}
          {isSemanticSearch && searchQuery.trim() && (
            <SemanticSearchResults
              query={searchQuery}
              results={semanticResults}
              onSelectResult={handleSelectSemanticResult}
              onClear={() => {
                setIsSemanticSearch(false);
                setSearchQuery('');
              }}
            />
          )}

          {/* Empty State */}
          {items.length === 0 && !isLoading && (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center text-amber-800 shadow-soft mb-2">
                {filter === 'tasks' ? (
                  <CheckSquare className="w-8 h-8" />
                ) : filter === 'trash' ? (
                  <Trash2 className="w-8 h-8 text-slate-400" />
                ) : filter === 'archived' ? (
                  <Archive className="w-8 h-8 text-blue-500" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800">
                {filter === 'trash'
                  ? 'Il cestino è vuoto'
                  : filter === 'archived'
                  ? 'Nessun elemento archiviato'
                  : filter === 'tasks'
                  ? 'Nessun task in sospeso'
                  : 'Nessuna nota trovata'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                {filter === 'trash'
                  ? 'Gli elementi eliminati appariranno qui prima di essere rimossi definitivamente.'
                  : filter === 'tasks'
                  ? 'Imposta una data di scadenza su qualsiasi nota per trasformarla in un task.'
                  : 'Usa la barra in alto per creare la tua prima nota o idea!'}
              </p>
            </div>
          )}

          {/* Pinned Section */}
          {pinnedItems.length > 0 && filter !== 'trash' && filter !== 'archived' && (
            <section className="mb-8">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>In Evidenza ({pinnedItems.length})</span>
              </div>
              <div
                className={
                  isGridView
                    ? 'masonry-grid'
                    : 'flex flex-col gap-3'
                }
              >
                {pinnedItems.map((item) => (
                  <div key={item.id} className={isGridView ? 'masonry-item' : ''}>
                    <NoteCard
                      item={item}
                      onEdit={setEditingItem}
                      onToggleTimer={handleToggleTimer}
                      onToggleComplete={(id, completed) => handleUpdate(id, { isCompleted: completed })}
                      onTogglePin={(id, pinned) => handleUpdate(id, { isPinned: pinned })}
                      onArchive={(id, archived) => handleUpdate(id, { isArchived: archived })}
                      onTrash={handleTrash}
                      onChangeColor={(id, color) => handleUpdate(id, { color })}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Regular Items / Other Section */}
          {regularItems.length > 0 && (
            <section>
              {pinnedItems.length > 0 && filter !== 'trash' && filter !== 'archived' && (
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 px-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Altre Note &amp; Task ({regularItems.length})</span>
                </div>
              )}
              <div
                className={
                  isGridView
                    ? 'masonry-grid'
                    : 'flex flex-col gap-3'
                }
              >
                {regularItems.map((item) => (
                  <div key={item.id} className={isGridView ? 'masonry-item' : ''}>
                    <NoteCard
                      item={item}
                      onEdit={setEditingItem}
                      onToggleTimer={handleToggleTimer}
                      onToggleComplete={(id, completed) => handleUpdate(id, { isCompleted: completed })}
                      onTogglePin={(id, pinned) => handleUpdate(id, { isPinned: pinned })}
                      onArchive={(id, archived) => handleUpdate(id, { isArchived: archived })}
                      onTrash={handleTrash}
                      onRestore={handleRestore}
                      onChangeColor={(id, color) => handleUpdate(id, { color })}
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
        onDelete={handleTrash}
        onToggleTimer={handleToggleTimer}
      />

      {/* Productivity Stats Drawer Modal */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      {/* PWA Supercell Store Experience Modal */}
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
    </div>
  );
};
