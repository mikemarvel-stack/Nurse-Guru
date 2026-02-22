import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const contactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
  type: z.enum(['general', 'support', 'sales', 'bug']).optional()
});

// Submit contact form
router.post('/', async (req, res) => {
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
