import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/env.js';
import { AppError } from '../errors/AppError.js';

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(AppError.badRequest(`File type not allowed: ${file.mimetype}`), false);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeBytes, files: 10 },
});

export function handleMulterError(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.badRequest(`File exceeds ${env.MAX_FILE_SIZE_MB}MB limit`));
    }
    return next(AppError.badRequest(err.message));
  }
  next(err);
}
