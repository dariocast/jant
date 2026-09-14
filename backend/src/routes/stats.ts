import { Hono } from 'hono';
import { prisma } from '../db.js';

export const statsRouter = new Hono();

// GET /api/stats
statsRouter.get('/', async (c) => {
  const allItems = await prisma.item.findMany({
    where: { isTrashed: false },
  });

  const notes = allItems.filter(i => !i.dueDate && !i.isArchived);
  const tasks = allItems.filter(i => i.dueDate && !i.isArchived);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const archived = allItems.filter(i => i.isArchived);

  let totalSeconds = 0;
  let activeTimers = 0;

  for (const item of allItems) {
    try {
      const logs: Array<{ start: string; end: string | null }> = JSON.parse(item.timeLogs || '[]');
      for (const log of logs) {
        const start = new Date(log.start).getTime();
        if (log.end) {
          const end = new Date(log.end).getTime();
          totalSeconds += Math.max(0, Math.floor((end - start) / 1000));
        } else {
          activeTimers++;
          const now = Date.now();
          totalSeconds += Math.max(0, Math.floor((now - start) / 1000));
        }
      }
    } catch {}
  }

  // Get all unique tags and their count
  const tagCounts: Record<string, number> = {};
  for (const item of allItems) {
    if (item.isArchived) continue;
    try {
      const tags: string[] = JSON.parse(item.tags || '[]');
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    } catch {}
  }

  return c.json({
    success: true,
    version: '0.1.0',
    stats: {
      totalItems: allItems.length,
      notesCount: notes.length,
      tasksCount: tasks.length,
      completedTasksCount: completedTasks.length,
      pendingTasksCount: tasks.length - completedTasks.length,
      archivedCount: archived.length,
      activeTimersCount: activeTimers,
      totalSecondsTracked: totalSeconds,
      totalHoursTracked: Number((totalSeconds / 3600).toFixed(2)),
      tagCounts,
    },
  });
});
