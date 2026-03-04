"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.paymentLimiter = exports.registerLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiter for authentication endpoints
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: { error: 'Too many login attempts, please try again later' },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter for registration
exports.registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: { error: 'Too many accounts created, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter for payment endpoints
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many payment requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiter for file uploads
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Too many upload requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.default = exports.apiLimiter;
//# sourceMappingURL=rateLimit.js.map