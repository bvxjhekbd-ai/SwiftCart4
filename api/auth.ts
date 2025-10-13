/**
 * Consolidated Auth Endpoint
 * Handles: signin, signup, signout, user
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const ADMIN_EMAILS = ["ighanghangodspower@gmail.com"];

// Utility: Get env variable
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Utility: Initialize DB
function initDB() {
  const DATABASE_URL = requireEnv('DATABASE_URL');
  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}

// Utility: Get Supabase clients
function getSupabaseClients() {
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

// Utility: Verify token
async function verifyToken(req: VercelRequest) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  // POST /api/auth?action=signin
  if (action === 'signin' && req.method === 'POST') {
    try {
      const { email, password } = req.body;
      const { supabase } = getSupabaseClients();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      if (data.user) {
        const db = initDB();
        const isAdmin = ADMIN_EMAILS.includes(data.user.email || '');

        await db.insert(schema.users)
          .values({
            id: data.user.id,
            email: data.user.email || '',
            firstName: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
            lastName: data.user.user_metadata?.last_name || '',
            profileImageUrl: data.user.user_metadata?.avatar_url || '',
            walletBalance: 0,
            isAdmin: isAdmin,
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              email: data.user.email || '',
              firstName: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
              lastName: data.user.user_metadata?.last_name || '',
              profileImageUrl: data.user.user_metadata?.avatar_url || '',
            }
          });

        if (isAdmin) {
          await db.update(schema.users)
            .set({ isAdmin: true })
            .where(eq(schema.users.id, data.user.id));
        }
      }

      return res.status(200).json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error('Signin error:', error);
      return res.status(500).json({ message: 'Failed to sign in' });
    }
  }

  // POST /api/auth?action=signup
  if (action === 'signup' && req.method === 'POST') {
    try {
      const { email, password, firstName, lastName } = req.body;
      const { supabase } = getSupabaseClients();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      if (data.user) {
        const db = initDB();
        const isAdmin = ADMIN_EMAILS.includes(data.user.email || '');

        await db.insert(schema.users)
          .values({
            id: data.user.id,
            email: data.user.email || '',
            firstName: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
            lastName: data.user.user_metadata?.last_name || '',
            profileImageUrl: data.user.user_metadata?.avatar_url || '',
            walletBalance: 0,
            isAdmin: isAdmin,
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              email: data.user.email || '',
              firstName: data.user.user_metadata?.first_name || data.user.email?.split('@')[0] || '',
              lastName: data.user.user_metadata?.last_name || '',
              profileImageUrl: data.user.user_metadata?.avatar_url || '',
            }
          });
      }

      return res.status(200).json({
        user: data.user,
        session: data.session,
        message: 'Please check your email to confirm your account',
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Failed to sign up' });
    }
  }

  // POST /api/auth?action=signout
  if (action === 'signout' && req.method === 'POST') {
    return res.status(200).json({ message: 'Signed out successfully' });
  }

  // GET /api/auth?action=user
  if (action === 'user' && req.method === 'GET') {
    try {
      const user = await verifyToken(req);
      const db = initDB();

      const dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, user.id)
      });

      if (!dbUser) {
        return res.status(404).json({ message: 'User not found in database' });
      }

      return res.status(200).json({
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
        walletBalance: dbUser.walletBalance,
        isAdmin: dbUser.isAdmin,
      });
    } catch (error) {
      return res.status(401).json({ 
        message: error instanceof Error ? error.message : 'Unauthorized' 
      });
    }
  }

  return res.status(400).json({ message: 'Invalid action or method' });
}
