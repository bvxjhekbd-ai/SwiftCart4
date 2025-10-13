/**
 * POST /api/admin/dashboard/products - Create product
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../_utils/auth';
import { initDB } from '../../_utils/db';
import { z } from 'zod';
import * as schema from '../../../shared/schema';

const socialMediaAccountValidator = z.object({
  accountUsername: z.string().min(1, "Account username is required"),
  accountPassword: z.string().min(1, "Account password is required"),
  accountEmail: z.string().email("Valid email is required").optional(),
});

const adminProductSchema = schema.insertProductSchema.merge(socialMediaAccountValidator);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  try {
    const validatedData = adminProductSchema.parse(req.body);

    // Validate base64 images if provided
    if (validatedData.images && validatedData.images.length > 0) {
      for (const image of validatedData.images) {
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (!matches) {
            return res.status(400).json({ message: "Invalid base64 image format" });
          }

          const [, mimeType, base64Data] = matches;
          const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!validMimeTypes.includes(mimeType)) {
            return res.status(400).json({ 
              message: `Invalid image type. Supported: JPEG, PNG, GIF, WebP. Got: ${mimeType}` 
            });
          }

          const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
          const maxSize = 5 * 1024 * 1024;
          if (sizeInBytes > maxSize) {
            return res.status(400).json({ 
              message: `Image size exceeds 5MB limit. Size: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB` 
            });
          }
        }
      }
    }

    const [product] = await db.insert(schema.products).values(validatedData).returning();
    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid product data", 
        errors: error.errors 
      });
    }
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
}
