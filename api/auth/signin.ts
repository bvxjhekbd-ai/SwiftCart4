/**
 * POST /api/auth/signin
 * User signin endpoint
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClients } from '../_utils/auth';
import { initDB } from '../_utils/db';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

const ADMIN_EMAILS = ["ighanghangodspower@gmail.com"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

      // Sync user in database
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

      // Ensure admin emails maintain admin status
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
