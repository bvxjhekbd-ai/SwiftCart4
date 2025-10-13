/**
 * Authentication utilities for Vercel serverless functions
 */
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from './env-validator.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase clients
export function getSupabaseClients() {
  const SUPABASE_URL = requireEnv('SUPABASE_URL');
  const SUPABASE_ANON_KEY = requireEnv('SUPABASE_ANON_KEY');
  const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return { supabase, supabaseAdmin };
}

/**
 * Verify JWT token and get user
 */
export async function verifyToken(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.toString().split(" ")[1];

  if (!token) {
    throw new Error('No token provided');
  }

  const { supabaseAdmin } = getSupabaseClients();
  
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }

  return data.user;
}

/**
 * Middleware-style auth checker for serverless functions
 */
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<any | null> {
  try {
    const user = await verifyToken(req);
    return user;
  } catch (error) {
    res.status(401).json({ 
      message: error instanceof Error ? error.message : 'Unauthorized' 
    });
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
  db: any
): Promise<any | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;

  try {
    const dbUser = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.id, user.id)
    });

    if (!dbUser || !dbUser.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return null;
    }

    return user;
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify admin status' });
    return null;
  }
}
