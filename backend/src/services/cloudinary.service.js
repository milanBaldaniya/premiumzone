import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Uploads a Multer memory-buffer to Cloudinary and returns { url, publicId }.
 * @param {Buffer} buffer
 * @param {{ folder?: string, filename?: string, resourceType?: 'image'|'video' }} opts
 */
export const uploadBuffer = (buffer, { folder = 'misc', filename, resourceType = 'image' } = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(ApiError.internal('Cloudinary is not configured'));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        public_id: filename,
        resource_type: resourceType,
        // Video doesn't support the image-only fetch_format='auto' transform. Images are also
        // capped to 2000px on the long edge (crop: 'limit' never upscales smaller images) —
        // without this, an uncompressed phone-camera photo (often 6000px+, several MB) gets
        // stored and served at full size, which is what was breaking the product gallery layout
        // on slow mobile connections.
        transformation:
          resourceType === 'video'
            ? [{ quality: 'auto' }]
            : [{ width: 2000, height: 2000, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(ApiError.internal(`Upload failed: ${error.message}`));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          ...(resourceType === 'video' ? { duration: result.duration } : {}),
        });
      }
    );
    stream.end(buffer);
  });

/** Uploads many buffers in parallel. */
export const uploadMany = (files = [], folder = 'misc') =>
  Promise.all(files.map((f) => uploadBuffer(f.buffer, { folder })));

/**
 * Deletes an asset by its Cloudinary publicId (no-op if missing). Video assets live in a
 * separate Cloudinary resource namespace, so `resourceType` must match what it was uploaded as
 * or the delete silently targets the wrong (empty) namespace and the asset is never removed.
 */
export const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const deleteMany = (publicIds = [], resourceType = 'image') =>
  Promise.all(publicIds.filter(Boolean).map((id) => deleteAsset(id, resourceType)));

/** Replace: upload the new asset, then delete the old one. */
export const replaceAsset = async (buffer, oldPublicId, folder = 'misc') => {
  const uploaded = await uploadBuffer(buffer, { folder });
  if (oldPublicId) await deleteAsset(oldPublicId).catch(() => {});
  return uploaded;
};
