/**
 * PATCH /api/admin/transactions/:id/status - Update transaction status
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../../_utils/auth';
import { initDB } from '../../../_utils/db';
import { eq } from 'drizzle-orm';
import * as schema from '../../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

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
