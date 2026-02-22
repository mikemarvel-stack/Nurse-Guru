export declare const DOCUMENT_CATEGORIES: readonly ["research-papers", "theses", "essays", "case-studies", "presentations", "study-guides", "lab-reports", "dissertations", "textbooks", "notes", "nclex-prep", "care-plans", "drug-cards"];
export declare const DOCUMENT_LEVELS: readonly ["high-school", "undergraduate", "graduate", "phd", "professional"];
export declare const DOCUMENT_SUBJECTS: readonly ["nursing", "anatomy", "pharmacology", "pathology", "microbiology", "physiology", "biochemistry", "immunology", "psychology", "nutrition", "nursing-research", "critical-care", "pediatrics", "obstetrics", "psychiatry", "surgery", "internal-medicine", "ethics", "communication", "leadership"];
export declare const USER_ROLES: readonly ["BUYER", "SELLER", "ADMIN"];
export declare const DOCUMENT_STATUSES: readonly ["PENDING", "APPROVED", "REJECTED"];
export declare const ORDER_STATUSES: readonly ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
export declare const ALLOWED_FILE_TYPES: string[];
export declare const MAX_FILE_SIZE_BYTES: number;
export declare const MAX_THUMBNAIL_SIZE_BYTES: number;
export declare const COMMISSION_PERCENTAGE = 0.15;
export declare const MIN_PAYOUT_AMOUNT = 50;
export declare const JWT_EXPIRES_IN = "7d";
export declare const REFRESH_TOKEN_EXPIRES_IN = "30d";
export declare const PASSWORD_MIN_LENGTH = 8;
export declare const PASSWORD_REGEX: RegExp;
export declare const PAGINATION_DEFAULTS: {
    page: number;
    limit: number;
    maxLimit: number;
};
//# sourceMappingURL=constants.d.ts.map