import React, { useState, useEffect } from 'react';
import { Item, PASTEL_COLORS } from '../types';
import {
  Pin,
  Clock,
  Play,
  Square,
  Archive,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Tag,
  Palette,
  RotateCcw,
} from 'lucide-react';

import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onToggleTimer: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onTrash: (id: string) => void;
  onRestore?: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onUpdateContent?: (id: string, newContent: string) => void;
  isTrashView?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  item,
  onEdit,
  onToggleTimer,
  onToggleComplete,
  onTogglePin,
  onArchive,
  onTrash,
  onRestore,
  onChangeColor,
  onUpdateContent,
  isTrashView = false,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [liveDuration, setLiveDuration] = useState(item.totalDurationSeconds);

  // Live timer interval if timer is actively running
  useEffect(() => {
    setLiveDuration(item.totalDurationSeconds);
    if (!item.isTimerRunning) return;

    const interval = setInterval(() => {
      setLiveDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [item.isTimerRunning, item.totalDurationSeconds]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleMarkdownCheckbox = (lineIndex: number, newChecked: boolean) => {
    if (!onUpdateContent) return;
    const lines = item.content.split('\n');
    if (lineIndex < lines.length) {
      lines[lineIndex] = lines[lineIndex].replace(
        /^(\s*[-*]\s*\[)([ xX])(\]\s*)/,
        `$1${newChecked ? 'x' : ' '}$3`
      );
      onUpdateContent(item.id, lines.join('\n'));
    }
  };

  const currentColor = PASTEL_COLORS.find(c => c.bg.toLowerCase() === item.color.toLowerCase()) || PASTEL_COLORS[0];

  const formattedDueDate = item.dueDate
    ? new Date(item.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.isCompleted;

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between hover:shadow-card hover:-translate-y-0.5 ${
        item.isPinned ? 'ring-2 ring-amber-300/60' : ''
      }`}
      style={{
        backgroundColor: item.color || '#FFFFFF',
        borderColor: currentColor.border || '#E2E8F0',
      }}
    >
      {/* Top action header: Task checkmark, Pin button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {item.isTask && !isTrashView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(item.id, !item.isCompleted);
              }}
              className="text-slate-500 hover:text-slate-800 transition-transform active:scale-90"
              title={item.isCompleted ? 'Segna come non completato' : 'Segna come completato'}
            >
              {item.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-5 h-5 hover:text-emerald-600" />
              )}
            </button>
          )}

          {/* Due date badge */}
          {formattedDueDate && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                item.isCompleted
                  ? 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                  : isOverdue
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white/80 text-slate-700 border-slate-200/80 shadow-xs'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formattedDueDate}</span>
            </span>
          )}
        </div>

        {/* Pin button */}
        {!isTrashView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(item.id, !item.isPinned);
            }}
            className={`p-1.5 rounded-lg transition-all ${
              item.isPinned
                ? 'text-amber-700 bg-amber-200/80'
                : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-black/5 hover:text-slate-700'
            }`}
            title={item.isPinned ? 'Rimuovi evidenza' : 'Metti in evidenza'}
          >
            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Body - Clickable to Open Edit Modal */}
      <div
        onClick={() => onEdit(item)}
        className="cursor-pointer flex-1 flex flex-col gap-1.5"
      >
        {item.title && (
          <h3
            className={`font-serif text-lg font-bold tracking-tight text-slate-900 leading-snug break-words ${
              item.isCompleted ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.title}
          </h3>
        )}

        {item.content && (
          <div className="line-clamp-6 overflow-hidden">
            <MarkdownRenderer
              content={item.content}
              onToggleCheckbox={handleToggleMarkdownCheckbox}
            />
          </div>
        )}
      </div>

      {/* Tags List */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/5 text-slate-700"
            >
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer: Atomic Time Tracker & Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between gap-2 select-none">
        {/* Play/Stop Timer Atomic Button */}
        {!isTrashView ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTimer(item.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
              item.isTimerRunning
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-200'
                : liveDuration > 0
                ? 'bg-amber-100/90 text-amber-900 hover:bg-amber-200/90 border border-amber-300/60'
                : 'bg-white/80 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
            title={item.isTimerRunning ? 'Ferma timer' : 'Avvia timer atomico'}
          >
            {item.isTimerRunning ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span className="font-mono text-[11px] font-semibold">
              {formatTime(liveDuration)}
            </span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(liveDuration)}
          </span>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {isTrashView ? (
            <>
              {onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(item.id)}
                  className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-black/5 rounded-lg transition-all"
                  title="Ripristina dal cestino"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onTrash(item.id)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                title="Elimina definitivamente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* Color picker toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-lg transition-all"
                  title="Cambia colore pastello"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {showColorPicker && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-full left-0 mb-2 p-1.5 bg-white rounded-xl shadow-modal border border-slate-200 grid grid-cols-3 gap-1 z-40"
                  >
                    {PASTEL_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          onChangeColor(item.id, c.bg);
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

              {/* Archive button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(item.id, !item.isArchived);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 rounded-lg transition-all"
                title={item.isArchived ? 'Estrai da archivio' : 'Archivia'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              {/* Move to Trash */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrash(item.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-black/5 rounded-lg transition-all"
                title="Sposta nel cestino"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
