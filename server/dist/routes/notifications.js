"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    title: zod_1.z.string(),
    message: zod_1.z.string(),
    type: zod_1.z.enum(['info', 'warning', 'error', 'success']).optional()
});
// Get user notifications
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { unreadOnly } = req.query;
        const notifications = await index_1.prisma.notification.findMany({
            where: {
                userId: req.user.id,
                ...(unreadOnly === 'true' && { read: false })
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ notifications });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Mark notification as read
router.put('/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        const notification = await index_1.prisma.notification.findUnique({
            where: { id: req.params.id }
        });
        if (!notification || notification.userId !== req.user.id) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updated = await index_1.prisma.notification.update({
            where: { id: req.params.id },
            data: { read: true }
        });
        res.json({ notification: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});
// Mark all as read
router.put('/read-all', auth_1.authenticate, async (req, res) => {
    try {
        await index_1.prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                read: false
            },
            data: { read: true }
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});
// Create notification (admin only - internal use)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { userId, title, message, type } = createNotificationSchema.parse(req.body);
        const notification = await index_1.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || 'info'
            }
        });
        res.status(201).json({ notification });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to create notification' });
    }
});
// Delete notification
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const notification = await index_1.prisma.notification.findUnique({
            where: { id: req.params.id }
        });
        if (!notification || notification.userId !== req.user.id) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await index_1.prisma.notification.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map