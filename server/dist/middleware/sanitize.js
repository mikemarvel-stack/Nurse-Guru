"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
// Sanitize strings to prevent XSS
const sanitizeString = (str) => {
    if (typeof str !== 'string')
        return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
};
// Recursively sanitize all string values in an object
const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }
    return sanitizeString(obj);
};
const sanitizeInput = (req, res, next) => {
    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
exports.default = exports.sanitizeInput;
//# sourceMappingURL=sanitize.js.map