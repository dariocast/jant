import React, { useState, useEffect, useRef } from 'react';
import { Item, PASTEL_COLORS } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useDialog } from '../hooks/useDialog';
import {
  X,
  Pin,
  Calendar,
  Tag,
  Palette,
  Archive,
  Trash2,
  Play,
  Square,
  Clock,
  CheckCircle2,
  Circle,
  Check,
  Eye,
  Edit3,
} from 'lucide-react';

interface NoteEditorModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
  onToggleTimer: (id: string) => void;
}

/**
 * Guardia di montaggio: il contenuto con i propri hook vive in un
 * componente separato, così gli hook non vengono mai saltati.
 */
export const NoteEditorModal: React.FC<NoteEditorModalProps> = (props) => {
  if (!props.isOpen || !props.item) return null;
  return <NoteEditorModalContent {...props} item={props.item} />;
};

const NoteEditorModalContent: React.FC<NoteEditorModalProps & { item: Item }> = ({
  item,
  onClose,
  onSave,
  onDelete,
  onToggleTimer,
}) => {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [color, setColor] = useState(item.color);
  const [dueDate, setDueDate] = useState(item.dueDate ? item.dueDate.slice(0, 16) : '');
  const [isCompleted, setIsCompleted] = useState(item.isCompleted);
  const [isPinned, setIsPinned] = useState(item.isPinned);
  const [isArchived, setIsArchived] = useState(item.isArchived);
  const [tags, setTags] = useState<string[]>(item.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [liveDuration, setLiveDuration] = useState(item.totalDurationSeconds);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const containerRef = useDialog(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  // Lo stato corrente serve ai listener globali senza riagganciarli a ogni tasto.
  const latest = useRef({ title, content, color, dueDate, isCompleted, isPinned, isArchived, tags });
  latest.current = { title, content, color, dueDate, isCompleted, isPinned, isArchived, tags };

  useEffect(() => {
    setTitle(item.title);
    setContent(item.content);
    setColor(item.color);
    setDueDate(item.dueDate ? item.dueDate.slice(0, 16) : '');
    setIsCompleted(item.isCompleted);
    setIsPinned(item.isPinned);
    setIsArchived(item.isArchived);
    setTags(item.tags || []);
    setLiveDuration(item.totalDurationSeconds);
  }, [item]);

  // Live timer interval
  useEffect(() => {
    setLiveDuration(item.totalDurationSeconds);
    if (!item.isTimerRunning) return;

    const interval = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [item.isTimerRunning, item.totalDurationSeconds]);

  // Esc chiude salvando, come la X e il clic sullo sfondo: nessuna
  // scorciatoia deve far perdere silenziosamente ciò che si è scritto.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (showColorPicker) {
        setShowColorPicker(false);
        return;
      }
      saveAndClose();
    };
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [showColorPicker]);

  // Chiude la palette al clic fuori
  useEffect(() => {
    if (!showColorPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const saveAndClose = () => {
    const s = latest.current;
    onSave(item.id, {
      title: s.title,
      content: s.content,
      color: s.color,
      dueDate: s.dueDate ? new Date(s.dueDate).toISOString() : null,
      isCompleted: s.isCompleted,
      isPinned: s.isPinned,
      isArchived: s.isArchived,
      tags: s.tags,
    });
    onClose();
  };

  const handleTogglePreviewCheckbox = (lineIndex: number, newChecked: boolean) => {
    const lines = content.split('\n');
    if (lineIndex < lines.length) {
      lines[lineIndex] = lines[lineIndex].replace(
        /^(\s*[-*]\s*\[)([ xX])(\]\s*)/,
        `$1${newChecked ? 'x' : ' '}$3`
      );
      setContent(lines.join('\n'));
    }
  };

  /** Inserisce markdown attorno alla selezione corrente della textarea. */
  const insertMarkdown = (prefix: string, suffix = '', placeholder = 'testo') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const body = selected || placeholder;
    const next = content.substring(0, start) + prefix + body + suffix + content.substring(end);
    setContent(next);
    // Riporta il cursore sul testo inserito dopo il re-render.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + body.length);
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentColor = PASTEL_COLORS.find((c) => c.bg === color) || PASTEL_COLORS[0];

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveAndClose();
    }
  };

  const isTask = Boolean(dueDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      onMouseDown={(e) => {
        // Solo un clic iniziato sullo sfondo chiude: evita chiusure accidentali
        // quando si trascina una selezione di testo fuori dal riquadro.
        if (e.target === e.currentTarget) saveAndClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? `Modifica: ${title}` : 'Modifica elemento'}
        onKeyDown={handleModalKeyDown}
        style={{ backgroundColor: color, borderColor: currentColor.border }}
        className="w-full max-w-2xl rounded-3xl border shadow-modal overflow-hidden flex flex-col max-h-[90vh] transition-all"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isTask && (
              <button
                type="button"
                onClick={() => setIsCompleted(!isCompleted)}
                className="text-slate-600 hover:text-slate-900 transition-transform active:scale-95 shrink-0"
                aria-pressed={isCompleted}
                aria-label={isCompleted ? 'Segna come non completato' : 'Segna come completato'}
                title={isCompleted ? 'Segna come non completato' : 'Segna come completato'}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" aria-hidden="true" />
                ) : (
                  <Circle className="w-6 h-6 hover:text-emerald-600" aria-hidden="true" />
                )}
              </button>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0">
              {isTask ? 'Task' : 'Nota'}
            </span>

            {/* Edit / Preview Tabs */}
            <div
              role="tablist"
              aria-label="Modalità di visualizzazione"
              className="ml-1 sm:ml-3 flex items-center bg-black/5 rounded-lg p-0.5 text-xs font-semibold"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'edit'}
                onClick={() => setActiveTab('edit')}
                className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'edit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" aria-hidden="true" />
                <span>Modifica</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'preview'}
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" aria-hidden="true" />
                <span>Anteprima</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              aria-pressed={isPinned}
              aria-label={isPinned ? 'Rimuovi dall\'evidenza' : 'Metti in evidenza'}
              className={`p-2.5 rounded-xl transition-all ${
                isPinned ? 'text-amber-800 bg-amber-200/80' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
              }`}
              title={isPinned ? 'In evidenza' : 'Metti in evidenza'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>

            {/* Archive Toggle */}
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              aria-pressed={isArchived}
              aria-label={isArchived ? 'Estrai da archivio' : 'Archivia'}
              className={`p-2.5 rounded-xl transition-all ${
                isArchived ? 'text-blue-800 bg-blue-100' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
              }`}
              title={isArchived ? 'Estrai da archivio' : 'Archivia'}
            >
              <Archive className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={saveAndClose}
              aria-label="Salva e chiudi"
              title="Salva e chiudi (Esc)"
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-black/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            aria-label="Titolo"
            className="w-full font-serif font-bold text-2xl sm:text-3xl text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
          />

          {/* Body: Edit mode vs Markdown Preview mode */}
          {activeTab === 'edit' ? (
            <div className="flex flex-col gap-2">
              {/* Markdown Helper Bar */}
              <div className="flex items-center gap-1 py-1 px-1 bg-black/5 rounded-xl flex-wrap text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdown('\n- [ ] ', '', 'task')}
                  className="px-2.5 py-1.5 font-semibold rounded-lg text-slate-700 hover:bg-white hover:shadow-2xs transition-all"
                  title="Aggiungi elemento checklist"
                >
                  ☑ Checklist
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('### ', '', 'Intestazione')}
                  className="px-2.5 py-1.5 font-semibold rounded-lg text-slate-700 hover:bg-white hover:shadow-2xs transition-all"
                  title="Intestazione H3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**', 'grassetto')}
                  className="px-2.5 py-1.5 font-bold rounded-lg text-slate-700 hover:bg-white hover:shadow-2xs transition-all"
                  title="Grassetto"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*', 'corsivo')}
                  className="px-2.5 py-1.5 italic font-serif rounded-lg text-slate-700 hover:bg-white hover:shadow-2xs transition-all"
                  title="Corsivo"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`', 'codice')}
                  className="px-2.5 py-1.5 font-mono rounded-lg text-slate-700 hover:bg-white hover:shadow-2xs transition-all"
                  title="Codice inline"
                >
                  &lt;/&gt;
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Scrivi qui i dettagli, elenchi (- [ ] task) o markdown... (Salva con ⌘ + Invio)"
                aria-label="Contenuto della nota"
                rows={8}
                className="w-full text-base font-sans text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          ) : (
            <div className="min-h-[160px] p-4 rounded-2xl bg-white/70 border border-black/5 shadow-2xs">
              <MarkdownRenderer
                content={content || '*Nessun contenuto inserito.*'}
                onToggleCheckbox={handleTogglePreviewCheckbox}
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 text-slate-700"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Rimuovi tag ${tag}`}
                  className="p-1 -m-0.5 rounded hover:text-red-600"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1 bg-black/5 px-2.5 py-1 rounded-lg">
              <Tag className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Aggiungi tag..."
                aria-label="Aggiungi tag"
                className="w-24 bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="mt-2 p-3.5 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700">Tempo tracciato:</span>
              <span className="font-mono text-sm font-bold text-slate-900" aria-live="off">
                {formatTime(liveDuration)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleTimer(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                item.isTimerRunning
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-300 text-amber-950 hover:bg-amber-400'
              }`}
            >
              {item.isTimerRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Ferma timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Avvia timer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-black/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Palette Selector */}
            <div className="relative" ref={colorPickerRef}>
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                aria-expanded={showColorPicker}
                aria-label="Cambia colore"
                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded-xl transition-all"
                title="Cambia colore"
              >
                <Palette className="w-4 h-4" aria-hidden="true" />
              </button>
              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-2xl shadow-modal border border-slate-200 grid grid-cols-5 gap-1.5 z-50">
                  {PASTEL_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setColor(c.bg);
                        setShowColorPicker(false);
                      }}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      className="w-7 h-7 rounded-full border shadow-xs hover:scale-110 transition-transform"
                      aria-label={`Colore ${c.name}`}
                      aria-pressed={color === c.bg}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Due date picker */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-black/5 px-2.5 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Data di scadenza (trasforma la nota in task)"
                className="bg-transparent text-xs text-slate-800 focus:outline-none"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="p-1 text-slate-500 hover:text-red-600"
                  aria-label="Rimuovi data di scadenza"
                  title="Rimuovi data (torna a Nota)"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Trash button */}
            <button
              type="button"
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="p-2.5 text-slate-500 hover:text-rose-700 hover:bg-black/5 rounded-xl transition-all"
              aria-label="Sposta nel cestino"
              title="Sposta nel cestino"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={saveAndClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Salva e chiudi</span>
            <Check className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
