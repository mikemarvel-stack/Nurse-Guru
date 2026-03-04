import request from 'supertest';
import express, { Express, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import notificationsRouter from '../routes/notifications';

// Create a test app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Manual authentication middleware
  app.use(async (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-dev-secret') as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.use('/api/notifications', notificationsRouter);
  return app;
};

describe('Notifications API - Simple', () => {
  let app: Express;
  let testUserId: string;
  let testToken: string;

  beforeAll(async () => {
    app = createTestApp();

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-notif@example.com',
        password: 'hashed',
        name: 'Test User',
        role: 'USER'
      }
    });
    testUserId = user.id;

    // Generate token
    testToken = jwt.sign(
      { userId: testUserId, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-dev-secret',
      { expiresIn: '7d' }
    );
  });

  afterEach(async () => {
    await prisma.notification.deleteMany({});
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should return empty notifications for new user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications).toEqual([]);
  });

  it('should create notification as admin', async () => {
    // Create admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin-test@example.com',
        password: 'hashed',
        name: 'Admin',
        role: 'ADMIN'
      }
    });

    const adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'default-dev-secret',
      { expiresIn: '7d' }
    );

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        type: 'info'
      });

    expect(res.status).toBe(201);
    expect(res.body.notification.userId).toBe(testUserId);

    // Cleanup admin
    await prisma.user.delete({ where: { id: admin.id } });
  });

  it('should reject notification creation from non-admin', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        type: 'info'
      });

    expect(res.status).toBe(403);
  });
});
