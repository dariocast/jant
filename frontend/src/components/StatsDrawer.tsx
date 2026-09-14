import React from 'react';
import { StatsData } from '../types';
import {
  X,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  BarChart2,
  Tag,
  Zap,
} from 'lucide-react';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StatsData | null;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FBFBFA]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">
                Dashboard Produttività
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Metriche e statistiche di utilizzo locali
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {stats ? (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col">
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Tempo Totale
                  </span>
                  <span className="font-serif text-2xl font-bold text-amber-950">
                    {stats.totalHoursTracked}h
                  </span>
                  <span className="text-[11px] text-amber-700/80 mt-1">
                    {Math.floor(stats.totalSecondsTracked / 60)} minuti tracciati
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col">
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Task Risolti
                  </span>
                  <span className="font-serif text-2xl font-bold text-emerald-950">
                    {stats.completedTasksCount} / {stats.tasksCount}
                  </span>
                  <span className="text-[11px] text-emerald-700/80 mt-1">
                    {stats.tasksCount > 0
                      ? `${Math.round((stats.completedTasksCount / stats.tasksCount) * 100)}% completamento`
                      : 'Nessun task attivo'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-sky-800 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Note Attive
                  </span>
                  <span className="font-serif text-2xl font-bold text-sky-950">
                    {stats.notesCount}
                  </span>
                  <span className="text-[11px] text-sky-700/80 mt-1">
                    {stats.totalItems} elementi totali
                  </span>
                </div>
              </div>

              {/* Active Timers Card */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-200/70 text-purple-900">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-950">
                      Timer Atomici in Esecuzione
                    </h4>
                    <p className="text-xs text-purple-800/80">
                      {stats.activeTimersCount > 0
                        ? `${stats.activeTimersCount} scheda/e con tracciamento attivo`
                        : 'Nessun timer attivo al momento'}
                    </p>
                  </div>
                </div>
                {stats.activeTimersCount > 0 && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-600 text-white animate-pulse">
                    Live
                  </span>
                )}
              </div>

              {/* Tag Breakdown */}
              {Object.keys(stats.tagCounts).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Distribuzione Tag
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.tagCounts).map(([tag, count]) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700"
                      >
                        <span className="font-bold">#{tag}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px] font-semibold">
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technology & Privacy info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Architettura Edge 100% Privacy
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Tutti i dati, il database SQLite e gli embeddings vettoriali con Transformers.js risiedono esclusivamente sulla tua macchina senza chiamate cloud esterne.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              Caricamento statistiche in corso...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
