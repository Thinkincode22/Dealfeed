export const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Gaming',
    'Books',
    'Toys & Games',
    'Food & Grocery',
    'Beauty & Health',
    'Automotive',
    'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
