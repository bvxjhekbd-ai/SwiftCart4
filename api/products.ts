/**
 * Consolidated Products Endpoint
 * GET /api/products - Get all products (public)
 * GET /api/products?id=xxx - Get product by ID (requires auth)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDB } from './_utils/db';
import { requireAuth } from './_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const db = initDB();

    // GET /api/products?id=xxx - Get single product (requires auth)
    if (id) {
      const user = await requireAuth(req, res);
      if (!user) return;

      const product = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, id as string)
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const { accountUsername, accountPassword, accountEmail, ...sanitizedProduct } = product;
      return res.status(200).json(sanitizedProduct);
    }

    // GET /api/products - Get all available products (public)
    const products = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.status, 'available')
    });

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
