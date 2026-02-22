import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Track search query
router.post('/track', async (req, res) => {
  try {
    const { query, results, userId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    await prisma.searchAnalytics.create({
      data: {
        query: query.toLowerCase(),
        results: results || 0,
        userId: userId || null
      }
    });

    res.json({ message: 'Search tracked' });
  } catch (error) {
    console.error('Search tracking error:', error);
    res.status(500).json({ error: 'Failed to track search' });
  }
});

// Get search analytics (admin)
router.get('/analytics', async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);
    const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const searches = await prisma.searchAnalytics.findMany({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Group by query
    const grouped = searches.reduce((acc: any, search) => {
      if (!acc[search.query]) {
        acc[search.query] = { count: 0, totalResults: 0 };
      }
      acc[search.query].count++;
      acc[search.query].totalResults += search.results;
      return acc;
    }, {});

    // Sort by count
    const sorted = Object.entries(grouped)
      .map(([query, data]: any) => ({
        query,
        ...data,
        avgResults: Math.round(data.totalResults / data.count)
      }))
      .sort((a: any, b: any) => b.count - a.count);

    res.json({
      totalSearches: searches.length,
      uniqueQueries: Object.keys(grouped).length,
      topSearches: sorted.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
