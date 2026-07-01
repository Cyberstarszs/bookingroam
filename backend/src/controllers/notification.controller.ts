import { Response } from 'express';
import { db } from '../db';
import { notifications } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/verifyToken';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const myNotifs = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    res.status(200).json({ success: true, data: myNotifs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, Number(id)));
    res.status(200).json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
