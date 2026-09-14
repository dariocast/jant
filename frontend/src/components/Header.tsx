import React from 'react';
import { Search, LayoutGrid, List, BarChart3, Download, RefreshCw, Keyboard, HardDrive, Menu, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
        <div className="flex items-center gap-2.5 sm:gap-3 select-none shrink-0">
          {/* Mobile Hamburger Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 md:hidden text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
              title="Menu Sezioni"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <img
            src="/logo-light.png"
            alt="J.U.N.T. Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shadow-2xs border border-stone-200/70 shrink-0"
          />
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 tracking-tight leading-none">
              J.U.N.T.
            </h1>
            <p className="hidden xl:block text-[10px] text-stone-400 font-sans tracking-widest uppercase mt-0.5">
              Notes &amp; Tasks
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg min-w-0 mx-1 sm:mx-4">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-stone-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca note, task o tag (⌘K o /)..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-xl border border-stone-200/90 bg-white/90 focus:bg-white focus:ring-1 focus:ring-amber-500/40 focus:border-amber-600 text-stone-800 placeholder-stone-400 transition-all focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Aggiorna"
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* Grid / List switch */}
          <button
            onClick={onToggleGridView}
            title={isGridView ? "Vista Elenco (G)" : "Vista Griglia (G)"}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            {isGridView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          {/* Desktop-only Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Backup / Import-Export Button */}
            <button
              onClick={onOpenBackup}
              title="Importa & Esporta Dati (⌘B o B)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <HardDrive className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Help Button */}
            <button
              onClick={onOpenShortcuts}
              title="Scorciatoie da tastiera (? o ⌘/)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Stats Button */}
            <button
              onClick={onOpenStats}
              title="Statistiche di Produttività (S)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Stats</span>
            </button>
          </div>

          {/* PWA Install Button */}
          {isPwaInstallable && (
            <button
              onClick={onOpenPwaModal}
              title="Installa applicazione"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Installa PWA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
