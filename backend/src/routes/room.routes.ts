import { Router } from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyAdmin } from '../middlewares/verifyAdmin';

const router = Router();

router.get('/', verifyToken, getRooms);
router.get('/:id', verifyToken, getRoomById);
router.post('/', verifyToken, verifyAdmin, createRoom);
router.put('/:id', verifyToken, verifyAdmin, updateRoom);
router.delete('/:id', verifyToken, verifyAdmin, deleteRoom);

export default router;
