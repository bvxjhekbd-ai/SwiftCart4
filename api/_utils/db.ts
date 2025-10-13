/**
 * Database initialization utility for Vercel serverless functions
 * Initializes database connection per request (serverless-safe)
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';
import ws from 'ws';
import { requireEnv } from './env-validator';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

/**
 * Initialize database connection for serverless function
 * Call this at the start of each API handler
 */
export function initDB() {
  const DATABASE_URL = requireEnv('DATABASE_URL');
  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}
