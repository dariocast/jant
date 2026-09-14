export interface TimeLog {
  start: string;
  end: string | null;
}

export interface Item {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  dueDate: string | null;
  isCompleted: boolean;
  timeLogs: TimeLog[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isTimerRunning: boolean;
  totalDurationSeconds: number;
  isTask: boolean;
}

export interface SemanticSearchResult {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  dueDate: string | null;
  isCompleted: boolean;
  tags: string[];
  similarity: number;
  updatedAt: string;
}

export interface StatsData {
  totalItems: number;
  notesCount: number;
  tasksCount: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  archivedCount: number;
  activeTimersCount: number;
  totalSecondsTracked: number;
  totalHoursTracked: number;
  tagCounts: Record<string, number>;
}

export type FilterType = 'all' | 'notes' | 'tasks' | 'pinned' | 'archived' | 'trash';

export const PASTEL_COLORS = [
  { name: 'Default', bg: '#FFFFFF', border: '#E2E8F0', text: '#0F172A' },
  { name: 'Amber', bg: '#FEF3C7', border: '#FDE68A', text: '#78350F' },
  { name: 'Sage', bg: '#DCFCE7', border: '#BBF7D0', text: '#14532D' },
  { name: 'Sky', bg: '#E0F2FE', border: '#BAE6FD', text: '#0C4A6E' },
  { name: 'Lavender', bg: '#F3E8FF', border: '#E9D5FF', text: '#581C87' },
  { name: 'Rose', bg: '#FFE4E6', border: '#FECDD3', text: '#881337' },
  { name: 'Peach', bg: '#FFEDD5', border: '#FED7AA', text: '#7C2D12' },
  { name: 'Mint', bg: '#CCFBF1', border: '#99F6E4', text: '#134E4A' },
  { name: 'Cream', bg: '#FFFDF5', border: '#FEF08A', text: '#713F12' },
];
