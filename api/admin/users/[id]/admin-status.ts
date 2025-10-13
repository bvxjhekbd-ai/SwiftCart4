/**
 * PATCH /api/admin/users/:id/admin-status - Update user admin status
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../../_utils/auth';
import { initDB } from '../../../_utils/db';
import { eq } from 'drizzle-orm';
import * as schema from '../../../../shared/schema';

const PROTECTED_ADMIN_EMAIL = "ighanghangodspower@gmail.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const db = initDB();
  const user = await requireAdmin(req, res, db);
  if (!user) return;

  try {
    const { isAdmin: newAdminStatus } = req.body;

    if (typeof newAdminStatus !== "boolean") {
      return res.status(400).json({ message: "isAdmin must be a boolean" });
    }

    // Check if target user is protected
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
