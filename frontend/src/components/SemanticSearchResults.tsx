import React from 'react';
import { SemanticSearchResult, PASTEL_COLORS } from '../types';
import { Sparkles, Calendar, Tag } from 'lucide-react';

interface SemanticSearchResultsProps {
  query: string;
  results: SemanticSearchResult[];
  isLoading?: boolean;
  onSelectResult: (id: string) => void;
  onClear: () => void;
}

export const SemanticSearchResults: React.FC<SemanticSearchResultsProps> = ({
  query,
  results,
  isLoading = false,
  onSelectResult,
  onClear,
}) => {
  return (
    <div className="mb-8 p-5 rounded-3xl bg-purple-50/50 border border-purple-200/80 shadow-soft animate-in fade-in">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-200 text-purple-900">
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-purple-950">
              Risultati Ricerca Semantica AI
            </h3>
            <p className="text-xs text-purple-700/80 font-medium">
              Corrispondenze per significato per: <span className="font-bold font-serif italic text-purple-950">"{query}"</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="shrink-0 text-xs font-bold text-purple-800 hover:text-purple-950 px-3 py-2.5 rounded-xl hover:bg-purple-100 transition-all"
        >
          Chiudi risultati AI
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-purple-200/60 bg-white/60 flex flex-col gap-2">
              <div className="skeleton h-4 w-20 rounded-full" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
              <div className="skeleton h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-6 text-purple-800 text-sm font-medium">
          Nessuna nota o task correlato trovato. Prova con altri termini o concetti.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {results.map((res) => {
            const matchPercent = Math.max(0, Math.min(100, Math.round(res.similarity * 100)));
            const currentColor = PASTEL_COLORS.find(c => c.bg.toLowerCase() === res.color.toLowerCase()) || PASTEL_COLORS[0];

            return (
              <div
                key={res.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectResult(res.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectResult(res.id);
                  }
                }}
                style={{ backgroundColor: res.color, borderColor: currentColor.border }}
                className="cursor-pointer p-4 rounded-2xl border shadow-xs hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-2xs">
                      {matchPercent}% Match
                    </span>
                    {res.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <Calendar className="w-3 h-3" />
                        Task
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-base text-slate-900 leading-snug break-words">
                    {res.title || 'Senza titolo'}
                  </h4>

                  <p className="font-sans text-xs text-slate-700 mt-1 line-clamp-3 leading-relaxed">
                    {res.content}
                  </p>
                </div>

                {res.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-black/5">
                    {res.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/5 text-slate-700"
                      >
                        <Tag className="w-2 h-2 opacity-60" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
