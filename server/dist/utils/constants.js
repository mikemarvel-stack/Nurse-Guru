"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION_DEFAULTS = exports.PASSWORD_REGEX = exports.PASSWORD_MIN_LENGTH = exports.REFRESH_TOKEN_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.MIN_PAYOUT_AMOUNT = exports.COMMISSION_PERCENTAGE = exports.MAX_THUMBNAIL_SIZE_BYTES = exports.MAX_FILE_SIZE_BYTES = exports.ALLOWED_FILE_TYPES = exports.ORDER_STATUSES = exports.DOCUMENT_STATUSES = exports.USER_ROLES = exports.DOCUMENT_SUBJECTS = exports.DOCUMENT_LEVELS = exports.DOCUMENT_CATEGORIES = void 0;
exports.DOCUMENT_CATEGORIES = [
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
];
exports.DOCUMENT_LEVELS = [
    'high-school',
    'undergraduate',
    'graduate',
    'phd',
    'professional'
];
exports.DOCUMENT_SUBJECTS = [
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
];
exports.USER_ROLES = ['BUYER', 'SELLER', 'ADMIN'];
exports.DOCUMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
exports.ORDER_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
exports.ALLOWED_FILE_TYPES = [
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
exports.MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
exports.MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
exports.COMMISSION_PERCENTAGE = 0.15; // 15%
exports.MIN_PAYOUT_AMOUNT = 50; // $50
exports.JWT_EXPIRES_IN = '7d';
exports.REFRESH_TOKEN_EXPIRES_IN = '30d';
exports.PASSWORD_MIN_LENGTH = 8;
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // At least one uppercase, one lowercase, one number, min 8 chars
exports.PAGINATION_DEFAULTS = {
    page: 1,
    limit: 20,
    maxLimit: 100
};
//# sourceMappingURL=constants.js.map