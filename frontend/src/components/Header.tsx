import React from 'react';
import { Search, Sparkles, LayoutGrid, List, BarChart3, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSemanticSearch: boolean;
  onToggleSemanticSearch: () => void;
  isGridView: boolean;
  onToggleGridView: () => void;
  onOpenStats: () => void;
  onOpenPwaModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isPwaInstallable: boolean;
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
  onRefresh,
  isLoading,
  isPwaInstallable,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-200 via-sky-200 to-purple-200 flex items-center justify-center shadow-soft border border-slate-200/60 flex-shrink-0">
            <span className="font-serif font-black text-xl text-slate-800 tracking-tight">J</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-none flex items-center gap-2">
              J.A.N.T.
              <span className="hidden sm:inline-block text-[11px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                v0.1.0
              </span>
            </h1>
            <p className="hidden md:block text-xs text-slate-500 font-medium">
              Notes • Tasks • Atomic Timer • Local AI
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              {isSemanticSearch ? (
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isSemanticSearch ? "✨ Cerca per significato AI (es. idee di viaggio, riunioni)..." : "Cerca note, task o tag..."}
              className={`w-full pl-10 pr-24 py-2 text-sm rounded-full border transition-all shadow-sm focus:outline-none focus:ring-2 ${
                isSemanticSearch
                  ? "bg-purple-50/70 border-purple-200 focus:ring-purple-400/40 text-purple-950 placeholder-purple-400"
                  : "bg-white border-slate-200/80 focus:ring-amber-300/60 text-slate-800 placeholder-slate-400"
              }`}
            />
            <button
              type="button"
              onClick={onToggleSemanticSearch}
              title="Attiva/Disattiva Ricerca Semantica AI"
              className={`absolute right-2 px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition-all ${
                isSemanticSearch
                  ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Aggiorna"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* Grid / List switch */}
          <button
            onClick={onToggleGridView}
            title={isGridView ? "Vista Elenco" : "Vista Griglia"}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all"
          >
            {isGridView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title="Statistiche di Produttività"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          {/* PWA App Store Button */}
          <button
            onClick={onOpenPwaModal}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
              isPwaInstallable
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600 shadow-amber-200"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Installa PWA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
