/**
 * Consolidated Auth Endpoint
 * Handles: signin, signup, signout, user
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClients, verifyToken } from './_utils/auth.js';
import { initDB } from './_utils/db.js';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

const ADMIN_EMAILS = ["ighanghangodspower@gmail.com"];

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
      const supabaseUser = await verifyToken(req);
      const db = initDB();

      let dbUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, supabaseUser.id)
      });

      // If user doesn't exist in database, sync them from Supabase
      if (!dbUser) {
        const isAdmin = ADMIN_EMAILS.includes(supabaseUser.email || '');
        
        await db.insert(schema.users)
          .values({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || '',
            lastName: supabaseUser.user_metadata?.last_name || '',
            profileImageUrl: supabaseUser.user_metadata?.avatar_url || '',
            walletBalance: 0,
            isAdmin: isAdmin,
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              email: supabaseUser.email || '',
              firstName: supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0] || '',
              lastName: supabaseUser.user_metadata?.last_name || '',
              profileImageUrl: supabaseUser.user_metadata?.avatar_url || '',
            }
          });

        if (isAdmin) {
          await db.update(schema.users)
            .set({ isAdmin: true })
            .where(eq(schema.users.id, supabaseUser.id));
        }

        // Fetch the newly created user
        dbUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, supabaseUser.id)
        });
      }

      if (!dbUser) {
        return res.status(500).json({ message: 'Failed to sync user' });
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

  // POST /api/auth?action=update-password
  if (action === 'update-password' && req.method === 'POST') {
    try {
      const supabaseUser = await verifyToken(req);
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const { supabaseAdmin } = getSupabaseClients();
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        supabaseUser.id,
        { password: newPassword }
      );

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      return res.status(401).json({ 
        message: errorMessage,
        isAuthError: true
      });
    }
  }

  // POST /api/auth?action=reset-password
  if (action === 'reset-password' && req.method === 'POST') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const { supabase } = getSupabaseClients();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://app.fogopulse.com/reset-password',
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }
  }

  return res.status(400).json({ message: 'Invalid action or method' });
}
