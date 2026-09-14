import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDb } from './db.js';
import { handleMCPCall } from './mcp.js';
import { itemsRouter } from './routes/items.js';
import { searchRouter } from './routes/search.js';
import { statsRouter } from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();
const VERSION = '0.1.0';

// Middlewares
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API Metadata & Health
app.get('/api/info', (c) => {
  return c.json({
    name: 'J.A.N.T. Backend',
    description: 'Just Another Notes & Tasks API & MCP Server',
    version: VERSION,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      unifiedEntity: true,
      timeTracking: true,
      vectorEmbeddings: true,
      mcpServer: true,
    },
  });
});

// REST Routes
app.route('/api/items', itemsRouter);
app.route('/api/search', searchRouter);
app.route('/api/stats', statsRouter);

// Model Context Protocol (MCP) Endpoints
app.post('/mcp', async (c) => {
  const body = await c.req.json();
  const response = await handleMCPCall(body);
  return c.json(response);
});

// MCP SSE Endpoint (stream notifications or keepalive)
app.get('/mcp/sse', (c) => {
  return c.text(`event: endpoint\ndata: /mcp\n\n`, 200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
});

// Serve frontend static build if available
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use('/*', serveStatic({ root: path.relative(process.cwd(), frontendDistPath) }));
  
  // SPA Fallback to index.html for non-API routes
  app.get('*', (c) => {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      return c.html(html);
    }
    return c.text('JANT API running (Frontend not yet built)', 200);
  });
} else {
  app.get('/', (c) => {
    return c.json({
      app: 'J.A.N.T. API',
      version: VERSION,
      docs: '/api/info',
      mcp: '/mcp',
      frontend: 'Development mode / run frontend dev server on port 5173',
    });
  });
}

// Global error handler
app.onError((err, c) => {
  console.error('[App Error]', err);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error',
  }, 500);
});

// Start server
const port = Number(process.env.PORT || 3000);

async function start() {
  await initDb();
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`✨ J.A.N.T. Backend v${VERSION} running at http://localhost:${info.port}`);
    console.log(`📡 MCP Endpoint available at http://localhost:${info.port}/mcp`);
  });
}

start();

export default app;
