import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional()
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        balance: true,
        createdAt: true,
        _count: {
          select: {
            documents: true,
            orders: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        balance: true,
        createdAt: true
      }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's documents (for seller dashboard)
router.get('/my-documents', authenticate, async (req: AuthRequest, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { sellerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get seller stats
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const [documentCount, orderCount, totalSales] = await Promise.all([
      prisma.document.count({
        where: { sellerId: req.user!.id }
      }),
      prisma.order.count({
        where: {
          document: { sellerId: req.user!.id },
          status: 'COMPLETED'
        }
      }),
      prisma.order.aggregate({
        where: {
          document: { sellerId: req.user!.id },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ]);

    res.json({
      stats: {
        documentCount,
        orderCount,
        totalSales: totalSales._sum.amount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Become a seller
router.post('/become-seller', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: 'SELLER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        balance: true
      }
    });

    res.json({ message: 'You are now a seller!', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;
