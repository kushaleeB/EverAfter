import multer from 'multer';
import { AppError } from '../errors/AppError.js';

const CSV_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
]);

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      CSV_MIME_TYPES.has(file.mimetype) ||
      file.originalname.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      return cb(AppError.badRequest('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
});

export function handleCsvUploadError(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(AppError.badRequest('CSV file exceeds 5MB limit'));
    }
    return next(AppError.badRequest(err.message));
  }
  next(err);
}
