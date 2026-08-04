import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Memory storage — files are buffered then streamed to Cloudinary in the
 * service layer. Keeps upload concerns decoupled from the storage provider.
 */
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE, files: 10 },
});

export const uploadSingle = (field = 'image') => upload.single(field);
export const uploadArray = (field = 'images', max = 10) => upload.array(field, max);
export const uploadFields = (fields) => upload.fields(fields);
