import { useEffect } from 'react';
import type { SEOData } from '@/types';

interface SEOProps {
  data: SEOData;
}

export function SEO({ data }: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = data.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    updateMetaTag('description', data.description);
    updateMetaTag('keywords', data.keywords.join(', '));

    // Open Graph meta tags
    updateMetaTag('og:title', data.title, true);
    updateMetaTag('og:description', data.description, true);
    updateMetaTag('og:type', 'website', true);
    if (data.ogImage) {
      updateMetaTag('og:image', data.ogImage, true);
    }
    if (data.canonicalUrl) {
      updateMetaTag('og:url', data.canonicalUrl, true);
    }

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', data.title);
    updateMetaTag('twitter:description', data.description);
    if (data.ogImage) {
      updateMetaTag('twitter:image', data.ogImage);
    }

    // Canonical URL
    if (data.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = data.canonicalUrl;
    }

    // Structured Data (JSON-LD)
    if (data.structuredData) {
      let script = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data.structuredData);
    }

    // Cleanup function
    return () => {
      // Optional: Remove structured data on unmount
      const script = document.querySelector('#structured-data');
      if (script) {
        script.remove();
      }
    };
  }, [data]);

  return null;
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: (): SEOData => ({
    title: 'Nurse Guru - Nursing Study Materials & NCLEX Prep | Buy & Sell',
    description: 'The premier marketplace for nursing students. Buy and sell study notes, care plans, NCLEX prep materials, drug cards, and more. Trusted by 25,000+ nursing students worldwide.',
    keywords: [
      'nursing study materials',
      'NCLEX prep',
      'nursing notes',
      'care plans',
      'nursing school',
      'nurse study guides',
      'pharmacology notes',
      'nursing flashcards',
      'nursing students',
      'RN study materials'
    ],
    ogImage: 'https://nurseguru.com/og-image.jpg',
    canonicalUrl: 'https://nurseguru.com',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Nurse Guru',
      description: 'The premier marketplace for nursing study materials',
      url: 'https://nurseguru.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://nurseguru.com/browse?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  }),

  browse: (filters?: { category?: string; subject?: string; search?: string; tags?: string[] }): SEOData => {
    const hasSearch = filters?.search && filters.search.length > 0;
    const hasTags = filters?.tags && filters.tags.length > 0;
    
    let title = 'Browse Nursing Study Materials - NCLEX Prep & Notes | Nurse Guru';
    let description = 'Browse thousands of nursing study materials including NCLEX prep, care plans, drug cards, and more. Filter by category, subject, and price.';
    const keywords = ['browse nursing materials', 'nursing study resources', 'NCLEX materials', 'nursing notes for sale', 'nursing school resources'];

    if (hasSearch) {
      title = `${filters.search} - Nursing Study Materials | Nurse Guru`;
      description = `Find ${filters.search} nursing materials. Browse study guides, notes, and resources for ${filters.search}.`;
      keywords.push(filters.search!, `${filters.search} nursing`, `${filters.search} study materials`);
    } else if (filters?.category) {
      const cat = formatCategory(filters.category);
      title = `${cat} - Browse Nursing Materials | Nurse Guru`;
      description = `Browse our collection of ${cat.toLowerCase()}. Find high-quality nursing study materials from verified sellers.`;
      keywords.push(filters.category, cat, `nursing ${cat.toLowerCase()}`);
    } else if (filters?.subject) {
      title = `${filters.subject} Materials - Browse | Nurse Guru`;
      description = `Browse ${filters.subject} nursing materials. Study guides, notes, and resources for ${filters.subject}.`;
      keywords.push(filters.subject, `${filters.subject} nursing`, `${filters.subject} study guide`);
    }

    if (hasTags) {
      keywords.push(...filters.tags!);
      const tagStr = filters.tags!.slice(0, 3).join(', ');
      description += ` Tags: ${tagStr}.`;
    }

    return {
      title,
      description: description.slice(0, 160),
      keywords: keywords.filter(Boolean),
      canonicalUrl: hasSearch ? undefined : 'https://nurseguru.com/browse',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: hasSearch ? `${filters.search} Nursing Materials` : 'Browse Nursing Materials',
        description: description.slice(0, 160)
      }
    };
  },

  document: (doc: { 
    id: string;
    title: string; 
    description: string; 
    category: string; 
    subject: string;
    tags?: string[];
    price?: number;
    rating?: number;
    reviewCount?: number;
    seller?: { name: string };
  }): SEOData => {
    const keywords = [
      doc.subject,
      doc.category,
      formatCategory(doc.category),
      'nursing material',
      'study guide',
      'nursing school',
      `${doc.subject} nursing`,
      ...(doc.tags || [])
    ];

    return {
      title: `${doc.title} | ${doc.subject} | Nurse Guru`,
      description: doc.description.slice(0, 160),
      keywords,
      canonicalUrl: `https://nurseguru.com/document/${doc.id}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: doc.title,
        description: doc.description,
        category: formatCategory(doc.category),
        brand: { '@type': 'Brand', name: 'Nurse Guru' },
        offers: {
          '@type': 'Offer',
          price: doc.price || 0,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          seller: doc.seller ? { '@type': 'Person', name: doc.seller.name } : undefined
        },
        aggregateRating: doc.rating && doc.reviewCount ? {
          '@type': 'AggregateRating',
          ratingValue: doc.rating,
          reviewCount: doc.reviewCount
        } : undefined
      }
    };
  },

  seller: (): SEOData => ({
    title: 'Sell Your Nursing Materials | Become a Seller on Nurse Guru',
    description: 'Start selling your nursing study materials on Nurse Guru. Reach thousands of nursing students. Easy upload process, competitive fees, and instant payments.',
    keywords: [
      'sell nursing notes',
      'nursing study marketplace',
      'sell NCLEX prep',
      'become nursing tutor',
      'monetize nursing knowledge',
      'nursing student seller'
    ],
    canonicalUrl: 'https://nurseguru.com/seller',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Sell on Nurse Guru',
      description: 'Become a seller and monetize your nursing study materials'
    }
  }),

  login: (): SEOData => ({
    title: 'Sign In - Nurse Guru',
    description: 'Sign in to your Nurse Guru account to access your purchases, downloads, and seller dashboard.',
    keywords: ['login', 'sign in', 'nursing marketplace login'],
    canonicalUrl: 'https://nurseguru.com/login'
  }),

  register: (): SEOData => ({
    title: 'Create Account - Nurse Guru',
    description: 'Create your Nurse Guru account. Start buying and selling nursing study materials today.',
    keywords: ['register', 'sign up', 'create account', 'join nurse guru'],
    canonicalUrl: 'https://nurseguru.com/register'
  }),

  cart: (): SEOData => ({
    title: 'Shopping Cart - Nurse Guru',
    description: 'Review your selected nursing materials and proceed to checkout.',
    keywords: ['shopping cart', 'checkout', 'nursing materials cart'],
    canonicalUrl: 'https://nurseguru.com/cart'
  })
};

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
