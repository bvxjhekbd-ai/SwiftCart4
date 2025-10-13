/**
 * GET /api/auth/user
 * Get current authenticated user
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../_utils/auth.js';
import { initDB } from '../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
