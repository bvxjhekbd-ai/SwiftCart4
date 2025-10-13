/**
 * POST /api/auth/signup
 * User signup endpoint
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClients } from '../_utils/auth';
import { initDB } from '../_utils/db';
import * as schema from '../../shared/schema';

const ADMIN_EMAILS = ["ighanghangodspower@gmail.com"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

      // Upsert user in database
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
