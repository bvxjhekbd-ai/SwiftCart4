/**
 * GET /api/products/:id
 * Get product details by ID (requires authentication)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDB } from '../_utils/db.js';
import { requireAuth } from '../_utils/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;

  try {
    const db = initDB();

    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id as string)
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove credentials from details view
    const { accountUsername, accountPassword, accountEmail, ...sanitizedProduct } = product;

    return res.status(200).json(sanitizedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
}
