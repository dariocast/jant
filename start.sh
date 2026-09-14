#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  ✨ Starting J.A.N.T. Development Server"
echo "=========================================="

# Build frontend if needed
if [ ! -d "frontend/dist" ]; then
  echo "📦 Building Frontend..."
  (cd frontend && npm install && npm run build)
fi

# Initialize & Run Backend
echo "🚀 Starting Hono Backend & MCP Server..."
(cd backend && npm install && npx prisma generate && npx prisma db push && npm run build && npm run start)
