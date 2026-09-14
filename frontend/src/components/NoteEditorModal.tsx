import React, { useState, useEffect } from 'react';
import { Item, PASTEL_COLORS } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
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

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onToggleTimer,
}) => {
  if (!isOpen || !item) return null;

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

  const handleSaveAndClose = () => {
    onSave(item.id, {
      title,
      content,
      color,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isCompleted,
      isPinned,
      isArchived,
      tags,
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentColor = PASTEL_COLORS.find((c) => c.bg === color) || PASTEL_COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        style={{ backgroundColor: color, borderColor: currentColor.border }}
        className="w-full max-w-2xl rounded-3xl border shadow-modal overflow-hidden flex flex-col max-h-[90vh] transition-all"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            {dueDate && (
              <button
                type="button"
                onClick={() => setIsCompleted(!isCompleted)}
                className="text-slate-600 hover:text-slate-900 transition-transform active:scale-95"
                title={isCompleted ? 'Segna come non completato' : 'Segna come completato'}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-6 h-6 hover:text-emerald-600" />
                )}
              </button>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {dueDate ? 'Task' : 'Nota'}
            </span>

            {/* Edit / Preview Tabs */}
            <div className="ml-3 flex items-center bg-black/5 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'edit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Modifica</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Anteprima</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-all ${
                isPinned ? 'text-amber-800 bg-amber-200/80' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
              title={isPinned ? 'In evidenza' : 'Metti in evidenza'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            {/* Archive Toggle */}
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              className={`p-2 rounded-xl transition-all ${
                isArchived ? 'text-blue-800 bg-blue-100' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
              title={isArchived ? 'Estrai da archivio' : 'Archivia'}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
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
            className="w-full font-serif font-bold text-2xl sm:text-3xl text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
          />

          {/* Body: Edit mode vs Markdown Preview mode */}
          {activeTab === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrivi qui i dettagli, elenchi (- [ ] task) o markdown..."
              rows={8}
              className="w-full text-base font-sans text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="min-h-[160px] p-3 rounded-2xl bg-white/60 border border-black/5">
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
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1 bg-black/5 px-2.5 py-1 rounded-lg">
              <Tag className="w-3 h-3 text-slate-400" />
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
                className="w-24 bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Time Tracking Section */}
          <div className="mt-2 p-3.5 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Tempo Tracciato:</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {formatTime(liveDuration)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleTimer(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                item.isTimerRunning
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-300 text-amber-950 hover:bg-amber-400'
              }`}
            >
              {item.isTimerRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Ferma Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Avvia Timer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-black/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Palette Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded-xl transition-all"
                title="Cambia colore"
              >
                <Palette className="w-4 h-4" />
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
                      className="w-6 h-6 rounded-full border shadow-xs hover:scale-110 transition-transform"
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Due date picker */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-black/5 px-2.5 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-xs text-slate-800 focus:outline-none"
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-slate-400 hover:text-red-500"
                  title="Rimuovi data (ritorna Nota)"
                >
                  <X className="w-3.5 h-3.5" />
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
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-black/5 rounded-xl transition-all"
              title="Sposta nel cestino"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Salva e Chiudi</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
