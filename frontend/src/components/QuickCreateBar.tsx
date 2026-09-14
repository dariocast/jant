import React, { useState, useRef, useEffect } from 'react';
import { PASTEL_COLORS } from '../types';
import {
  Calendar,
  Tag,
  Palette,
  Pin,
  Plus,
  CheckSquare,
  Sparkles,
  X,
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
  const [showColorPicker, setShowColorPicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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

  const currentColor = PASTEL_COLORS.find((c) => c.bg === color) || PASTEL_COLORS[0];

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: color, borderColor: currentColor.border }}
      className={`w-full max-w-2xl mx-auto rounded-2xl border transition-all duration-300 shadow-soft mb-8 ${
        isExpanded ? 'p-4 sm:p-5 shadow-card ring-2 ring-amber-200/50' : 'p-2 sm:p-3'
      }`}
    >
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between gap-3 cursor-text text-slate-400 px-3 py-1"
        >
          <span className="text-sm font-medium">
            Prendi una nota, annota un'idea o imposta una scadenza...
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                // set current time + 1 hour as default task
                const d = new Date(Date.now() + 3600000);
                setDueDate(d.toISOString().slice(0, 16));
              }}
              title="Nuovo Task con Scadenza"
              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-black/5 rounded-xl transition-all"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header row: Title & Pin */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo"
              autoFocus
              className="w-full font-serif font-bold text-lg sm:text-xl text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-xl transition-all ${
                isPinned ? 'text-amber-700 bg-amber-200/80' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
              }`}
              title={isPinned ? 'In evidenza' : 'Metti in evidenza'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Content Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrivi qui i dettagli, note o checklist (markdown supportato)..."
            rows={3}
            className="w-full text-sm font-sans text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-black/5 text-slate-700"
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

          {/* Toolbar Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl transition-all"
                  title="Scegli colore pastello"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-white rounded-xl shadow-modal border border-slate-200 grid grid-cols-5 gap-1 z-50">
                    {PASTEL_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setColor(c.bg);
                          setShowColorPicker(false);
                        }}
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                        className="w-5 h-5 rounded-full border shadow-xs hover:scale-110 transition-transform"
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Due Date (Transforms into Task) */}
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-black/5 px-2 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none"
                  title="Imposta data di scadenza (trasforma in Task)"
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
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-black/5 px-2 py-1 rounded-xl">
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
                  className="w-24 bg-transparent text-xs text-slate-700 focus:outline-none placeholder-slate-400"
                />
                {tagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800"
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
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <span>Crea</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
