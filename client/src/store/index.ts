export { useAuthStore } from './apiStore';
export { useDocumentStore } from './apiStore';
export { useOrderStore } from './apiStore';
export { useCartStore } from './apiStore';
export { usePaymentStore } from './apiStore';

// Constants for filters
export const documentCategories = [
  { value: 'research-papers', label: 'Research Papers' },
  { value: 'theses', label: 'Theses' },
  { value: 'essays', label: 'Essays' },
  { value: 'case-studies', label: 'Case Studies' },
  { value: 'presentations', label: 'Presentations' },
  { value: 'study-guides', label: 'Study Guides' },
  { value: 'lab-reports', label: 'Lab Reports' },
  { value: 'dissertations', label: 'Dissertations' },
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'notes', label: 'Notes' },
  { value: 'nclex-prep', label: 'NCLEX Prep' },
  { value: 'care-plans', label: 'Care Plans' },
  { value: 'drug-cards', label: 'Drug Cards' }
];

export const documentLevels = [
  { value: 'high-school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' }
];

export const subjects = [
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
