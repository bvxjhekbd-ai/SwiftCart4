/**
 * GET /api/admin/all-purchases - Get all purchases (admin only)
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
    const purchases = await db.query.purchases.findMany();
    
    // Get all users and products for enrichment
    const [users, products] = await Promise.all([
      db.query.users.findMany(),
      db.query.products.findMany()
    ]);

    const enrichedPurchases = purchases.map(p => ({
      ...p,
      user: users.find(u => u.id === p.userId) || null,
      product: products.find(pr => pr.id === p.productId) || null,
    }));

    return res.status(200).json(enrichedPurchases);
  } catch (error) {
    console.error('Error fetching all purchases:', error);
    return res.status(500).json({ message: 'Failed to fetch purchases' });
  }
}
