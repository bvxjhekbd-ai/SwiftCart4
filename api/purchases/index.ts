/**
 * POST /api/purchases - Create a single purchase
 * GET /api/purchases - Get user's purchases
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_utils/auth.js';
import { initDB } from '../_utils/db.js';
import { z } from 'zod';
import * as schema from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const purchaseRequestSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const db = initDB();

  if (req.method === 'POST') {
    try {
      // Validate request
      const validation = purchaseRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid purchase request", 
          errors: validation.error.errors 
        });
      }

      const { productId } = validation.data;

      // Get product and user
      const [product, dbUser] = await Promise.all([
        db.query.products.findFirst({ where: (products, { eq }) => eq(products.id, productId) }),
        db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, user.id) })
      ]);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.status !== 'available') {
        return res.status(400).json({ message: "Product is not available" });
      }

      if (!dbUser || dbUser.walletBalance < product.price) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create purchase record
      const [purchase] = await db.insert(schema.purchases).values({
        userId: user.id,
        productId,
        amount: product.price,
      }).returning();

      // Mark product as sold
      await db.update(schema.products)
        .set({ status: 'sold' })
        .where(eq(schema.products.id, productId));

      // Deduct from user balance
      const newBalance = dbUser.walletBalance - product.price;
      await db.update(schema.users)
        .set({ walletBalance: newBalance })
        .where(eq(schema.users.id, user.id));

      // Record transaction
      await db.insert(schema.transactions).values({
        userId: user.id,
        type: 'purchase',
        amount: product.price,
        status: 'completed',
        metadata: { productId },
      });

      return res.status(201).json({
        purchase,
        newBalance,
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      return res.status(500).json({ message: 'Failed to complete purchase' });
    }
  }

  if (req.method === 'GET') {
    try {
      const purchasesData = await db.query.purchases.findMany({
        where: (purchases, { eq }) => eq(purchases.userId, user.id)
      });

      // Get all products for these purchases
      const productIds = purchasesData.map(p => p.productId);
      const productsData = await db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, productIds)
      });

      const purchasesWithCredentials = purchasesData.map((p) => {
        const product = productsData.find(pr => pr.id === p.productId);
        return {
          ...p,
          product: product || null,
        };
      });

      return res.status(200).json(purchasesWithCredentials);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return res.status(500).json({ message: 'Failed to fetch purchases' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
