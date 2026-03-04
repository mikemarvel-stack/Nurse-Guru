"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const http_1 = __importDefault(require("http"));
const env_1 = require("./utils/env");
const logger_1 = __importDefault(require("./utils/logger"));
const requestId_1 = require("./middleware/requestId");
const timeout_1 = require("./middleware/timeout");
const metrics_1 = require("./middleware/metrics");
const rateLimit_1 = require("./middleware/rateLimit");
const sanitize_1 = require("./middleware/sanitize");
const socket_1 = require("./socket");
const auth_1 = __importDefault(require("./routes/auth"));
const password_1 = __importDefault(require("./routes/password"));
const documents_1 = __importDefault(require("./routes/documents"));
const orders_1 = __importDefault(require("./routes/orders"));
const cart_1 = __importDefault(require("./routes/cart"));
const upload_1 = __importDefault(require("./routes/upload"));
const payment_1 = __importDefault(require("./routes/payment"));
const users_1 = __importDefault(require("./routes/users"));
const contact_1 = __importDefault(require("./routes/contact"));
const email_verification_1 = __importDefault(require("./routes/email-verification"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const metrics_2 = __importDefault(require("./routes/metrics"));
dotenv_1.default.config();
// Validate environment variables
const env = (0, env_1.validateEnv)();
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1);
// Metrics middleware (before other middleware)
app.use(metrics_1.metricsMiddleware);
// Security: Helmet for security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
// Compression
app.use((0, compression_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Request ID tracking
app.use(requestId_1.requestId);
// Request timeout
app.use((0, timeout_1.timeout)(30000));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Input sanitization
app.use(sanitize_1.sanitizeInput);
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../../public')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV
    });
});
// Metrics endpoint (no auth required)
app.use('/api', metrics_2.default);
// API Routes with rate limiting
app.use('/api/auth/login', rateLimit_1.authLimiter);
app.use('/api/auth/register', rateLimit_1.registerLimiter);
app.use('/api/auth', auth_1.default);
app.use('/api/password', password_1.default);
app.use('/api/email-verification', email_verification_1.default);
app.use('/api/documents', rateLimit_1.apiLimiter, documents_1.default);
app.use('/api/orders', rateLimit_1.apiLimiter, orders_1.default);
app.use('/api/cart', rateLimit_1.apiLimiter, cart_1.default);
app.use('/api/upload', rateLimit_1.uploadLimiter, upload_1.default);
app.use('/api/payment', rateLimit_1.paymentLimiter, payment_1.default);
app.use('/api/users', rateLimit_1.apiLimiter, users_1.default);
app.use('/api/contact', rateLimit_1.apiLimiter, contact_1.default);
app.use('/api/reviews', rateLimit_1.apiLimiter, reviews_1.default);
app.use('/api/search', rateLimit_1.apiLimiter, analytics_1.default);
app.use('/api/notifications', rateLimit_1.apiLimiter, notifications_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error('Error:', {
        error: err.message,
        stack: err.stack,
        requestId: req.id,
        path: req.path,
        method: req.method
    });
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    res.status(statusCode).json({
        error: message,
        requestId: req.id,
        ...(env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        requestId: req.id
    });
});
const PORT = env.PORT || 3001;
const server = http_1.default.createServer(app);
const io = (0, socket_1.initSocket)(server);
// Graceful shutdown
const shutdown = async () => {
    logger_1.default.info('Shutting down gracefully...');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
    });
    await exports.prisma.$disconnect();
    process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
server.listen(PORT, () => {
    logger_1.default.info(`🚀 Server running on port ${PORT}`);
    logger_1.default.info(`📁 Environment: ${env.NODE_ENV}`);
    logger_1.default.info(`📁 Uploads directory: ${path_1.default.join(__dirname, '../../uploads')}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map