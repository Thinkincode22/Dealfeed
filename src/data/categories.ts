export const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Gaming',
    'Food & Grocery',
    'Books',
    'Toys & Games',
    'Beauty & Health',
    'Automotive',
    'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
