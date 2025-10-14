/**
 * Consolidated Admin Endpoint
 * All admin operations with query parameters
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_utils/auth.js';
import { initDB } from './_utils/db.js';
import { z } from 'zod';
import * as schema from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const socialMediaAccountValidator = z.object({
  accountUsername: z.string().min(1, "Account username is required"),
  accountPassword: z.string().min(1, "Account password is required"),
  accountEmail: z.string().email("Valid email is required").optional(),
});

const adminProductSchema = schema.insertProductSchema.merge(socialMediaAccountValidator);
const PROTECTED_ADMIN_EMAIL = "ighanghangodspower@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  const { action, id } = req.query;

  // GET /api/admin?action=stats
  if (action === 'stats' && req.method === 'GET') {
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

  // GET /api/admin?action=users
  if (action === 'users' && req.method === 'GET') {
    try {
      const users = await db.query.users.findMany();
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  // GET /api/admin?action=all-products
  if (action === 'all-products' && req.method === 'GET') {
    try {
      const products = await db.query.products.findMany();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching all products:', error);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
  }

  // GET /api/admin?action=all-deposits
  if (action === 'all-deposits' && req.method === 'GET') {
    try {
      const allTransactions = await db.query.transactions.findMany();
      const deposits = allTransactions.filter((t) => t.type === "deposit");
      
      // Enrich deposits with user data
      const users = await db.query.users.findMany();
      const enrichedDeposits = deposits.map(d => ({
        ...d,
        user: users.find(u => u.id === d.userId) || { email: 'Unknown', firstName: 'Unknown', lastName: '' },
      }));
      
      return res.status(200).json(enrichedDeposits);
    } catch (error) {
      console.error('Error fetching all deposits:', error);
      return res.status(500).json({ message: 'Failed to fetch deposits' });
    }
  }

  // GET /api/admin?action=all-purchases
  if (action === 'all-purchases' && req.method === 'GET') {
    try {
      const { desc, sql } = await import('drizzle-orm');
      const results = await db
        .select()
        .from(schema.purchases)
        .leftJoin(schema.products, eq(schema.purchases.productId, schema.products.id))
        .leftJoin(schema.users, eq(schema.purchases.userId, schema.users.id))
        .orderBy(desc(sql`COALESCE(${schema.purchases.purchasedAt}, CURRENT_TIMESTAMP)`));

      const enrichedPurchases = results.map((row) => ({
        ...row.purchases,
        product: row.products,
        user: row.users,
      }));

      return res.status(200).json(enrichedPurchases);
    } catch (error) {
      console.error('Error fetching all purchases:', error);
      return res.status(500).json({ message: 'Failed to fetch purchases' });
    }
  }

  // POST /api/admin?action=create-product
  if (action === 'create-product' && req.method === 'POST') {
    try {
      const validatedData = adminProductSchema.parse(req.body);

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

  // PATCH /api/admin?action=update-product&id=xxx
  if (action === 'update-product' && req.method === 'PATCH' && id) {
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

  // DELETE /api/admin?action=delete-product&id=xxx
  if (action === 'delete-product' && req.method === 'DELETE' && id) {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, id as string));
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  }

  // PATCH /api/admin?action=update-transaction-status&id=xxx
  if (action === 'update-transaction-status' && req.method === 'PATCH' && id) {
    try {
      const { status } = req.body;

      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Valid status is required" });
      }

      await db.update(schema.transactions)
        .set({ status })
        .where(eq(schema.transactions.id, id as string));

      return res.status(200).json({ message: 'Transaction status updated successfully' });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return res.status(500).json({ message: 'Failed to update transaction status' });
    }
  }

  // PATCH /api/admin?action=update-user-admin-status&id=xxx
  if (action === 'update-user-admin-status' && req.method === 'PATCH' && id) {
    try {
      const { isAdmin: newAdminStatus } = req.body;

      if (typeof newAdminStatus !== "boolean") {
        return res.status(400).json({ message: "isAdmin must be a boolean" });
      }

      const targetUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id as string)
      });

      if (targetUser?.email === PROTECTED_ADMIN_EMAIL && newAdminStatus === false) {
        return res.status(403).json({ 
          message: "This admin account is protected and cannot be removed from admin position" 
        });
      }

      const [updatedUser] = await db.update(schema.users)
        .set({ isAdmin: newAdminStatus })
        .where(eq(schema.users.id, id as string))
        .returning();

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user admin status:', error);
      return res.status(500).json({ message: 'Failed to update user admin status' });
    }
  }

  // POST /api/admin?action=create-category
  if (action === 'create-category' && req.method === 'POST') {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Category name is required" });
      }

      const [category] = await db.insert(schema.categories).values({ name }).returning();
      return res.status(201).json(category);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ message: "Category already exists" });
      }
      console.error('Error creating category:', error);
      return res.status(500).json({ message: 'Failed to create category' });
    }
  }

  // DELETE /api/admin?action=delete-category&id=xxx
  if (action === 'delete-category' && req.method === 'DELETE' && id) {
    try {
      await db.delete(schema.categories).where(eq(schema.categories.id, id as string));
      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ message: 'Failed to delete category' });
    }
  }

  return res.status(400).json({ message: 'Invalid action or method' });
}
