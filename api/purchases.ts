/**
 * Consolidated Purchases Endpoint
 * POST /api/purchases - Single purchase
 * POST /api/purchases?action=bulk - Bulk purchase
 * GET /api/purchases - Get user's purchases
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_utils/auth.js';
import { initDB } from './_utils/db.js';
import { z } from 'zod';
import * as schema from '../shared/schema.js';
import { eq, inArray } from 'drizzle-orm';

const purchaseRequestSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
});

const bulkPurchaseRequestSchema = z.object({
  productIds: z.array(z.string().uuid("Invalid product ID format")).min(1, "At least one product required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const db = initDB();
  const { action } = req.query;

  // GET /api/purchases - Get user's purchases
  if (req.method === 'GET') {
    try {
      const purchasesData = await db.query.purchases.findMany({
        where: (purchases, { eq }) => eq(purchases.userId, user.id)
      });

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

  // POST /api/purchases?action=bulk - Bulk purchase
  if (req.method === 'POST' && action === 'bulk') {
    try {
      const validation = bulkPurchaseRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid bulk purchase request", 
          errors: validation.error.errors 
        });
      }

      const { productIds } = validation.data;

      const [products, dbUser] = await Promise.all([
        db.query.products.findMany({
          where: (products, { inArray }) => inArray(products.id, productIds)
        }),
        db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, user.id) })
      ]);

      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const availableProducts = products.filter(p => p.status === 'available');
      const failedProducts = productIds.filter(id => !availableProducts.find(p => p.id === id));

      if (availableProducts.length === 0) {
        return res.status(400).json({ message: "No available products in cart" });
      }

      const total = availableProducts.reduce((sum, p) => sum + p.price, 0);

      if (dbUser.walletBalance < total) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const purchases = await db.transaction(async (tx) => {
        const newPurchases: any[] = [];

        for (const product of availableProducts) {
          const [purchase] = await tx.insert(schema.purchases).values({
            userId: user.id,
            productId: product.id,
            amount: product.price,
          }).returning();

          await tx.update(schema.products)
            .set({ status: 'sold' })
            .where(eq(schema.products.id, product.id));

          newPurchases.push(purchase);
        }

        await tx.update(schema.users)
          .set({ walletBalance: dbUser.walletBalance - total })
          .where(eq(schema.users.id, user.id));

        await tx.insert(schema.transactions).values({
          userId: user.id,
          type: 'purchase',
          amount: total,
          status: 'completed',
          metadata: { productIds: availableProducts.map(p => p.id) },
        });

        return newPurchases;
      });

      return res.status(201).json({
        purchases,
        newBalance: dbUser.walletBalance - total,
        successCount: purchases.length,
        failedProducts,
      });
    } catch (error) {
      console.error('Error creating bulk purchase:', error);
      return res.status(500).json({ message: 'Failed to complete bulk purchase' });
    }
  }

  // POST /api/purchases - Single purchase
  if (req.method === 'POST' && !action) {
    try {
      const validation = purchaseRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid purchase request", 
          errors: validation.error.errors 
        });
      }

      const { productId } = validation.data;

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

      const [purchase] = await db.transaction(async (tx) => {
        const [newPurchase] = await tx.insert(schema.purchases).values({
          userId: user.id,
          productId,
          amount: product.price,
        }).returning();

        await tx.update(schema.products)
          .set({ status: 'sold' })
          .where(eq(schema.products.id, productId));

        await tx.update(schema.users)
          .set({ walletBalance: dbUser.walletBalance - product.price })
          .where(eq(schema.users.id, user.id));

        await tx.insert(schema.transactions).values({
          userId: user.id,
          type: 'purchase',
          amount: product.price,
          status: 'completed',
          metadata: { productId },
        });

        return [newPurchase];
      });

      return res.status(201).json({
        purchase,
        newBalance: dbUser.walletBalance - product.price,
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      return res.status(500).json({ message: 'Failed to complete purchase' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
