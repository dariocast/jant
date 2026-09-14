import { Hono } from 'hono';
import { prisma } from '../db.js';
import { generateEmbedding, bufferToFloat32Array, cosineSimilarity } from '../embeddings.js';

export const searchRouter = new Hono();

// POST /api/search/semantic
searchRouter.post('/semantic', async (c) => {
  const body = await c.req.json();
  const query = body.query || '';
  const limit = Math.min(Number(body.limit || 10), 50);

  if (!query.trim()) {
    return c.json({ success: true, count: 0, results: [] });
  }

  const queryVector = await generateEmbedding(query);
  const items = await prisma.item.findMany({
    where: { isTrashed: false },
  });

  const scored = items.map(item => {
    let similarity = 0;
    if (item.embedding) {
      const itemVec = bufferToFloat32Array(item.embedding);
      similarity = cosineSimilarity(queryVector, itemVec);
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(item.tags || '[]');
    } catch {
      tags = [];
    }

    return {
      id: item.id,
      title: item.title,
      content: item.content,
      color: item.color,
      isPinned: item.isPinned,
      isArchived: item.isArchived,
      dueDate: item.dueDate,
      isCompleted: item.isCompleted,
      tags,
      similarity: Number(similarity.toFixed(4)),
      updatedAt: item.updatedAt,
    };
  });

  // Sort by similarity descending
  scored.sort((a, b) => b.similarity - a.similarity);

  const results = scored.slice(0, limit);

  return c.json({
    success: true,
    query,
    count: results.length,
    results,
  });
});
