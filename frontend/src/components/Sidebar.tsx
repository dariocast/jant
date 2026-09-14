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
  Clock,
  Sparkles,
  Zap,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  selectedTag,
  onSelectTag,
  tags,
  stats,
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
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 py-2 select-none">
      {/* Navigation Links */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentFilter === item.id && !selectedTag;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectFilter(item.id);
                onSelectTag(undefined);
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-100/80 text-amber-950 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-amber-800' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time Tracking Widget Badge */}
      {stats && stats.activeTimersCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/40">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>{stats.activeTimersCount} Timer attivo/i</span>
          </div>
          <p className="text-[11px] text-amber-800/80 font-medium">
            Ore totali tracciate: <strong className="text-amber-950">{stats.totalHoursTracked}h</strong>
          </p>
        </div>
      )}

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Tag & Progetti</span>
            <Tag className="w-3 h-3 text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {tags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? undefined : tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>#{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Pills */}
      <div className="mt-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>FOSS &amp; 100% Locale</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>Transformers.js + SQLite-Vec</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock className="w-3 h-3 text-emerald-500" />
          <span>Time Logging Atomico</span>
        </div>
      </div>
    </aside>
  );
};
