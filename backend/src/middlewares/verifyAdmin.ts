import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken';

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Hanya admin yang diizinkan' });
  }
  next();
};
