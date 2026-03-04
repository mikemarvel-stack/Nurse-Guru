import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import http from 'http';

import { validateEnv } from './utils/env';
import logger from './utils/logger';
import { requestId } from './middleware/requestId';
import { timeout } from './middleware/timeout';
import { apiLimiter, authLimiter, registerLimiter, paymentLimiter, uploadLimiter } from './middleware/rateLimit';
import { sanitizeInput } from './middleware/sanitize';
import { initSocket } from './socket';

import authRoutes from './routes/auth';
import passwordRoutes from './routes/password';
import documentRoutes from './routes/documents';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import uploadRoutes from './routes/upload';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/users';
import contactRoutes from './routes/contact';
import emailVerificationRoutes from './routes/email-verification';
import reviewsRoutes from './routes/reviews';
import analyticsRoutes from './routes/analytics';
import notificationsRoutes from './routes/notifications';
import webhooksRoutes from './routes/webhooks';

dotenv.config();

// Validate environment variables
const env = validateEnv();

const app = express();
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1);

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request ID tracking
app.use(requestId);

// Request timeout
app.use(timeout(30000));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Input sanitization
app.use(sanitizeInput);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/public', express.static(path.join(__dirname, '../../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// API Routes with rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/documents', apiLimiter, documentRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/cart', apiLimiter, cartRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/payment', paymentLimiter, paymentRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/contact', apiLimiter, contactRoutes);
app.use('/api/reviews', apiLimiter, reviewsRoutes);
app.use('/api/search', apiLimiter, analyticsRoutes);
app.use('/api/notifications', apiLimiter, notificationsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    requestId: req.id,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    requestId: req.id
  });
});

const PORT = env.PORT || 3001;

const server = http.createServer(app);
const io = initSocket(server);

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📁 Environment: ${env.NODE_ENV}`);
  logger.info(`📁 Uploads directory: ${path.join(__dirname, '../../uploads')}`);
});

export default app;
