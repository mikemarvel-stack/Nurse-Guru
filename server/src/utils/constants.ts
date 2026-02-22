export const DOCUMENT_CATEGORIES = [
  'research-papers',
  'theses',
  'essays',
  'case-studies',
  'presentations',
  'study-guides',
  'lab-reports',
  'dissertations',
  'textbooks',
  'notes',
  'nclex-prep',
  'care-plans',
  'drug-cards'
] as const;

export const DOCUMENT_LEVELS = [
  'high-school',
  'undergraduate',
  'graduate',
  'phd',
  'professional'
] as const;

export const DOCUMENT_SUBJECTS = [
  'nursing',
  'anatomy',
  'pharmacology',
  'pathology',
  'microbiology',
  'physiology',
  'biochemistry',
  'immunology',
  'psychology',
  'nutrition',
  'nursing-research',
  'critical-care',
  'pediatrics',
  'obstetrics',
  'psychiatry',
  'surgery',
  'internal-medicine',
  'ethics',
  'communication',
  'leadership'
] as const;

export const USER_ROLES = ['BUYER', 'SELLER', 'ADMIN'] as const;

export const DOCUMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const ORDER_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const COMMISSION_PERCENTAGE = 0.15; // 15%
export const MIN_PAYOUT_AMOUNT = 50; // $50

export const JWT_EXPIRES_IN = '7d';
export const REFRESH_TOKEN_EXPIRES_IN = '30d';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // At least one uppercase, one lowercase, one number, min 8 chars

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100
};
