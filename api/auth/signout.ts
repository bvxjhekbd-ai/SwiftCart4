/**
 * POST /api/auth/signout
 * User signout endpoint
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Client-side Supabase handles sign out
  // This endpoint just acknowledges the request
  return res.status(200).json({ message: 'Signed out successfully' });
}
