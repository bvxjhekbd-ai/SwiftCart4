/**
 * GET /api/admin/stats - Get product statistics
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
    const [available, sold, total] = await Promise.all([
      db.query.products.findMany({ where: (products, { eq }) => eq(products.status, 'available') }),
      db.query.products.findMany({ where: (products, { eq }) => eq(products.status, 'sold') }),
      db.query.products.findMany()
    ]);

    return res.status(200).json({
      available: available.length,
      sold: sold.length,
      total: total.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Failed to fetch statistics' });
  }
}
