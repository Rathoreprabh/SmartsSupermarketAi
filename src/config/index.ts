// App configuration constants

export const APP_CONFIG = {
  name: 'SmartMarket',
  description: 'AI-powered supermarket with smart features',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
};

export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
};

export const PRODUCT_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Meat & Fish',
  'Bakery',
  'Beverages',
  'Snacks',
  'Pantry',
  'Frozen Foods',
  'Health & Beauty',
  'Household',
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VENDOR: 'vendor',
} as const;

export const PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const STRIPE_CONFIG = {
  currency: 'usd',
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  SLIDE_IN: 'animate-slide-in-from-left',
  BOUNCE: 'animate-bounce-subtle',
} as const;

export const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right' as const,
};
