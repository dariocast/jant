import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileJson, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { Item } from '../types';
import { useDialog } from '../hooks/useDialog';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  items: Item[];
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  items,
}) => {
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useDialog(isOpen);

  if (!isOpen) return null;

  // Handle Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        app: 'J.U.N.T.',
        version: '0.2.1',
        exportedAt: new Date().toISOString(),
        count: items.length,
        items,
      }, null, 2));

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `junt-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setStatusMessage({ text: `Backup JSON esportato con successo (${items.length} elementi).`, isError: false });
    } catch (err: any) {
      setStatusMessage({ text: `Errore nell'esportazione: ${err.message}`, isError: true });
    }
  };

  // Handle Export to Markdown archive
  const handleExportMarkdown = () => {
    try {
      let mdContent = `# J.U.N.T. — Export Markdown\nData: ${new Date().toLocaleString()}\n\n---\n\n`;

      for (const item of items) {
        mdContent += `## ${item.title || 'Senza titolo'}\n`;
        if (item.dueDate) {
          mdContent += `> 📅 **Scadenza**: ${new Date(item.dueDate).toLocaleString()} | **Stato**: ${item.isCompleted ? 'Completato' : 'In sospeso'}\n`;
        }
        if (item.tags.length > 0) {
          mdContent += `> 🏷️ **Tag**: ${item.tags.map(t => '#' + t).join(' ')}\n`;
        }
        mdContent += `\n${item.content}\n\n---\n\n`;
      }

      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `junt-notes-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatusMessage({ text: 'File Markdown esportato con successo.', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: `Errore: ${err.message}`, isError: true });
    }
  };

  // Handle File Upload and Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStatusMessage(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const itemsToImport = Array.isArray(parsed) ? parsed : (parsed.items || []);

      if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
        throw new Error('Nessun elemento valido trovato nel file JSON.');
      }

      const res = await fetch('/api/items/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToImport }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Importazione fallita.');

      setStatusMessage({
        text: `Importati con successo ${data.importedCount} elementi!`,
        isError: false,
      });

      onImportSuccess();
    } catch (err: any) {
      setStatusMessage({
        text: `Errore durante l'importazione: ${err.message}`,
        isError: true,
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-title"
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-modal overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#FBFBFA]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 id="backup-title" className="font-serif font-bold text-lg text-slate-900 leading-tight">
                Import &amp; Export Dati
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Salva o ripristina le tue note e i tuoi task
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi backup"
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto">
          {statusMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Esportazione (Backup)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-100/60 transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2 rounded-xl bg-amber-200 text-amber-900 flex-shrink-0">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-amber-950">Esporta JSON</h5>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    Backup completo con timer e tag
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/80 hover:bg-sky-100/60 transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2 rounded-xl bg-sky-200 text-sky-900 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-sky-950">Esporta Markdown</h5>
                  <p className="text-[11px] text-sky-800/80 mt-0.5">
                    Note leggibili formattate (.md)
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Importazione
            </h4>
            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-300 transition-colors text-center flex flex-col items-center justify-center gap-2 bg-slate-50/50">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
              />
              <div className="p-2.5 rounded-xl bg-white text-slate-700 shadow-2xs border border-slate-200">
                <Upload className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Carica un file di backup (.json)
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Gli elementi verranno uniti o aggiornati localmente
                </p>
              </div>
              <button
                type="button"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {importing ? 'Importazione in corso...' : 'Seleziona file JSON'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-[#FBFBFA] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 font-semibold text-xs text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
