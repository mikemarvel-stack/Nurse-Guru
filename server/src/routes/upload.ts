import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireSeller } from '../middleware/auth';
import fs from 'fs';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueName = `${uuidv4()}-${sanitized}`;
    cb(null, uniqueName);
  }
});

// File filter - Extended format support for educational documents
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new Error(
      'Invalid file type. Allowed: PDF, DOCX, PPTX, XLSX, JPG, PNG, WebP, GIF, ' +
      'TXT, CSV, ZIP, EPUB, MP4, MP3, WAV, SRT, and more educational formats'
    ));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max for educational content
  }
});

// Upload document file
router.post('/document', authenticate, requireSeller, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    };

    logger.info('File uploaded', { userId: (req as any).user?.id, filename: req.file.filename });

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload thumbnail image
router.post('/thumbnail', authenticate, upload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      throw new ValidationError('No image uploaded');
    }

    logger.info('Thumbnail uploaded', { userId: (req as any).user?.id, filename: req.file.filename });

    res.json({
      message: 'Thumbnail uploaded successfully',
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    logger.error('Thumbnail upload error:', error);
    res.status(500).json({ error: 'Failed to upload thumbnail' });
  }
});

// Delete uploaded file - SECURED
router.delete('/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;

    // Prevent path traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new ValidationError('Invalid filename');
    }

    // Use basename to ensure we only get the filename
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    // Verify the resolved path is still within uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      throw new ValidationError('Invalid file path');
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted', { userId: (req as any).user?.id, filename: safeFilename });
      res.json({ message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    logger.error('Delete file error:', error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
});

export default router;
