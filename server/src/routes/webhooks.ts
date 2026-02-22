import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Webhook endpoint for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const body = (req as any).rawBody || JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  const documentIds = JSON.parse(paymentIntent.metadata?.documentIds || '[]');
  const userId = paymentIntent.metadata?.userId;

  if (!userId || documentIds.length === 0) {
    console.warn('Invalid payment intent metadata');
    return;
  }

  // Create orders for each document
  for (const documentId of documentIds) {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) continue;

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: userId,
        documentId,
        status: 'COMPLETED'
      }
    });

    if (existingOrder) continue;

    // Create order
    await prisma.order.create({
      data: {
        buyerId: userId,
        documentId,
        amount: document.price,
        paymentIntentId: paymentIntent.id,
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Update document sales count
    await prisma.document.update({
      where: { id: documentId },
      data: { salesCount: { increment: 1 } }
    });

    // Update seller balance
    const commission = document.price * 0.15; // 15% commission
    const sellerEarnings = document.price - commission;
    
    await prisma.user.update({
      where: { id: document.sellerId },
      data: {
        balance: { increment: sellerEarnings },
        totalSales: { increment: sellerEarnings }
      }
    });

    // Clear cart for buyer
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        documentId
      }
    });

    // TODO: Send confirmation email to buyer and seller
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  // TODO: Notify user about failed payment
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('🔄 Charge refunded:', charge.id);

  // Find order by payment intent
  if (!charge.payment_intent) return;

  const paymentIntentId = typeof charge.payment_intent === 'string' 
    ? charge.payment_intent 
    : charge.payment_intent.id;

  const orders = await prisma.order.findMany({
    where: { paymentIntentId }
  });

  for (const order of orders) {
    // Update order status to refunded
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED' }
    });

    // Fetch document to get seller info
    const document = await prisma.document.findUnique({
      where: { id: order.documentId }
    });

    if (!document) return;

    // Reverse seller's earnings
    const sellerEarnings = order.amount * 0.85; // 85% to seller
    
    await prisma.user.update({
      where: { id: document.sellerId },
      data: {
        balance: { decrement: sellerEarnings },
        totalSales: { decrement: sellerEarnings }
      }
    });

    // TODO: Notify seller about refund
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // TODO: Handle subscription-based features if implemented
}

export default router;
