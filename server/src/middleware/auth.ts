import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      logger.error('JWT_SECRET is not properly configured');
      throw new Error('Server configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as { 
      userId: string; 
      email: string; 
      role: string; 
      iat: number; 
      exp: number 
    };
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'SELLER' && req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Seller access required');
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  next();
};
