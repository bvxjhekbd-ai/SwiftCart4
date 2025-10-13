/**
 * POST /api/deposits/initialize - Initialize Paystack deposit
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_utils/auth';
import { initDB } from '../_utils/db';
import { z } from 'zod';
import * as schema from '../../shared/schema';

const depositInitializeSchema = z.object({
  amount: z.number()
    .int("Amount must be a whole number")
    .min(100, "Minimum deposit is ₦100")
    .max(1000000, "Maximum deposit is ₦1,000,000"),
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
    const validation = depositInitializeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid deposit amount", 
        errors: validation.error.errors 
      });
    }

    const { amount } = validation.data;

    // Get user email
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id)
    });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create pending transaction
    const [transaction] = await db.insert(schema.transactions).values({
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      metadata: {},
    }).returning();

    // For now, return a simple response
    // In production, you would integrate with Paystack here
    return res.status(200).json({
      transactionId: transaction.id,
      reference: transaction.id,
      amount,
      email: dbUser.email,
    });
  } catch (error) {
    console.error('Error initializing deposit:', error);
    return res.status(500).json({ message: 'Failed to initialize deposit' });
  }
}
