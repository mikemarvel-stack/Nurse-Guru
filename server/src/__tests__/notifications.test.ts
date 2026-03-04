import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import notificationsRouter from '../routes/notifications';
import { authenticate } from '../middleware/auth';

// Create a test app
const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/api/notifications', notificationsRouter);

describe('Notifications API', () => {
  let adminUserId: string;
  let sellerUserId: string;
  let adminToken: string;
  let sellerToken: string;

  beforeAll(async () => {
    // Create test users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashed-password',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    adminUserId = admin.id;

    const seller = await prisma.user.create({
      data: {
        email: 'seller@test.com',
        password: 'hashed-password',
        name: 'Seller User',
        role: 'SELLER'
      }
    });
    sellerUserId = seller.id;

    // Generate JWT tokens
    adminToken = jwt.sign(
      { userId: adminUserId, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'default-dev-secret',
      { expiresIn: '7d' }
    );

    sellerToken = jwt.sign(
      { userId: sellerUserId, email: seller.email, role: seller.role },
      process.env.JWT_SECRET || 'default-dev-secret',
      { expiresIn: '7d' }
    );
  });

  describe('GET /api/notifications', () => {
    it('should return empty list for new user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications).toEqual([]);
    });

    it('should return user notifications ordered by createdAt', async () => {
      // Create notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: sellerUserId,
            title: 'First',
            message: 'First notification',
            type: 'info'
          },
          {
            userId: sellerUserId,
            title: 'Second',
            message: 'Second notification',
            type: 'warning'
          }
        ]
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body.notifications[0].title).toBe('Second'); // Most recent first
    });

    it('should filter unread notifications when unreadOnly=true', async () => {
      // Create mixed read/unread notifications
      const note1 = await prisma.notification.create({
        data: {
          userId: sellerUserId,
          title: 'Unread',
          message: 'Unread notification',
          type: 'info',
          read: false
        }
      });

      await prisma.notification.create({
        data: {
          userId: sellerUserId,
          title: 'Read',
          message: 'Read notification',
          type: 'info',
          read: true
        }
      });

      const res = await request(app)
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(1);
      expect(res.body.notifications[0].id).toBe(note1.id);
    });

    it('should reject requests without auth', async () => {
      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const note = await prisma.notification.create({
        data: {
          userId: sellerUserId,
          title: 'Test',
          message: 'Unread notification',
          type: 'info',
          read: false
        }
      });

      const res = await request(app)
        .put(`/api/notifications/${note.id}/read`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.notification.read).toBe(true);

      // Verify in DB
      const updated = await prisma.notification.findUnique({
        where: { id: note.id }
      });
      expect(updated?.read).toBe(true);
    });

    it('should not allow marking others notifications as read', async () => {
      const note = await prisma.notification.create({
        data: {
          userId: adminUserId,
          title: 'Admin Notification',
          message: 'This is for admin',
          type: 'info'
        }
      });

      const res = await request(app)
        .put(`/api/notifications/${note.id}/read`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent notification', async () => {
      const res = await request(app)
        .put('/api/notifications/non-existent-id/read')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      await prisma.notification.createMany({
        data: [
          {
            userId: sellerUserId,
            title: 'Notif 1',
            message: 'Test 1',
            type: 'info',
            read: false
          },
          {
            userId: sellerUserId,
            title: 'Notif 2',
            message: 'Test 2',
            type: 'info',
            read: false
          }
        ]
      });

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);

      // Verify all are marked read
      const unread = await prisma.notification.findMany({
        where: {
          userId: sellerUserId,
          read: false
        }
      });
      expect(unread).toHaveLength(0);
    });
  });

  describe('POST /api/notifications', () => {
    it('should create notification as admin', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: sellerUserId,
          title: 'Admin Created',
          message: 'Notification from admin',
          type: 'warning'
        });

      expect(res.status).toBe(201);
      expect(res.body.notification.userId).toBe(sellerUserId);
      expect(res.body.notification.read).toBe(false);
    });

    it('should reject notification creation from non-admin', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          userId: sellerUserId,
          title: 'Seller Created',
          message: 'This should fail',
          type: 'info'
        });

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: sellerUserId
          // missing required fields
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete own notification', async () => {
      const note = await prisma.notification.create({
        data: {
          userId: sellerUserId,
          title: 'To Delete',
          message: 'This will be deleted',
          type: 'info'
        }
      });

      const res = await request(app)
        .delete(`/api/notifications/${note.id}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);

      // Verify deleted
      const deleted = await prisma.notification.findUnique({
        where: { id: note.id }
      });
      expect(deleted).toBeNull();
    });

    it('should not allow deleting others notifications', async () => {
      const note = await prisma.notification.create({
        data: {
          userId: adminUserId,
          title: 'Admin Notification',
          message: 'Only admin can delete',
          type: 'info'
        }
      });

      const res = await request(app)
        .delete(`/api/notifications/${note.id}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);

      // Verify still exists
      const exists = await prisma.notification.findUnique({
        where: { id: note.id }
      });
      expect(exists).not.toBeNull();
    });
  });
});
