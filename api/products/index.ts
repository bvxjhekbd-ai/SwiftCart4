/**
 * GET /api/products
 * Get all available products (public endpoint)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDB } from '../_utils/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = initDB();

    const products = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.status, 'available')
    });

    // Remove sensitive credentials from public listing
    const sanitizedProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      images: p.images,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return res.status(200).json(sanitizedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
}
