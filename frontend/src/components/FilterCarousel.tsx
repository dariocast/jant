import React, { useRef } from 'react';
import { FilterType } from '../types';
import {
  Layers,
  FileText,
  CheckSquare,
  Pin,
  Archive,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface FilterCarouselProps {
  currentFilter: FilterType;
  onSelectFilter: (f: FilterType) => void;
  selectedTag?: string;
  onSelectTag: (tag?: string) => void;
  tags: string[];
  stats?: {
    notesCount: number;
    tasksCount: number;
    pendingTasksCount: number;
    activeTimersCount: number;
    totalHoursTracked: number;
  };
}

export const FilterCarousel: React.FC<FilterCarouselProps> = ({
  currentFilter,
  onSelectFilter,
  selectedTag,
  onSelectTag,
  tags,
  stats,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const navFilters: Array<{
    id: FilterType;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeColor?: string;
  }> = [
    { id: 'all', label: 'Tutte', icon: <Layers className="w-3.5 h-3.5" />, count: stats ? stats.notesCount + stats.tasksCount : undefined },
    { id: 'notes', label: 'Note', icon: <FileText className="w-3.5 h-3.5" />, count: stats?.notesCount },
    { id: 'tasks', label: 'Task', icon: <CheckSquare className="w-3.5 h-3.5" />, count: stats?.pendingTasksCount },
    { id: 'pinned', label: 'In evidenza', icon: <Pin className="w-3.5 h-3.5" /> },
    { id: 'archived', label: 'Archivio', icon: <Archive className="w-3.5 h-3.5" /> },
    { id: 'trash', label: 'Cestino', icon: <Trash2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto mb-6 px-1 select-none flex items-center group">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 shrink-0 mr-1.5 transition-all opacity-0 group-hover:opacity-100"
        title="Scorri a sinistra"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Scrolling Pill Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Core Filter Pills */}
        {navFilters.map((item) => {
          const isActive = currentFilter === item.id && !selectedTag;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectFilter(item.id);
                onSelectTag(undefined);
              }}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white/90 hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className={isActive ? 'text-amber-300' : 'text-slate-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Active Timers Badge Pill (if any) */}
        {stats && stats.activeTimersCount > 0 && (
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/80 shadow-xs animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{stats.activeTimersCount} Focus in corso</span>
          </div>
        )}

        {/* Separator if tags exist */}
        {tags.length > 0 && (
          <div className="w-px h-5 bg-slate-200 shrink-0 mx-1" />
        )}

        {/* Dynamic Tag Pills */}
        {tags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(isSelected ? undefined : tag)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-300/30'
                  : 'bg-white/90 hover:bg-slate-100 text-slate-700 border border-slate-200/90'
              }`}
            >
              <span className="text-amber-700 font-bold">#</span>
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 shrink-0 ml-1.5 transition-all opacity-0 group-hover:opacity-100"
        title="Scorri a destra"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
