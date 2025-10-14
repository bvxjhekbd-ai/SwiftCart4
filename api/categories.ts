/**
 * Categories Endpoint
 * Handles category operations
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDB } from './_utils/db.js';
import * as schema from '../shared/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = initDB();

  // GET /api/categories - Public endpoint to fetch all categories
  if (req.method === 'GET') {
    try {
      const categories = await db.query.categories.findMany({
        orderBy: (categories, { asc }) => [asc(categories.name)],
      });

      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
