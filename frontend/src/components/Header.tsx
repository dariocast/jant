import React from 'react';
import { Search, LayoutGrid, List, BarChart3, Download, RefreshCw, Keyboard, HardDrive, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSemanticSearch: boolean;
  onToggleSemanticSearch: () => void;
  isGridView: boolean;
  onToggleGridView: () => void;
  onOpenStats: () => void;
  onOpenPwaModal: () => void;
  onOpenShortcuts: () => void;
  onOpenBackup: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isPwaInstallable: boolean;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isSemanticSearch,
  onToggleSemanticSearch,
  isGridView,
  onToggleGridView,
  onOpenStats,
  onOpenPwaModal,
  onOpenShortcuts,
  onOpenBackup,
  onRefresh,
  isLoading,
  isPwaInstallable,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-all w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 select-none shrink-0">
          {/* Mobile Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Chiudi menu sezioni' : 'Apri menu sezioni'}
              aria-expanded={Boolean(isMobileMenuOpen)}
              className="p-2.5 md:hidden text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
              title="Menu sezioni"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          )}

          <img
            src="/logo-light.png"
            alt=""
            aria-hidden="true"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-2xs border border-stone-200/70 shrink-0"
          />
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 tracking-tight leading-none">
              J.U.N.T.
            </h1>
            <p className="hidden xl:block text-[10px] text-stone-500 font-sans tracking-widest uppercase mt-0.5">
              Notes &amp; Tasks
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg min-w-0 mx-1 sm:mx-4">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-stone-500 pointer-events-none">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isSemanticSearch ? 'Cerca per significato (AI)...' : 'Cerca note, task o tag (⌘K o /)...'}
              aria-label={isSemanticSearch ? 'Ricerca semantica per significato' : 'Cerca note, task o tag'}
              className={`w-full pl-9 pr-11 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border bg-white/90 focus:bg-white text-stone-800 placeholder-stone-500 transition-all focus:outline-none shadow-2xs ${
                isSemanticSearch
                  ? 'border-purple-400 ring-1 ring-purple-400/40'
                  : 'border-stone-200/90 focus:ring-1 focus:ring-amber-500/40 focus:border-amber-600'
              }`}
            />
            {/* Alterna ricerca testuale <-> ricerca semantica AI */}
            <button
              type="button"
              onClick={onToggleSemanticSearch}
              aria-pressed={isSemanticSearch}
              aria-label={isSemanticSearch ? 'Torna alla ricerca testuale' : 'Attiva ricerca semantica AI'}
              title={isSemanticSearch ? 'Ricerca AI attiva — clicca per tornare al testo' : 'Cerca per significato con l\'AI locale'}
              className={`absolute right-1.5 p-2 rounded-lg transition-all ${
                isSemanticSearch
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-stone-500 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            aria-label="Aggiorna elenco"
            title="Aggiorna"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-700' : ''}`} aria-hidden="true" />
          </button>

          {/* Grid / List switch */}
          <button
            onClick={onToggleGridView}
            aria-label={isGridView ? 'Passa a vista elenco' : 'Passa a vista griglia'}
            title={isGridView ? 'Vista elenco (G)' : 'Vista griglia (G)'}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            {isGridView ? <List className="w-4 h-4" aria-hidden="true" /> : <LayoutGrid className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* Desktop-only Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Backup / Import-Export Button */}
            <button
              onClick={onOpenBackup}
              aria-label="Importa ed esporta dati"
              title="Importa & esporta dati (⌘B o B)"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <HardDrive className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Keyboard Shortcuts Help Button */}
            <button
              onClick={onOpenShortcuts}
              aria-label="Scorciatoie da tastiera"
              title="Scorciatoie da tastiera (? o ⌘/)"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Keyboard className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Stats Button */}
            <button
              onClick={onOpenStats}
              title="Statistiche di produttività (S)"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            >
              <BarChart3 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>Stats</span>
            </button>
          </div>

          {/* PWA Install Button */}
          {isPwaInstallable && (
            <button
              onClick={onOpenPwaModal}
              aria-label="Installa applicazione"
              title="Installa applicazione"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Installa PWA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
