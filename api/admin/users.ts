/**
 * GET /api/admin/users - Get all users
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_utils/auth.js';
import { initDB } from '../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  try {
    const users = await db.query.users.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}
