"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const store = {};
const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        if (!store[key]) {
            store[key] = { count: 1, resetTime: now + windowMs };
            return next();
        }
        if (now > store[key].resetTime) {
            store[key] = { count: 1, resetTime: now + windowMs };
            return next();
        }
        store[key].count++;
        if (store[key].count > maxRequests) {
            return res.status(429).json({
                error: 'Too many requests, please try again later',
                retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
            });
        }
        res.set('X-RateLimit-Limit', maxRequests.toString());
        res.set('X-RateLimit-Remaining', (maxRequests - store[key].count).toString());
        res.set('X-RateLimit-Reset', store[key].resetTime.toString());
        next();
    };
};
exports.createRateLimiter = createRateLimiter;
// Cleanup old entries every hour
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 60 * 60 * 1000);
exports.default = exports.createRateLimiter;
//# sourceMappingURL=rateLimit.js.map