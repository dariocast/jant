import React from 'react';
import { FilterType } from '../types';
import {
  FileText,
  CheckSquare,
  Pin,
  Archive,
  Trash2,
  Layers,
  Tag,
} from 'lucide-react';

interface SidebarProps {
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
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  selectedTag,
  onSelectTag,
  tags,
  stats,
  onCloseMobile,
}) => {
  const navItems: Array<{ id: FilterType; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'all', label: 'Tutti gli elementi', icon: <Layers className="w-4 h-4" /> },
    { id: 'notes', label: 'Note', icon: <FileText className="w-4 h-4" />, count: stats?.notesCount },
    { id: 'tasks', label: 'Task & Scadenze', icon: <CheckSquare className="w-4 h-4" />, count: stats?.pendingTasksCount },
    { id: 'pinned', label: 'In evidenza', icon: <Pin className="w-4 h-4" /> },
    { id: 'archived', label: 'Archivio', icon: <Archive className="w-4 h-4" /> },
    { id: 'trash', label: 'Cestino', icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 py-2 select-none h-full">
      {/* Navigation Links */}
      <nav aria-label="Sezioni" className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentFilter === item.id && !selectedTag;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectFilter(item.id);
                onSelectTag(undefined);
                onCloseMobile?.();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-100/70 text-amber-950 font-semibold border-l-2 border-amber-700 shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className={isActive ? 'text-amber-800' : 'text-stone-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-800 font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Time Tracking Widget Badge */}
      {stats && stats.activeTimersCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>{stats.activeTimersCount} Focus attivo/i</span>
          </div>
          <p className="text-[11px] text-amber-800/80 font-medium">
            Ore tracciate: <strong className="text-amber-950 font-mono">{stats.totalHoursTracked}h</strong>
          </p>
        </div>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold text-stone-600 uppercase tracking-widest font-sans">
            <span>Tag &amp; progetti</span>
            <Tag className="w-3 h-3 text-stone-500" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {tags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    onSelectTag(isSelected ? undefined : tag);
                    onCloseMobile?.();
                  }}
                  aria-pressed={isSelected}
                  className={`text-xs px-2.5 py-2 rounded-lg transition-all font-medium flex items-center gap-1 ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                  }`}
                >
                  <span className="text-amber-700 font-bold">#</span>
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Version Footer at the bottom */}
      <div className="mt-auto pt-6 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-mono text-stone-500 tracking-wider">
        <span>J.U.N.T.</span>
        <span>v0.2.0</span>
      </div>
    </aside>
  );
};
