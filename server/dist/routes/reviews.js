"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const createReviewSchema = zod_1.z.object({
    documentId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional()
});
const updateReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5).optional(),
    comment: zod_1.z.string().optional()
});
// Create review for a document
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { documentId, rating, comment } = createReviewSchema.parse(req.body);
        // Check if document exists
        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Check if user has purchased this document
        const order = await prisma.order.findFirst({
            where: {
                buyerId: req.user.id,
                documentId,
                status: 'COMPLETED'
            }
        });
        if (!order) {
            return res.status(403).json({ error: 'You must purchase the document before reviewing it' });
        }
        // Check if user already reviewed
        const existingReview = await prisma.review.findFirst({
            where: {
                documentId,
                userId: req.user.id
            }
        });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this document' });
        }
        // Create review
        const review = await prisma.review.create({
            data: {
                documentId,
                userId: req.user.id,
                rating,
                comment: comment || ''
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        // Update document rating average
        const reviews = await prisma.review.findMany({
            where: { documentId }
        });
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await prisma.document.update({
            where: { id: documentId },
            data: { rating: averageRating }
        });
        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Review creation error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});
// Get reviews for a document
router.get('/document/:documentId', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { documentId: req.params.documentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ reviews });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
// Get user's reviews
router.get('/user/reviews', auth_1.authenticate, async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { userId: req.user.id },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ reviews });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});
// Update review
router.put('/:reviewId', auth_1.authenticate, async (req, res) => {
    try {
        const { rating, comment } = updateReviewSchema.parse(req.body);
        // Check if review exists and is owned by user
        const review = await prisma.review.findUnique({
            where: { id: req.params.reviewId }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }
        // Update review
        const updatedReview = await prisma.review.update({
            where: { id: req.params.reviewId },
            data: {
                ...(rating && { rating }),
                ...(comment !== undefined && { comment })
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        res.json({ message: 'Review updated', review: updatedReview });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to update review' });
    }
});
// Delete review
router.delete('/:reviewId', auth_1.authenticate, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { id: req.params.reviewId }
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        if (review.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }
        await prisma.review.delete({
            where: { id: req.params.reviewId }
        });
        res.json({ message: 'Review deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map