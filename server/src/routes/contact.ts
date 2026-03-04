import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

const contactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
  type: z.enum(['general', 'support', 'sales', 'bug']).optional()
});

// Submit contact form (rate limited)
router.post('/', apiLimiter, async (req, res) => {
  try {
    const data = contactMessageSchema.parse(req.body);

    // Store in database
    const contact = await prisma.contact.create({
      data: {
        ...data,
        type: data.type || 'general',
        status: 'NEW'
      }
    });

    // TODO: Send notification email to admin
    console.log(`New contact message from ${data.email}: ${data.subject}`);

    // Create admin notifications for new contact message
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      if (admins && admins.length > 0) {
        const notifications = admins.map(a => ({
          userId: a.id,
          title: 'New contact message',
          message: `Contact from ${data.name} <${data.email}>: ${data.subject}`,
          type: 'contact'
        }));

        await prisma.notification.createMany({ data: notifications });

        // Emit real-time notifications to connected admins
        try {
          const { getIo } = await import('../socket');
          const io = getIo();
          if (io) {
            admins.forEach(a => {
              io.to(a.id).emit('notification', {
                title: 'New contact message',
                message: `Contact from ${data.name} <${data.email}>: ${data.subject}`,
                type: 'contact',
                createdAt: new Date()
              });
            });
          }
        } catch (emitErr) {
          console.error('Failed to emit socket notifications for contact message:', emitErr);
        }
      }
    } catch (notifyErr) {
      console.error('Failed to create admin notifications for contact message:', notifyErr);
    }

    res.status(201).json({
      message: 'Thank you for your message. We will get back to you soon.',
      contactId: contact.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
