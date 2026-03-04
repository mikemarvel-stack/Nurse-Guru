"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
};
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const sanitized = sanitizeFilename(file.originalname);
        const uniqueName = `${(0, uuid_1.v4)()}-${sanitized}`;
        cb(null, uniqueName);
    }
});
// File filter - Extended format support for educational documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Documents
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.ms-excel',
        // Text & Code
        'text/plain',
        'text/csv',
        'text/markdown',
        'application/json',
        'application/xml',
        'application/x-yaml',
        // Images
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        // Archives & E-books
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/epub+zip',
        // Video & Audio
        'video/mp4',
        'video/mpeg',
        'audio/mpeg',
        'audio/wav',
        'application/x-subrip'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Allowed: PDF, DOCX, PPTX, XLSX, JPG, PNG, WebP, GIF, ' +
            'TXT, CSV, ZIP, EPUB, MP4, MP3, WAV, SRT, and more educational formats'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max for educational content
    }
});
// Upload document file
router.post('/document', auth_1.authenticate, auth_1.requireSeller, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            throw new errors_1.ValidationError('No file uploaded');
        }
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/uploads/${req.file.filename}`
        };
        logger_1.default.info('File uploaded', { userId: req.user?.id, filename: req.file.filename });
        res.json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    }
    catch (error) {
        logger_1.default.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// Upload thumbnail image
router.post('/thumbnail', auth_1.authenticate, upload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            throw new errors_1.ValidationError('No image uploaded');
        }
        logger_1.default.info('Thumbnail uploaded', { userId: req.user?.id, filename: req.file.filename });
        res.json({
            message: 'Thumbnail uploaded successfully',
            url: `/uploads/${req.file.filename}`
        });
    }
    catch (error) {
        logger_1.default.error('Thumbnail upload error:', error);
        res.status(500).json({ error: 'Failed to upload thumbnail' });
    }
});
// Delete uploaded file - SECURED
router.delete('/:filename', auth_1.authenticate, async (req, res) => {
    try {
        const { filename } = req.params;
        // Prevent path traversal attacks
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            throw new errors_1.ValidationError('Invalid filename');
        }
        // Use basename to ensure we only get the filename
        const safeFilename = path_1.default.basename(filename);
        const filePath = path_1.default.join(uploadsDir, safeFilename);
        // Verify the resolved path is still within uploads directory
        const resolvedPath = path_1.default.resolve(filePath);
        const resolvedUploadsDir = path_1.default.resolve(uploadsDir);
        if (!resolvedPath.startsWith(resolvedUploadsDir)) {
            throw new errors_1.ValidationError('Invalid file path');
        }
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            logger_1.default.info('File deleted', { userId: req.user?.id, filename: safeFilename });
            res.json({ message: 'File deleted' });
        }
        else {
            res.status(404).json({ error: 'File not found' });
        }
    }
    catch (error) {
        logger_1.default.error('Delete file error:', error);
        if (error instanceof errors_1.ValidationError) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map