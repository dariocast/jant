import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initDb() {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to SQLite database via Prisma');
  } catch (error) {
    console.error('[DB] Connection error:', error);
  }
}
