import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Generate sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { status: 'APPROVED' },
      select: { id: true, updatedAt: true }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nurseguru.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://nurseguru.com/browse</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${documents.map(doc => `<url>
    <loc>https://nurseguru.com/document/${doc.id}</loc>
    <lastmod>${doc.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Get popular tags
router.get('/tags/popular', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { status: 'APPROVED' },
      select: { tags: true, salesCount: true }
    });

    const tagCounts: Record<string, number> = {};
    documents.forEach(doc => {
      const tags = typeof doc.tags === 'string' ? JSON.parse(doc.tags) : doc.tags;
      if (Array.isArray(tags)) {
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + doc.salesCount + 1;
        });
      }
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ tags: popularTags });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get trending searches
router.get('/trending', async (req, res) => {
  try {
    const trending = await prisma.document.groupBy({
      by: ['subject'],
      where: { status: 'APPROVED' },
      _count: { id: true },
      _sum: { salesCount: true },
      orderBy: { _sum: { salesCount: 'desc' } },
      take: 10
    });

    res.json({ 
      trending: trending.map(t => ({ 
        term: t.subject, 
        count: t._sum.salesCount || 0 
      })) 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

export default router;
