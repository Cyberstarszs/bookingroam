import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/', verifyToken, getMyNotifications);
router.patch('/:id/read', verifyToken, markAsRead);

export default router;
