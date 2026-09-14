import { Context } from 'hono';
import { prisma } from './db.js';
import { generateEmbedding, float32ArrayToBuffer, bufferToFloat32Array, cosineSimilarity } from './embeddings.js';

export interface MCPRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

const MCP_TOOLS = [
  {
    name: 'list_items',
    description: 'List notes and tasks from JANT database with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'notes', 'tasks', 'pinned', 'archived', 'trash'],
          description: 'Filter type: all, notes (no dueDate), tasks (has dueDate), pinned, archived, or trash.',
        },
        tag: {
          type: 'string',
          description: 'Filter by specific tag.',
        },
        search: {
          type: 'string',
          description: 'Filter by keyword in title or content.',
        },
      },
    },
  },
  {
    name: 'get_item',
    description: 'Get details of a specific note or task by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_item',
    description: 'Create a new note or task in JANT.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the note or task' },
        content: { type: 'string', description: 'Content/body of the item (markdown supported)' },
        color: { type: 'string', description: 'Pastel background color hex code, e.g. #FEF3C7, #E0F2FE' },
        dueDate: { type: 'string', description: 'ISO date string. Setting this turns the item into a Task.' },
        tags: { type: 'array', items: { type: 'string' }, description: 'List of tags' },
        isPinned: { type: 'boolean', description: 'Pin the item to top' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_item',
    description: 'Update an existing note or task in JANT.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item ID' },
        title: { type: 'string' },
        content: { type: 'string' },
        color: { type: 'string' },
        dueDate: { type: 'string', description: 'ISO date string or null to remove task status' },
        isCompleted: { type: 'boolean', description: 'Mark task completed or uncompleted' },
        isPinned: { type: 'boolean' },
        isArchived: { type: 'boolean' },
        isTrashed: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_item',
    description: 'Delete an item permanently or move to trash.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item ID' },
        permanent: { type: 'boolean', description: 'If true, permanently delete. If false, move to trash.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'toggle_timer',
    description: 'Start or stop time tracking for a specific note/task.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Item ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'semantic_search',
    description: 'Search notes and tasks using AI embeddings and vector similarity.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language search query' },
        limit: { type: 'number', description: 'Maximum number of results to return (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_productivity_stats',
    description: 'Get productivity statistics: notes count, tasks count, completed tasks, total time spent.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleMCPCall(body: MCPRequest): Promise<MCPResponse> {
  const id = body.id !== undefined ? body.id : null;
  const method = body.method;
  const params = body.params || {};

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'jant-mcp-server',
              version: '0.1.0',
            },
            capabilities: {
              tools: { listChanged: false },
              resources: { subscribe: false, listChanged: false },
            },
          },
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: MCP_TOOLS,
          },
        };

      case 'tools/call': {
        const toolName = params.name;
        const args = params.arguments || {};
        const toolResult = await executeTool(toolName, args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          },
        };
      }

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: [
              {
                uri: 'jant://items/all',
                name: 'All active items',
                mimeType: 'application/json',
              },
            ],
          },
        };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method '${method}' not found`,
          },
        };
    }
  } catch (err: any) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: err.message || 'Internal MCP Server error',
      },
    };
  }
}

async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'list_items': {
      const { filter = 'all', tag, search } = args;
      const where: any = { isTrashed: false, isArchived: false };

      if (filter === 'trash') {
        where.isTrashed = true;
        delete where.isArchived;
      } else if (filter === 'archived') {
        where.isArchived = true;
      } else if (filter === 'notes') {
        where.dueDate = null;
      } else if (filter === 'tasks') {
        where.dueDate = { not: null };
      } else if (filter === 'pinned') {
        where.isPinned = true;
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

      let results = items.map(item => ({
        ...item,
        timeLogs: JSON.parse(item.timeLogs || '[]'),
        tags: JSON.parse(item.tags || '[]'),
        embedding: undefined,
      }));

      if (tag) {
        results = results.filter(i => i.tags.includes(tag));
      }

      return { count: results.length, items: results };
    }

    case 'get_item': {
      const item = await prisma.item.findUnique({
        where: { id: args.id },
      });
      if (!item) throw new Error(`Item with id ${args.id} not found`);
      return {
        ...item,
        timeLogs: JSON.parse(item.timeLogs || '[]'),
        tags: JSON.parse(item.tags || '[]'),
        embedding: undefined,
      };
    }

    case 'create_item': {
      const { title, content = '', color = '#FFFFFF', dueDate, tags = [], isPinned = false } = args;
      const embeddingVector = await generateEmbedding(`${title}\n${content}`);
      const embeddingBuf = float32ArrayToBuffer(embeddingVector);

      const item = await prisma.item.create({
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

      return {
        success: true,
        item: {
          ...item,
          timeLogs: [],
          tags,
          embedding: undefined,
        },
      };
    }

    case 'update_item': {
      const { id, title, content, color, dueDate, isCompleted, isPinned, isArchived, isTrashed, tags } = args;
      const data: any = {};
      if (title !== undefined) data.title = title;
      if (content !== undefined) data.content = content;
      if (color !== undefined) data.color = color;
      if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
      if (isCompleted !== undefined) data.isCompleted = Boolean(isCompleted);
      if (isPinned !== undefined) data.isPinned = Boolean(isPinned);
      if (isArchived !== undefined) data.isArchived = Boolean(isArchived);
      if (isTrashed !== undefined) data.isTrashed = Boolean(isTrashed);
      if (tags !== undefined) data.tags = JSON.stringify(tags);

      // If title or content changed, regenerate embedding
      if (title !== undefined || content !== undefined) {
        const existing = await prisma.item.findUnique({ where: { id } });
        const newTitle = title !== undefined ? title : existing?.title || '';
        const newContent = content !== undefined ? content : existing?.content || '';
        const vec = await generateEmbedding(`${newTitle}\n${newContent}`);
        data.embedding = float32ArrayToBuffer(vec);
      }

      const item = await prisma.item.update({
        where: { id },
        data,
      });

      return {
        success: true,
        item: {
          ...item,
          timeLogs: JSON.parse(item.timeLogs || '[]'),
          tags: JSON.parse(item.tags || '[]'),
          embedding: undefined,
        },
      };
    }

    case 'delete_item': {
      const { id, permanent = false } = args;
      if (permanent) {
        await prisma.item.delete({ where: { id } });
        return { success: true, message: `Item ${id} permanently deleted` };
      } else {
        await prisma.item.update({
          where: { id },
          data: { isTrashed: true },
        });
        return { success: true, message: `Item ${id} moved to trash` };
      }
    }

    case 'toggle_timer': {
      const item = await prisma.item.findUnique({ where: { id: args.id } });
      if (!item) throw new Error(`Item ${args.id} not found`);

      const logs: Array<{ start: string; end: string | null }> = JSON.parse(item.timeLogs || '[]');
      const activeLogIndex = logs.findIndex(l => !l.end);

      let isNowRunning = false;
      if (activeLogIndex >= 0) {
        // Stop the active timer
        logs[activeLogIndex].end = new Date().toISOString();
        isNowRunning = false;
      } else {
        // Start a new timer log
        logs.push({
          start: new Date().toISOString(),
          end: null,
        });
        isNowRunning = true;
      }

      const updated = await prisma.item.update({
        where: { id: args.id },
        data: { timeLogs: JSON.stringify(logs) },
      });

      return {
        success: true,
        isTimerRunning: isNowRunning,
        timeLogs: logs,
      };
    }

    case 'semantic_search': {
      const { query, limit = 5 } = args;
      const queryVec = await generateEmbedding(query);
      const items = await prisma.item.findMany({
        where: { isTrashed: false },
      });

      const scored = items.map(item => {
        let similarity = 0;
        if (item.embedding) {
          const itemVec = bufferToFloat32Array(item.embedding);
          similarity = cosineSimilarity(queryVec, itemVec);
        }
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          dueDate: item.dueDate,
          isCompleted: item.isCompleted,
          color: item.color,
          tags: JSON.parse(item.tags || '[]'),
          similarity: Number(similarity.toFixed(4)),
        };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      return {
        query,
        count: scored.slice(0, limit).length,
        results: scored.slice(0, limit),
      };
    }

    case 'get_productivity_stats': {
      const allItems = await prisma.item.findMany({
        where: { isTrashed: false },
      });

      const notesCount = allItems.filter(i => !i.dueDate && !i.isArchived).length;
      const tasks = allItems.filter(i => i.dueDate && !i.isArchived);
      const tasksCount = tasks.length;
      const completedTasksCount = tasks.filter(t => t.isCompleted).length;
      const archivedCount = allItems.filter(i => i.isArchived).length;

      let totalSecondsTracked = 0;
      let activeTimersCount = 0;

      for (const item of allItems) {
        const logs: Array<{ start: string; end: string | null }> = JSON.parse(item.timeLogs || '[]');
        for (const log of logs) {
          const start = new Date(log.start).getTime();
          if (log.end) {
            const end = new Date(log.end).getTime();
            totalSecondsTracked += Math.max(0, Math.floor((end - start) / 1000));
          } else {
            activeTimersCount++;
            const now = Date.now();
            totalSecondsTracked += Math.max(0, Math.floor((now - start) / 1000));
          }
        }
      }

      return {
        notesCount,
        tasksCount,
        completedTasksCount,
        archivedCount,
        totalItems: allItems.length,
        activeTimersCount,
        totalSecondsTracked,
        totalHoursTracked: Number((totalSecondsTracked / 3600).toFixed(2)),
      };
    }

    default:
      throw new Error(`Tool '${name}' not implemented`);
  }
}
