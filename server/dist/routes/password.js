"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const resetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email()
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(8),
    confirmPassword: zod_1.z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string(),
    newPassword: zod_1.z.string().min(8),
    confirmPassword: zod_1.z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Request password reset
router.post('/forgot', async (req, res) => {
    try {
        const { email } = resetRequestSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { email }
        });
        // Don't reveal if email exists (security best practice)
        if (!user) {
            return res.json({
                message: 'If an account exists with this email, a reset link has been sent'
            });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenHash = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        // Save reset token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetTokenHash,
                resetTokenExpiry
            }
        });
        // TODO: Send email with reset link
        // For now, log the token for testing
        console.log(`Reset token for ${email}: ${resetToken}`);
        res.json({
            message: 'If an account exists with this email, a reset link has been sent',
            // Only in development
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Failed to process reset request' });
    }
});
// Reset password with token
router.post('/reset', async (req, res) => {
    try {
        const { token, password, confirmPassword } = resetPasswordSchema.parse(req.body);
        const resetTokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await prisma.user.findFirst({
            where: {
                resetToken: resetTokenHash,
                resetTokenExpiry: {
                    gt: new Date() // Token must not be expired
                }
            }
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
// Change password (authenticated user)
router.post('/change', auth_1.authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.default = router;
//# sourceMappingURL=password.js.map