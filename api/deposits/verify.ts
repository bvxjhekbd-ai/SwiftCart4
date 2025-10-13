/**
 * POST /api/deposits/verify - Verify Paystack payment
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_utils/auth';
import { requireEnv } from '../_utils/env-validator';
import { initDB } from '../_utils/db';
import { z } from 'zod';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const depositVerifySchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  amount: z.number()
    .int("Amount must be a whole number")
    .positive("Amount must be positive"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const db = initDB();

    // Validate request body
    const validation = depositVerifySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid request data",
        errors: validation.error.errors 
      });
    }

    const { reference, amount } = validation.data;

    // Verify that a pending transaction exists for THIS user with this reference
    const pendingTransaction = await db.query.transactions.findFirst({
      where: (transactions, { and, eq }) => and(
        eq(transactions.userId, user.id),
        eq(transactions.id, reference),
        eq(transactions.status, 'pending')
      )
    });

    if (!pendingTransaction) {
      return res.status(400).json({ 
        message: "Invalid transaction reference. Transaction not found or already completed." 
      });
    }

    // Verify the requested amount matches the pending transaction amount
    if (pendingTransaction.amount !== amount) {
      return res.status(400).json({ 
        message: "Amount mismatch with pending transaction" 
      });
    }

    // Verify payment with Paystack before processing
    const PAYSTACK_SECRET_KEY = requireEnv('PAYSTACK_SECRET_KEY');

    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const response = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    });
    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Verify amount matches (Paystack returns amount in kobo, so divide by 100)
    const verifiedAmount = data.data.amount / 100;
    if (verifiedAmount !== amount) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    // Get user's current balance
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id)
    });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user balance and transaction status atomically
    const newBalance = await db.transaction(async (tx) => {
      await tx.update(schema.transactions)
        .set({ status: 'completed' })
        .where(eq(schema.transactions.id, reference));

      await tx.update(schema.users)
        .set({ walletBalance: dbUser.walletBalance + amount })
        .where(eq(schema.users.id, user.id));

      return dbUser.walletBalance + amount;
    });

    return res.status(200).json({
      message: "Deposit successful",
      newBalance,
      amount,
    });
  } catch (error) {
    console.error('Error verifying deposit:', error);
    return res.status(500).json({ message: 'Failed to verify deposit' });
  }
}
