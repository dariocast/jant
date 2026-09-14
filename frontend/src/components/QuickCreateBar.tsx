import React, { useState, useRef, useEffect } from 'react';
import { PASTEL_COLORS } from '../types';
import {
  Calendar,
  Tag,
  Pin,
  Plus,
  CheckSquare,
  X,
  ListTodo,
  Heading,
  Bold,
  Code,
} from 'lucide-react';

interface QuickCreateBarProps {
  onCreate: (item: {
    title: string;
    content: string;
    color: string;
    dueDate: string | null;
    tags: string[];
    isPinned: boolean;
  }) => void;
}

export const QuickCreateBar: React.FC<QuickCreateBarProps> = ({ onCreate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(PASTEL_COLORS[0].bg);
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close when clicking outside if fields are empty
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!title.trim() && !content.trim() && tags.length === 0 && !dueDate) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, content, tags, dueDate]);

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'testo') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 5));
      }
    }, 50);
  };

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) {
      setIsExpanded(false);
      return;
    }

    onCreate({
      title: title.trim() || 'Senza titolo',
      content: content.trim(),
      color,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags,
      isPinned,
    });

    // Reset form
    setTitle('');
    setContent('');
    setColor(PASTEL_COLORS[0].bg);
    setDueDate('');
    setTags([]);
    setTagInput('');
    setIsPinned(false);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentColor = PASTEL_COLORS.find((c) => c.bg === color) || PASTEL_COLORS[0];

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{ backgroundColor: color, borderColor: currentColor.border }}
      className={`w-full max-w-2xl mx-auto rounded-3xl border transition-all duration-300 shadow-soft mb-8 ${
        isExpanded ? 'p-4 sm:p-6 shadow-card ring-2 ring-amber-300/60' : 'p-2 sm:p-3 hover:shadow-card'
      }`}
    >
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between gap-3 cursor-text text-slate-400 px-3 py-1"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-900 flex items-center justify-center font-bold text-sm">
              <Plus className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Scrivi una nota, checklist o imposta un task...
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                const d = new Date(Date.now() + 3600000);
                setDueDate(d.toISOString().slice(0, 16));
              }}
              title="Nuovo Task con Scadenza (T)"
              className="p-2 text-slate-400 hover:text-amber-800 hover:bg-black/5 rounded-xl transition-all"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 bg-black/5 px-2 py-1 rounded-lg">
              ⌘N
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* Header row: Title & Pin */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo della nota..."
              autoFocus
              className="w-full font-serif font-bold text-xl sm:text-2xl text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none tracking-tight"
            />
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-2xl transition-all ${
                isPinned ? 'text-amber-800 bg-amber-200 shadow-xs' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
              title={isPinned ? 'In evidenza' : 'Metti in evidenza'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Markdown Quick Formatting Toolbar */}
          <div className="flex items-center gap-1 py-1 border-y border-black/5 flex-wrap">
            <button
              type="button"
              onClick={() => insertMarkdown('\n- [ ] ')}
              className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 flex items-center gap-1 transition-all"
              title="Inserisci Checklist (- [ ])"
            >
              <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checklist</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('### ')}
              className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 flex items-center gap-1 transition-all"
              title="Intestazione (###)"
            >
              <Heading className="w-3.5 h-3.5 text-blue-600" />
              <span>Titolo</span>
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 flex items-center gap-1 transition-all"
              title="Grassetto (**testo**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 flex items-center gap-1 transition-all"
              title="Codice in linea (`codice`)"
            >
              <Code className="w-3.5 h-3.5 text-purple-600" />
            </button>

            {/* Horizontal Color Palette Selector */}
            <div className="ml-auto flex items-center gap-1.5 pl-2">
              {PASTEL_COLORS.map((c) => {
                const isSelected = color === c.bg;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.bg)}
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      isSelected ? 'ring-2 ring-slate-900 scale-110' : 'hover:scale-110 opacity-80'
                    }`}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi qui dettagli, note o checklist... (Supporta Markdown)"
            rows={3}
            className="w-full text-sm font-sans text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/5 text-slate-700"
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
            </div>
          )}

          {/* Toolbar Row: Date, Tags & Submit */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Due Date (Transforms into Task) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-black/5 px-2.5 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                  title="Imposta data di scadenza"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tag Input */}
              <div className="flex items-center gap-1 text-xs text-slate-700 bg-black/5 px-2.5 py-1 rounded-xl">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
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
                  className="w-24 bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400 font-medium"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Crea nota</span>
                <span className="text-[10px] font-mono opacity-60">⌘↵</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
