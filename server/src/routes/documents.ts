import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireSeller } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const createDocumentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  level: z.string(),
  subject: z.string(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileName: z.string(),
  pageCount: z.number().optional(),
  wordCount: z.number().optional(),
  previewPages: z.number().default(5),
  thumbnailUrl: z.string().optional(),
  tags: z.array(z.string())
});

// Get all documents with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      subject,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'newest',
      page = '1',
      limit = '20'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { status: 'APPROVED' };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) where.category = category;
    if (level) where.level = level;
    if (subject) where.subject = { contains: subject as string, mode: 'insensitive' };
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    if (minRating) where.rating = { gte: parseFloat(minRating as string) };

    const orderBy: any = {};
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
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create document (seller only)
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res) => {
  try {
    const data = createDocumentSchema.parse(req.body);

    const document = await prisma.document.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        sellerId: req.user!.id,
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document (seller only, own documents)
router.put('/:id', authenticate, requireSeller, async (req: AuthRequest, res) => {
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

    if (existing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document (seller only, own documents)
router.delete('/:id', authenticate, requireSeller, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.document.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (existing.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.document.delete({ where: { id } });

    res.json({ message: 'Document deleted' });
  } catch (error) {
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

export default router;
