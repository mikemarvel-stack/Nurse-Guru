"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get user's orders
router.get('/my-orders', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { buyerId: req.user.id },
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
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ orders });
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Get seller's orders
router.get('/seller-orders', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                document: {
                    sellerId: req.user.id
                }
            },
            include: {
                document: true,
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch seller orders' });
    }
});
// Get single order
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
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
                },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Check authorization
        if (order.buyerId !== req.user.id && order.document.sellerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
// Download document
router.get('/:id/download', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: { document: true }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.buyerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (order.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Order not completed' });
        }
        if (order.downloadCount >= order.maxDownloads) {
            return res.status(400).json({ error: 'Download limit exceeded' });
        }
        const filePath = path_1.default.join(__dirname, '../../../uploads', order.document.fileUrl);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        // Increment download count
        await prisma.order.update({
            where: { id },
            data: { downloadCount: { increment: 1 } }
        });
        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${order.document.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        const fileStream = fs_1.default.createReadStream(filePath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});
// Create order (after payment)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { documentId, paymentIntentId } = req.body;
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Check if already purchased
        const existingOrder = await prisma.order.findFirst({
            where: {
                buyerId: req.user.id,
                documentId,
                status: 'COMPLETED'
            }
        });
        if (existingOrder) {
            return res.status(400).json({ error: 'Already purchased' });
        }
        const order = await prisma.order.create({
            data: {
                buyerId: req.user.id,
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
        res.status(201).json({
            message: 'Order completed successfully',
            order
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Get order stats for seller
router.get('/stats/seller', auth_1.authenticate, async (req, res) => {
    try {
        const [totalSales, totalRevenue, totalDownloads] = await Promise.all([
            prisma.order.count({
                where: {
                    document: { sellerId: req.user.id },
                    status: 'COMPLETED'
                }
            }),
            prisma.order.aggregate({
                where: {
                    document: { sellerId: req.user.id },
                    status: 'COMPLETED'
                },
                _sum: { amount: true }
            }),
            prisma.order.aggregate({
                where: {
                    document: { sellerId: req.user.id },
                    status: 'COMPLETED'
                },
                _sum: { downloadCount: true }
            })
        ]);
        const topDocuments = await prisma.document.findMany({
            where: { sellerId: req.user.id },
            orderBy: { salesCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                price: true,
                salesCount: true
            }
        });
        res.json({
            stats: {
                totalSales,
                totalRevenue: totalRevenue._sum.amount || 0,
                totalDownloads: totalDownloads._sum.downloadCount || 0,
                topDocuments
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map