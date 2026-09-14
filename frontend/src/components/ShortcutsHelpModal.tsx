import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Crea una nuova nota' },
    { key: 'T', description: 'Crea un nuovo task con scadenza' },
    { key: '/', description: 'Attiva la barra di ricerca' },
    { key: 'G', description: 'Alterna vista Griglia / Elenco' },
    { key: 'S', description: 'Apri la dashboard Statistiche' },
    { key: 'B', description: 'Apri il menu Backup / Import & Export' },
    { key: '?', description: 'Mostra questa guida scorciatoie' },
    { key: 'Esc', description: 'Chiudi modal / Deseleziona input' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-modal overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#FBFBFA]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">
                Scorciatoie da Tastiera
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Velocizza la navigazione in J.U.N.T.
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

        {/* Shortcuts Table */}
        <div className="p-4 sm:p-5 flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-medium text-slate-700">
                {s.description}
              </span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300/80 rounded-lg shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Command className="w-3.5 h-3.5" />
            <span>Productivity Ready</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
