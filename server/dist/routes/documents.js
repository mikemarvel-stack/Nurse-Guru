"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const createDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    category: zod_1.z.string(),
    level: zod_1.z.string(),
    subject: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    originalPrice: zod_1.z.number().positive().optional(),
    fileUrl: zod_1.z.string(),
    fileType: zod_1.z.string(),
    fileSize: zod_1.z.number(),
    fileName: zod_1.z.string(),
    pageCount: zod_1.z.number().optional(),
    wordCount: zod_1.z.number().optional(),
    previewPages: zod_1.z.number().default(5),
    thumbnailUrl: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string())
});
// Get all documents with filters
router.get('/', async (req, res) => {
    try {
        const { search, category, level, subject, minPrice, maxPrice, minRating, sortBy = 'newest', page = '1', limit = '20' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const where = { status: 'APPROVED' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category)
            where.category = category;
        if (level)
            where.level = level;
        if (subject)
            where.subject = { contains: subject, mode: 'insensitive' };
        if (minPrice)
            where.price = { ...where.price, gte: parseFloat(minPrice) };
        if (maxPrice)
            where.price = { ...where.price, lte: parseFloat(maxPrice) };
        if (minRating)
            where.rating = { gte: parseFloat(minRating) };
        const orderBy = {};
        switch (sortBy) {
            case 'price-low':
                orderBy.price = 'asc';
                break;
            case 'price-high':
                orderBy.price = 'desc';
                break;
            case 'rating':
                orderBy.rating = 'desc';
                break;
            case 'popular':
                orderBy.salesCount = 'desc';
                break;
            case 'newest':
            default:
                orderBy.createdAt = 'desc';
        }
        const [documents, total] = await Promise.all([
            prisma.document.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    },
                    _count: {
                        select: { reviews: true }
                    }
                }
            }),
            prisma.document.count({ where })
        ]);
        res.json({
            documents,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                pages: Math.ceil(total / take)
            }
        });
    }
    catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
// Get featured documents
router.get('/featured', async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { status: 'APPROVED', isFeatured: true },
            take: 8,
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ documents });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured documents' });
    }
});
// Get bestseller documents
router.get('/bestsellers', async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { status: 'APPROVED', isBestseller: true },
            take: 8,
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { salesCount: 'desc' }
        });
        res.json({ documents });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch bestsellers' });
    }
});
// Get single document
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        createdAt: true
                    }
                },
                reviews: {
                    take: 5,
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
                }
            }
        });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Get related documents
        const relatedDocuments = await prisma.document.findMany({
            where: {
                status: 'APPROVED',
                category: document.category,
                id: { not: document.id }
            },
            take: 3,
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        res.json({ document, relatedDocuments });
    }
    catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});
// Create document (seller only)
router.post('/', auth_1.authenticate, auth_1.requireSeller, async (req, res) => {
    try {
        const data = createDocumentSchema.parse(req.body);
        const document = await prisma.document.create({
            data: {
                ...data,
                tags: JSON.stringify(data.tags),
                sellerId: req.user.id,
                status: 'PENDING' // Requires admin approval
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Document uploaded successfully. Pending approval.',
            document
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Failed to create document' });
    }
});
// Update document (seller only, own documents)
router.put('/:id', auth_1.authenticate, auth_1.requireSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const data = createDocumentSchema.partial().parse(req.body);
        // Check ownership
        const existing = await prisma.document.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Document not found' });
        }
        if (existing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const document = await prisma.document.update({
            where: { id },
            data: {
                ...data,
                tags: data.tags ? JSON.stringify(data.tags) : undefined
            }
        });
        res.json({ message: 'Document updated', document });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to update document' });
    }
});
// Delete document (seller only, own documents)
router.delete('/:id', auth_1.authenticate, auth_1.requireSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.document.findUnique({
            where: { id }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Document not found' });
        }
        if (existing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await prisma.document.delete({ where: { id } });
        res.json({ message: 'Document deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
});
// Get categories
router.get('/meta/categories', (req, res) => {
    const categories = [
        { value: 'study-guides', label: 'Study Guides', description: 'Comprehensive nursing study materials' },
        { value: 'care-plans', label: 'Care Plans', description: 'Nursing care plans and assessments' },
        { value: 'drug-cards', label: 'Drug Cards', description: 'Pharmacology flashcards and references' },
        { value: 'nclex-prep', label: 'NCLEX Prep', description: 'NCLEX-RN and NCLEX-PN preparation' },
        { value: 'case-studies', label: 'Case Studies', description: 'Clinical case studies and analyses' },
        { value: 'lab-reports', label: 'Lab Values', description: 'Lab interpretation guides' },
        { value: 'notes', label: 'Class Notes', description: 'Nursing school lecture notes' },
        { value: 'presentations', label: 'Presentations', description: 'PowerPoint slides and templates' },
        { value: 'theses', label: 'Research Papers', description: 'Nursing research and EBP papers' },
        { value: 'textbooks', label: 'Study Aids', description: 'Quick reference guides and cheat sheets' }
    ];
    res.json({ categories });
});
// Get levels
router.get('/meta/levels', (req, res) => {
    const levels = [
        { value: 'high-school', label: 'Pre-Nursing' },
        { value: 'undergraduate', label: 'BSN Student' },
        { value: 'graduate', label: 'RN/ADN' },
        { value: 'phd', label: 'MSN/NP' },
        { value: 'professional', label: 'Professional' }
    ];
    res.json({ levels });
});
// Get subjects
router.get('/meta/subjects', (req, res) => {
    const subjects = [
        'Fundamentals',
        'Medical-Surgical',
        'Pediatrics',
        'Maternity',
        'Psychiatric',
        'Pharmacology',
        'Pathophysiology',
        'Health Assessment',
        'Leadership',
        'Community Health',
        'Critical Care',
        'Emergency',
        'Geriatrics',
        'Nutrition',
        'Anatomy & Physiology'
    ];
    res.json({ subjects });
});
exports.default = router;
//# sourceMappingURL=documents.js.map