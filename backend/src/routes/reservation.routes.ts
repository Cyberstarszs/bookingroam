import { Router } from 'express';
import { createReservation, getMyReservations, getAllReservations, approveReservation, rejectReservation, cancelReservation } from '../controllers/reservation.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';

const router = Router();

router.post('/', verifyToken, createReservation);
router.get('/me', verifyToken, getMyReservations);
router.get('/', verifyToken, verifyAdmin, getAllReservations);
router.patch('/:id/approve', verifyToken, verifyAdmin, approveReservation);
router.patch('/:id/reject', verifyToken, verifyAdmin, rejectReservation);
router.patch('/:id/cancel', verifyToken, cancelReservation);

export default router;
