# SEO Improvements for Documents and Tags

## Overview
Enhanced SEO capabilities for the Nurse Guru marketplace with focus on document discovery, tag-based search, and search engine optimization.

## Backend Improvements

### 1. New SEO Routes (`server/src/routes/seo.ts`)
- **GET /api/seo/sitemap.xml** - Dynamic XML sitemap generation
- **GET /api/seo/tags/popular** - Returns top 50 popular tags by sales
- **GET /api/seo/trending** - Returns trending subjects/searches

### 2. Enhanced Document Search (`server/src/routes/documents.ts`)
- Added tag-based filtering support
- Search now includes tags in query
- Support for multiple tag filters with AND logic
- Tags are searchable in the main search field

## Frontend Improvements

### 1. Enhanced SEO Component (`client/src/components/seo/SEO.tsx`)

#### Updated `browse()` config:
- Dynamic title/description based on search query
- Tag-aware SEO metadata
- Search-specific structured data
- Keywords include search terms and tags

#### Updated `document()` config:
- Includes document tags in keywords
- Enhanced structured data with:
  - Product pricing and availability
  - Seller information
  - Aggregate ratings
  - Brand information

### 2. New Components

#### PopularTags (`client/src/components/PopularTags.tsx`)
- Displays top 20 popular tags
- Clickable tags link to filtered browse page
- Improves internal linking for SEO
- Helps users discover content

#### TrendingSearches (`client/src/components/TrendingSearches.tsx`)
- Shows trending subjects by sales
- Links to subject-filtered browse page
- Provides social proof
- Enhances content discoverability

### 3. Updated Browse Page (`client/src/pages/Browse.tsx`)
- Integrated PopularTags and TrendingSearches components
- Tag filtering from URL parameters
- Enhanced SEO metadata with search context
- Better internal linking structure

### 4. Updated Document Detail Page (`client/src/pages/DocumentDetail.tsx`)
- Enhanced SEO with full document metadata
- Tags included in structured data
- Better product schema markup

## SEO Features

### Meta Tags
- Dynamic title tags with search context
- Optimized meta descriptions (160 chars)
- Keyword tags including document tags
- Open Graph tags for social sharing
- Twitter Card support

### Structured Data (JSON-LD)
- WebSite schema with SearchAction
- CollectionPage for browse pages
- Product schema for documents with:
  - Pricing information
  - Availability status
  - Seller details
  - Aggregate ratings

### Sitemap
- Dynamic XML sitemap at `/api/seo/sitemap.xml`
- Includes all approved documents
- Priority and change frequency metadata
- Last modified dates

### Robots.txt
- Located at `/client/public/robots.txt`
- Allows crawling of public pages
- Blocks admin and user-specific pages
- References sitemap location

## Tag-Based Search

### URL Parameters
- `?tags=tag1` - Single tag filter
- `?tags=tag1&tags=tag2` - Multiple tags (AND logic)
- `?search=query` - Searches titles, descriptions, subjects, and tags

### Backend Query
```typescript
// Multiple tags with AND logic
if (tags) {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  where.AND = tagArray.map(tag => ({
    tags: { contains: tag as string, mode: 'insensitive' }
  }));
}

// Search includes tags
if (search) {
  where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { subject: { contains: search, mode: 'insensitive' } },
    { tags: { contains: search, mode: 'insensitive' } }
  ];
}
```

## Benefits

### For Users
- Easier content discovery through tags
- Trending topics visibility
- Better search results
- Related content suggestions

### For SEO
- Rich structured data for search engines
- Dynamic sitemaps for better indexing
- Keyword-optimized pages
- Internal linking structure
- Social media optimization

### For Business
- Increased organic traffic
- Better conversion rates
- Improved user engagement
- Enhanced content discoverability

## Usage Examples

### Search by Tag
```
/browse?tags=NCLEX
/browse?tags=pharmacology&tags=study-guide
```

### Search with Keywords
```
/browse?search=cardiac nursing
/browse?search=pediatrics&category=study-guides
```

### API Endpoints
```bash
# Get popular tags
curl https://nurseguru.com/api/seo/tags/popular

# Get trending searches
curl https://nurseguru.com/api/seo/trending

# Get sitemap
curl https://nurseguru.com/api/seo/sitemap.xml
```

## Performance Considerations

- Sitemap cached for 1 hour (recommended)
- Popular tags updated every 15 minutes (recommended)
- Trending searches updated hourly (recommended)
- All queries use database indexes

## Future Enhancements

1. **Tag Autocomplete** - Suggest tags as users type
2. **Tag Cloud** - Visual representation of tag popularity
3. **Related Tags** - Show related tags on document pages
4. **Tag Analytics** - Track tag performance and conversions
5. **SEO Dashboard** - Monitor search rankings and traffic
6. **Schema Markup Validation** - Automated testing
7. **Canonical URLs** - Prevent duplicate content issues
8. **Breadcrumb Schema** - Enhanced navigation markup
