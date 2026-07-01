import { Request, Response } from 'express';
import { db } from '../db';
import { rooms, reservations } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/verifyToken';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const allRooms = await db.select().from(rooms);
    res.status(200).json({ success: true, data: allRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roomResult = await db.select().from(rooms).where(eq(rooms.id, Number(id)));
    if (roomResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Ruangan tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: roomResult[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, capacity, description, open_time, close_time } = req.body;
    
    const [result] = await db.insert(rooms).values({
      name,
      location,
      capacity,
      description,
      openTime: open_time || '08:00:00',
      closeTime: close_time || '17:00:00'
    });

    const newRoom = await db.select().from(rooms).where(eq(rooms.id, result.insertId));
    res.status(201).json({ success: true, message: 'Ruangan berhasil ditambahkan', data: newRoom[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, capacity, description, open_time, close_time } = req.body;
    
    await db.update(rooms).set({
      name,
      location,
      capacity,
      description,
      openTime: open_time,
      closeTime: close_time
    }).where(eq(rooms.id, Number(id)));

    res.status(200).json({ success: true, message: 'Ruangan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const activeReservations = await db.select().from(reservations).where(
      and(
        eq(reservations.roomId, Number(id)),
        or(eq(reservations.status, 'pending'), eq(reservations.status, 'approved'))
      )
    );

    if (activeReservations.length > 0) {
      return res.status(400).json({ success: false, message: 'Ruangan masih memiliki reservasi aktif' });
    }

    await db.delete(rooms).where(eq(rooms.id, Number(id)));
    res.status(200).json({ success: true, message: 'Ruangan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
