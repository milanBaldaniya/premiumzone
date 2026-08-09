/** Builds a wa.me deep link that opens a chat with the given message pre-filled. */
export const buildWhatsappLink = (phone, message) => {
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
