import express from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Schema for email verification
const verifyEmailSchema = z.object({
  token: z.string().min(1)
});

const resendEmailSchema = z.object({
  email: z.string().email()
});

// Send verification email (called during registration)
export async function sendVerificationEmail(email: string, userId: string) {
  try {
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiryTime
      }
    });

    // TODO: Send email with verification link
    // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    // await emailService.sendVerificationEmail(email, verificationLink);

    console.log(`[TODO] Send verification email to ${email} with token: ${token}`);
    return token;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

// Verify email endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired verification token' });
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Resend verification email
router.post('/resend', async (req, res) => {
  try {
    const { email } = resendEmailSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If that email exists, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Send new verification email
    await sendVerificationEmail(email, user.id);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Check verification status (authenticated)
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      emailVerified: user.emailVerified,
      email: user.email
    });
  } catch (error: any) {
    console.error('Verification status error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
