import { Hono } from 'hono';
import { prisma } from '../db.js';
import { generateEmbedding, float32ArrayToBuffer } from '../embeddings.js';

export const itemsRouter = new Hono();

// Helper to format item response (parse json fields)
function formatItem(item: any) {
  let activeTimer = false;
  let totalDurationSeconds = 0;
  let timeLogs: Array<{ start: string; end: string | null }> = [];
  try {
    timeLogs = JSON.parse(item.timeLogs || '[]');
    for (const log of timeLogs) {
      const start = new Date(log.start).getTime();
      if (!log.end) {
        activeTimer = true;
        totalDurationSeconds += Math.max(0, Math.floor((Date.now() - start) / 1000));
      } else {
        const end = new Date(log.end).getTime();
        totalDurationSeconds += Math.max(0, Math.floor((end - start) / 1000));
      }
    }
  } catch (e) {
    timeLogs = [];
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(item.tags || '[]');
  } catch (e) {
    tags = [];
  }

  return {
    ...item,
    tags,
    timeLogs,
    isTimerRunning: activeTimer,
    totalDurationSeconds,
    isTask: item.dueDate !== null,
    embedding: undefined, // exclude raw vector from normal API output
  };
}

// GET /api/items
itemsRouter.get('/', async (c) => {
  const filter = c.req.query('filter') || 'all'; // all, notes, tasks, pinned, archived, trash
  const tag = c.req.query('tag');
  const search = c.req.query('search');

  const where: any = {};

  if (filter === 'trash') {
    where.isTrashed = true;
  } else if (filter === 'archived') {
    where.isArchived = true;
    where.isTrashed = false;
  } else {
    where.isTrashed = false;
    where.isArchived = false;

    if (filter === 'notes') {
      where.dueDate = null;
    } else if (filter === 'tasks') {
      where.dueDate = { not: null };
    } else if (filter === 'pinned') {
      where.isPinned = true;
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });

  let formatted = items.map(formatItem);
  if (tag) {
    formatted = formatted.filter(i => i.tags.includes(tag));
  }

  return c.json({
    success: true,
    count: formatted.length,
    items: formatted,
  });
});

// GET /api/items/:id
itemsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return c.json({ success: false, error: 'Item not found' }, 404);
  }
  return c.json({ success: true, item: formatItem(item) });
});

// POST /api/items
itemsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const {
    title = '',
    content = '',
    color = '#FFFFFF',
    dueDate = null,
    tags = [],
    isPinned = false,
  } = body;

  const embeddingVector = await generateEmbedding(`${title}\n${content}`);
  const embeddingBuf = float32ArrayToBuffer(embeddingVector);

  const newItem = await prisma.item.create({
    data: {
      title,
      content,
      color,
      dueDate: dueDate ? new Date(dueDate) : null,
      isPinned: Boolean(isPinned),
      tags: JSON.stringify(tags),
      timeLogs: '[]',
      embedding: embeddingBuf,
    },
  });

  return c.json({ success: true, item: formatItem(newItem) }, 201);
});

// PUT /api/items/:id
itemsRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.content !== undefined) data.content = body.content;
  if (body.color !== undefined) data.color = body.color;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.isCompleted !== undefined) data.isCompleted = Boolean(body.isCompleted);
  if (body.isPinned !== undefined) data.isPinned = Boolean(body.isPinned);
  if (body.isArchived !== undefined) data.isArchived = Boolean(body.isArchived);
  if (body.isTrashed !== undefined) data.isTrashed = Boolean(body.isTrashed);
  if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);

  if (body.title !== undefined || body.content !== undefined) {
    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) return c.json({ success: false, error: 'Item not found' }, 404);
    const newTitle = body.title !== undefined ? body.title : existing.title;
    const newContent = body.content !== undefined ? body.content : existing.content;
    const vec = await generateEmbedding(`${newTitle}\n${newContent}`);
    data.embedding = float32ArrayToBuffer(vec);
  }

  const updated = await prisma.item.update({
    where: { id },
    data,
  });

  return c.json({ success: true, item: formatItem(updated) });
});

// DELETE /api/items/:id
itemsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const permanent = c.req.query('permanent') === 'true';

  if (permanent) {
    await prisma.item.delete({ where: { id } });
    return c.json({ success: true, message: 'Item permanently deleted' });
  } else {
    const updated = await prisma.item.update({
      where: { id },
      data: { isTrashed: true },
    });
    return c.json({ success: true, item: formatItem(updated) });
  }
});

// POST /api/items/:id/restore (from trash)
itemsRouter.post('/:id/restore', async (c) => {
  const id = c.req.param('id');
  const updated = await prisma.item.update({
    where: { id },
    data: { isTrashed: false, isArchived: false },
  });
  return c.json({ success: true, item: formatItem(updated) });
});

// POST /api/items/:id/timer/toggle
itemsRouter.post('/:id/timer/toggle', async (c) => {
  const id = c.req.param('id');
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) return c.json({ success: false, error: 'Item not found' }, 404);

  let logs: Array<{ start: string; end: string | null }> = [];
  try {
    logs = JSON.parse(item.timeLogs || '[]');
  } catch (e) {
    logs = [];
  }

  const activeIndex = logs.findIndex(l => !l.end);
  let isNowRunning = false;

  if (activeIndex >= 0) {
    logs[activeIndex].end = new Date().toISOString();
    isNowRunning = false;
  } else {
    logs.push({
      start: new Date().toISOString(),
      end: null,
    });
    isNowRunning = true;
  }

  const updated = await prisma.item.update({
    where: { id },
    data: { timeLogs: JSON.stringify(logs) },
  });

  return c.json({
    success: true,
    isTimerRunning: isNowRunning,
    item: formatItem(updated),
  });
});
