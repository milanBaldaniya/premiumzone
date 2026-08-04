/**
 * Only ever redirect back to a path within this app. Blocks absolute URLs,
 * protocol-relative URLs (//evil.com) and scheme-embedded tricks so the
 * `redirect` query param can't be turned into an open redirect.
 */
export function getSafeRedirect(value, fallback = '/') {
  if (typeof value !== 'string' || !value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;
  if (value.includes('://')) return fallback;
  return value;
}

/**
 * Builds a /login (or /register) URL that carries where to return to, and
 * optionally which action to resume once the user is authenticated.
 */
export function buildAuthHref(base, { redirect, intent, productId, quantity } = {}) {
  const params = new URLSearchParams();
  params.set('redirect', getSafeRedirect(redirect, '/'));
  if (intent) params.set('intent', intent);
  if (productId) params.set('productId', productId);
  if (quantity && quantity !== 1) params.set('quantity', String(quantity));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
