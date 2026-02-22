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

  browse: (filters?: { category?: string; subject?: string }): SEOData => ({
    title: filters?.category 
      ? `${formatCategory(filters.category)} - Browse Nursing Materials | Nurse Guru`
      : filters?.subject
      ? `${filters.subject} Materials - Browse | Nurse Guru`
      : 'Browse Nursing Study Materials - NCLEX Prep & Notes | Nurse Guru',
    description: filters?.category
      ? `Browse our collection of ${formatCategory(filters.category).toLowerCase()}. Find high-quality nursing study materials from verified sellers.`
      : 'Browse thousands of nursing study materials including NCLEX prep, care plans, drug cards, and more. Filter by category, subject, and price.',
    keywords: [
      'browse nursing materials',
      'nursing study resources',
      'NCLEX materials',
      'nursing notes for sale',
      'nursing school resources',
      filters?.category || '',
      filters?.subject || ''
    ].filter(Boolean),
    canonicalUrl: 'https://nurseguru.com/browse',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Browse Nursing Materials',
      description: 'Collection of nursing study materials for sale'
    }
  }),

  document: (doc: { title: string; description: string; category: string; subject: string }): SEOData => ({
    title: `${doc.title} | Nurse Guru`,
    description: doc.description.slice(0, 160),
    keywords: [
      doc.subject,
      doc.category,
      'nursing material',
      'study guide',
      'nursing school',
      'NCLEX prep'
    ],
    canonicalUrl: `https://nurseguru.com/document/${doc.title.toLowerCase().replace(/\s+/g, '-')}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: doc.title,
      description: doc.description,
      category: doc.category,
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock'
      }
    }
  }),

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
