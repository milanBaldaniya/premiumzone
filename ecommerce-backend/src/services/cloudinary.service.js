import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Uploads a Multer memory-buffer to Cloudinary and returns { url, publicId }.
 * @param {Buffer} buffer
 * @param {{ folder?: string, filename?: string }} opts
 */
export const uploadBuffer = (buffer, { folder = 'misc', filename } = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(ApiError.internal('Cloudinary is not configured'));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        public_id: filename,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(ApiError.internal(`Upload failed: ${error.message}`));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/** Uploads many buffers in parallel. */
export const uploadMany = (files = [], folder = 'misc') =>
  Promise.all(files.map((f) => uploadBuffer(f.buffer, { folder })));

/** Deletes an asset by its Cloudinary publicId (no-op if missing). */
export const deleteAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  return cloudinary.uploader.destroy(publicId);
};

export const deleteMany = (publicIds = []) =>
  Promise.all(publicIds.filter(Boolean).map(deleteAsset));

/** Replace: upload the new asset, then delete the old one. */
export const replaceAsset = async (buffer, oldPublicId, folder = 'misc') => {
  const uploaded = await uploadBuffer(buffer, { folder });
  if (oldPublicId) await deleteAsset(oldPublicId).catch(() => {});
  return uploaded;
};
