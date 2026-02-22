// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  balance: number;
  createdAt: Date;
  totalSales: number;
  totalPurchases: number;
}

// Document Types
export type DocumentCategory = 
  | 'research-papers'
  | 'theses'
  | 'essays'
  | 'case-studies'
  | 'presentations'
  | 'study-guides'
  | 'lab-reports'
  | 'dissertations'
  | 'textbooks'
  | 'notes'
  | 'nclex-prep'
  | 'care-plans'
  | 'drug-cards';

export type DocumentLevel = 
  | 'high-school'
  | 'undergraduate'
  | 'graduate'
  | 'phd'
  | 'professional';

export interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  level: DocumentLevel;
  subject: string;
  price: number;
  originalPrice?: number;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  wordCount?: number;
  previewPages: number;
  thumbnailUrl: string;
  sellerId: string;
  seller: User;
  rating: number;
  reviewCount: number;
  salesCount: number;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
  isBestseller?: boolean;
}

// Order Types
export interface Order {
  id: string;
  buyerId: string;
  documentId: string;
  document: Document;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  downloadCount: number;
  maxDownloads: number;
}

// Review Types
export interface Review {
  id: string;
  documentId: string;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Cart Types
export interface CartItem {
  document: Document;
  addedAt: Date;
}

// Upload Types
export interface UploadFormData {
  title: string;
  description: string;
  category: DocumentCategory;
  level: DocumentLevel;
  subject: string;
  price: number;
  file: File | null;
  tags: string[];
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

// Filter Types
export interface DocumentFilters {
  category?: DocumentCategory;
  level?: DocumentLevel;
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
  search?: string;
}

// Stats Types
export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalDownloads: number;
  averageRating: number;
  pendingUploads: number;
  recentOrders: Order[];
  topDocuments: Document[];
}
