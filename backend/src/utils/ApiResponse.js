/**
 * Standard success response envelope. Keeps the API shape consistent so
 * both the Next.js client and the React admin can rely on a single contract.
 *
 * {
 *   success: true,
 *   message: string,
 *   data: any,
 *   meta?: { page, limit, total, totalPages, hasNext, hasPrev }
 * }
 */
export const sendResponse = (res, { statusCode = 200, message = 'Success', data = null, meta } = {}) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const buildMeta = ({ page, limit, total }) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
