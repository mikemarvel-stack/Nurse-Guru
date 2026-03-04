"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const index_1 = require("../index");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const contactMessageSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(5),
    message: zod_1.z.string().min(10),
    type: zod_1.z.enum(['general', 'support', 'sales', 'bug']).optional()
});
// Submit contact form (rate limited)
router.post('/', rateLimit_1.apiLimiter, async (req, res) => {
    try {
        const data = contactMessageSchema.parse(req.body);
        // Store in database
        const contact = await index_1.prisma.contact.create({
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
            const admins = await index_1.prisma.user.findMany({ where: { role: 'ADMIN' } });
            if (admins && admins.length > 0) {
                const notifications = admins.map(a => ({
                    userId: a.id,
                    title: 'New contact message',
                    message: `Contact from ${data.name} <${data.email}>: ${data.subject}`,
                    type: 'contact'
                }));
                await index_1.prisma.notification.createMany({ data: notifications });
                // Emit real-time notifications to connected admins
                try {
                    const { getIo } = await Promise.resolve().then(() => __importStar(require('../socket')));
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
                }
                catch (emitErr) {
                    console.error('Failed to emit socket notifications for contact message:', emitErr);
                }
            }
        }
        catch (notifyErr) {
            console.error('Failed to create admin notifications for contact message:', notifyErr);
        }
        res.status(201).json({
            message: 'Thank you for your message. We will get back to you soon.',
            contactId: contact.id
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});
// Get contact messages (admin only)
router.get('/', async (req, res) => {
    try {
        const messages = await index_1.prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json({ messages });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map