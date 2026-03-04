"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireSeller = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new errors_1.UnauthorizedError('Authentication required');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret.length < 32) {
            logger_1.default.error('JWT_SECRET is not properly configured');
            throw new Error('Server configuration error');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Verify user still exists
        const user = await index_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true }
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error instanceof errors_1.UnauthorizedError) {
            return res.status(401).json({ error: error.message });
        }
        logger_1.default.error('Authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
const requireSeller = (req, res, next) => {
    if (req.user?.role !== 'SELLER' && req.user?.role !== 'ADMIN') {
        throw new errors_1.ForbiddenError('Seller access required');
    }
    next();
};
exports.requireSeller = requireSeller;
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        throw new errors_1.ForbiddenError('Admin access required');
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map