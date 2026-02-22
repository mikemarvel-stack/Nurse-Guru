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
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const password_1 = __importDefault(require("./routes/password"));
const documents_1 = __importDefault(require("./routes/documents"));
const orders_1 = __importDefault(require("./routes/orders"));
const cart_1 = __importDefault(require("./routes/cart"));
const upload_1 = __importDefault(require("./routes/upload"));
const payment_1 = __importDefault(require("./routes/payment"));
const users_1 = __importDefault(require("./routes/users"));
const contact_1 = __importDefault(require("./routes/contact"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const sanitize_1 = require("./middleware/sanitize");
const rateLimit_1 = __importDefault(require("./middleware/rateLimit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Trust proxy
app.set('trust proxy', 1);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
// Security: Rate limiting
app.use((0, rateLimit_1.default)(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
// Security: Input sanitization
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(sanitize_1.sanitizeInput);
// Security: Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/password', password_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/payment', payment_1.default);
app.use('/api/users', users_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/search', analytics_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${path_1.default.join(__dirname, '../../uploads')}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map