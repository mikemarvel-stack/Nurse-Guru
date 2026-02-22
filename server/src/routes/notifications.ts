import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const createNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success']).optional()
});

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { unreadOnly } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        ...(unreadOnly === 'true' && { read: false })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });

    res.json({ notification: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Create notification (internal/admin)
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type } = createNotificationSchema.parse(req.body);

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info'
      }
    });

    res.status(201).json({ notification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
