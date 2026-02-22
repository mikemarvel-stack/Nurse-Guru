import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import passwordRoutes from './routes/password';
import documentRoutes from './routes/documents';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import uploadRoutes from './routes/upload';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/users';
import contactRoutes from './routes/contact';
import reviewsRoutes from './routes/reviews';
import analyticsRoutes from './routes/analytics';
import notificationsRoutes from './routes/notifications';
import webhooksRoutes from './routes/webhooks';
import { sanitizeInput } from './middleware/sanitize';
import createRateLimiter from './middleware/rateLimit';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Security: Rate limiting
app.use(createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Security: Input sanitization
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Security: Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/search', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, '../../uploads')}`);
});

export default app;
