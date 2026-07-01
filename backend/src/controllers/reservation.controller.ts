import { Request, Response } from 'express';
import { db } from '../db';
import { reservations, notifications } from '../db/schema';
import { eq, and, or, lt, gt } from 'drizzle-orm';
import { AuthRequest } from '../middlewares/verifyToken';

export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, date, start_time, end_time, purpose } = req.body;
    const userId = req.user!.id;

    if (!date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi tanggal dan waktu' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ success: false, message: 'Waktu tidak valid' });
    }

    const overlapping = await db.select().from(reservations).where(
      and(
        eq(reservations.roomId, Number(room_id)),
        eq(reservations.date, date),
        or(eq(reservations.status, 'pending'), eq(reservations.status, 'approved')),
        lt(reservations.startTime, end_time),
        gt(reservations.endTime, start_time)
      )
    );

    if (overlapping.length > 0) {
      return res.status(409).json({ success: false, message: 'Ruangan sudah dipesan pada waktu tersebut' });
    }

    const [result] = await db.insert(reservations).values({
      userId,
      roomId: Number(room_id),
      date: date,
      startTime: start_time,
      endTime: end_time,
      purpose,
      status: 'pending'
    });

    const newRes = await db.select().from(reservations).where(eq(reservations.id, result.insertId));
    res.status(201).json({ success: true, message: 'Reservasi berhasil diajukan', reservation: newRes[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const myRes = await db.select().from(reservations).where(eq(reservations.userId, userId));
    res.status(200).json({ success: true, data: myRes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const getAllReservations = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const allRes = await db.select().from(reservations).where(
      status ? eq(reservations.status, status as any) : undefined
    );
    res.status(200).json({ success: true, data: allRes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const approveReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.update(reservations).set({ status: 'approved' }).where(eq(reservations.id, Number(id)));

    const resData = await db.select().from(reservations).where(eq(reservations.id, Number(id)));
    if (resData.length > 0) {
      await db.insert(notifications).values({
        userId: resData[0].userId,
        message: 'Reservasi Anda telah disetujui.'
      });
    }

    res.status(200).json({ success: true, message: 'Reservasi disetujui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const rejectReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reject_reason } = req.body;
    await db.update(reservations).set({ 
      status: 'rejected', 
      rejectReason: reject_reason 
    }).where(eq(reservations.id, Number(id)));

    const resData = await db.select().from(reservations).where(eq(reservations.id, Number(id)));
    if (resData.length > 0) {
      await db.insert(notifications).values({
        userId: resData[0].userId,
        message: `Reservasi Anda ditolak. Alasan: ${reject_reason || '-'}`
      });
    }

    res.status(200).json({ success: true, message: 'Reservasi ditolak' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const resData = await db.select().from(reservations).where(eq(reservations.id, Number(id)));
    if (resData.length === 0) {
      return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
    }

    const reservation = resData[0];

    if (role !== 'admin' && reservation.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Tidak diizinkan membatalkan reservasi ini' });
    }

    if (reservation.status !== 'pending' && reservation.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Reservasi tidak dapat dibatalkan pada status ini' });
    }

    await db.update(reservations).set({ status: 'cancelled' }).where(eq(reservations.id, Number(id)));
    res.status(200).json({ success: true, message: 'Reservasi dibatalkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};
