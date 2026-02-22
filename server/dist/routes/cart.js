"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get cart items
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
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
        const total = cartItems.reduce((sum, item) => sum + item.document.price, 0);
        res.json({ items: cartItems, total });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});
// Add to cart
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { documentId } = req.body;
        // Check if document exists and is approved
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        if (document.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Document not available' });
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
        // Check if already in cart
        const existingCartItem = await prisma.cartItem.findUnique({
            where: {
                userId_documentId: {
                    userId: req.user.id,
                    documentId
                }
            }
        });
        if (existingCartItem) {
            return res.status(400).json({ error: 'Already in cart' });
        }
        const cartItem = await prisma.cartItem.create({
            data: {
                userId: req.user.id,
                documentId
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
        res.status(201).json({
            message: 'Added to cart',
            item: cartItem
        });
    }
    catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});
// Remove from cart
router.delete('/:documentId', auth_1.authenticate, async (req, res) => {
    try {
        const { documentId } = req.params;
        await prisma.cartItem.delete({
            where: {
                userId_documentId: {
                    userId: req.user.id,
                    documentId
                }
            }
        });
        res.json({ message: 'Removed from cart' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});
// Clear cart
router.delete('/', auth_1.authenticate, async (req, res) => {
    try {
        await prisma.cartItem.deleteMany({
            where: { userId: req.user.id }
        });
        res.json({ message: 'Cart cleared' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});
// Check if item is in cart
router.get('/check/:documentId', auth_1.authenticate, async (req, res) => {
    try {
        const { documentId } = req.params;
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                userId_documentId: {
                    userId: req.user.id,
                    documentId
                }
            }
        });
        res.json({ inCart: !!cartItem });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check cart' });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map