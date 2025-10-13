/**
 * Database initialization utility for Vercel serverless functions
 * Initializes database connection per request (serverless-safe)
 * Using neon-serverless with Pool for transaction support
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../shared/schema.js';
import ws from 'ws';
import { requireEnv } from './env-validator.js';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

/**
 * Initialize database connection for serverless function
 * Call this at the start of each API handler
 * Uses Pool for transaction support
 */
export function initDB() {
  const DATABASE_URL = requireEnv('DATABASE_URL');
  const pool = new Pool({ connectionString: DATABASE_URL });
  return drizzle(pool, { schema });
}
