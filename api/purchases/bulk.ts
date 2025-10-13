/**
 * POST /api/purchases/bulk - Bulk purchase (cart checkout)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_utils/auth';
import { initDB } from '../_utils/db';
import { z } from 'zod';
import * as schema from '../../shared/schema';
import { eq, inArray } from 'drizzle-orm';

const bulkPurchaseRequestSchema = z.object({
  productIds: z.array(z.string().uuid("Invalid product ID format")).min(1, "At least one product required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const db = initDB();

    // Validate request
    const validation = bulkPurchaseRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid bulk purchase request", 
        errors: validation.error.errors 
        });
    }

    const { productIds } = validation.data;

    // Get all products and user
    const [products, dbUser] = await Promise.all([
      db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, productIds)
      }),
      db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, user.id) })
    ]);

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate all products are available
    const availableProducts = products.filter(p => p.status === 'available');
    const failedProducts = productIds.filter(id => !availableProducts.find(p => p.id === id));

    if (availableProducts.length === 0) {
      return res.status(400).json({ message: "No available products in cart" });
    }

    // Calculate total
    const total = availableProducts.reduce((sum, p) => sum + p.price, 0);

    if (dbUser.walletBalance < total) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Process bulk purchase atomically
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
