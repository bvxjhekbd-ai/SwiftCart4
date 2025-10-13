/**
 * GET /api/admin/all-deposits - Get all deposits (admin only)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_utils/auth';
import { initDB } from '../_utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  try {
    const allTransactions = await db.query.transactions.findMany();
    const deposits = allTransactions.filter((t) => t.type === "deposit");
    return res.status(200).json(deposits);
  } catch (error) {
    console.error('Error fetching all deposits:', error);
    return res.status(500).json({ message: 'Failed to fetch deposits' });
  }
}
