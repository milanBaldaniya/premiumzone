export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

export const PAYMENT_METHOD = Object.freeze({
  COD: 'cod',
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay',
  PAYPAL: 'paypal',
});

export const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
});

export const COUPON_TYPE = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

export const TOKEN_TYPE = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL: 'email',
  RESET: 'reset',
});

export const NOTIFICATION_TYPE = Object.freeze({
  ORDER: 'order',
  PROMO: 'promo',
  SYSTEM: 'system',
  ACCOUNT: 'account',
});
