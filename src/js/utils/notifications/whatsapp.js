export const formatPhoneForWhatsApp = (phone = '') => String(phone).replace(/[\s\-()+]/g, '');

export const buildWhatsAppLink = (phone, message) =>
  `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;