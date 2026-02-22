import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Create payment intent
router.post('/create-intent', authenticate, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Get document details and calculate total
    const documents = await prisma.document.findMany({
      where: {
        id: { in: items },
        status: 'APPROVED'
      }
    });

    if (documents.length !== items.length) {
      return res.status(400).json({ error: 'Some items not found' });
    }

    const amount = documents.reduce((sum: number, doc: any) => sum + Math.round(doc.price * 100), 0);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user!.id,
        documentIds: JSON.stringify(items)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and create orders
router.post('/confirm', authenticate, async (req: AuthRequest, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    const documentIds = JSON.parse(paymentIntent.metadata?.documentIds || '[]');
    const orders = [];

    // Create orders for each document
    for (const documentId of documentIds) {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      });

      if (!document) continue;

      // Check if already purchased
      const existingOrder = await prisma.order.findFirst({
        where: {
          buyerId: req.user!.id,
          documentId,
          status: 'COMPLETED'
        }
      });

      if (existingOrder) continue;

      // Create order
      const order = await prisma.order.create({
        data: {
          buyerId: req.user!.id,
          documentId,
          amount: document.price,
          paymentIntentId,
          status: 'COMPLETED',
          completedAt: new Date()
        },
        include: {
          document: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      orders.push(order);

      // Update document sales count
      await prisma.document.update({
        where: { id: documentId },
        data: { salesCount: { increment: 1 } }
      });

      // Update seller balance (80% of sale)
      const sellerShare = document.price * 0.8;
      await prisma.user.update({
        where: { id: document.sellerId },
        data: { balance: { increment: sellerShare } }
      });
    }

    // Clear cart after successful purchase
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user!.id,
        documentId: { in: documentIds }
      }
    });

    res.json({
      message: 'Payment confirmed and orders created',
      orders
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Webhook for Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing signature or endpoint secret');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get publishable key
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key'
  });
});

export default router;
