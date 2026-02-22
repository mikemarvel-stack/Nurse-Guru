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
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'image/jpeg',
        'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Allowed: PDF, DOCX, PPTX, JPG, PNG'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    }
});
// Upload document file
router.post('/document', auth_1.authenticate, auth_1.requireSeller, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/uploads/${req.file.filename}`
        };
        res.json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});
// Upload thumbnail image
router.post('/thumbnail', auth_1.authenticate, upload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        res.json({
            message: 'Thumbnail uploaded successfully',
            url: `/uploads/${req.file.filename}`
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload thumbnail' });
    }
});
// Delete uploaded file
router.delete('/:filename', auth_1.authenticate, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(uploadsDir, filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            res.json({ message: 'File deleted' });
        }
        else {
            res.status(404).json({ error: 'File not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map