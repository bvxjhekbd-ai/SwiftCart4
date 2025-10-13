/**
 * GET /api/transactions - Get user's transaction history
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_utils/auth.js';
import { initDB } from '../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const db = initDB();

    const transactions = await db.query.transactions.findMany({
      where: (transactions, { eq }) => eq(transactions.userId, user.id),
      orderBy: (transactions, { desc }) => desc(transactions.createdAt)
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Failed to fetch transactions' });
  }
}
