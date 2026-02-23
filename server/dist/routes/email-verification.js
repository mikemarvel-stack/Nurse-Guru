"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Schema for email verification
const verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1)
});
const resendEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
// Send verification email (called during registration)
async function sendVerificationEmail(email, userId) {
    try {
        // Generate verification token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Store token in database
        await index_1.prisma.user.update({
            where: { id: userId },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: expiryTime
            }
        });
        // TODO: Send email with verification link
        // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        // await emailService.sendVerificationEmail(email, verificationLink);
        console.log(`[TODO] Send verification email to ${email} with token: ${token}`);
        return token;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
}
// Verify email endpoint
router.post('/verify', async (req, res) => {
    try {
        const { token } = verifyEmailSchema.parse(req.body);
        // Hash the token to compare
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with valid token
        const user = await index_1.prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired verification token' });
        }
        // Update user to mark email as verified
        await index_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Resend verification email
router.post('/resend', async (req, res) => {
    try {
        const { email } = resendEmailSchema.parse(req.body);
        // Find user by email
        const user = await index_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If that email exists, a verification link has been sent.' });
        }
        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }
        // Send new verification email
        await sendVerificationEmail(email, user.id);
        res.json({ message: 'Verification email sent successfully' });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Check verification status (authenticated)
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true, email: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            emailVerified: user.emailVerified,
            email: user.email
        });
    }
    catch (error) {
        console.error('Verification status error:', error);
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=email-verification.js.map