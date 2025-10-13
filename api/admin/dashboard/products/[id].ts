/**
 * PATCH /api/admin/dashboard/products/:id - Update product
 * DELETE /api/admin/dashboard/products/:id - Delete product
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../../_utils/auth';
import { initDB } from '../../../_utils/db';
import { z } from 'zod';
import * as schema from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

const socialMediaAccountValidator = z.object({
  accountUsername: z.string().min(1, "Account username is required"),
  accountPassword: z.string().min(1, "Account password is required"),
  accountEmail: z.string().email("Valid email is required").optional(),
});

const adminProductSchema = schema.insertProductSchema.merge(socialMediaAccountValidator);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  if (req.method === 'PATCH') {
    try {
      const validatedData = adminProductSchema.partial().parse(req.body);
      const [product] = await db.update(schema.products)
        .set(validatedData)
        .where(eq(schema.products.id, id as string))
        .returning();

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error('Error updating product:', error);
      return res.status(500).json({ message: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, id as string));
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
