import type { Deal } from '../types';

export const MOCK_DEALS: Deal[] = [
    {
        id: '1',
        title: 'Apple AirPods Pro (2nd Gen)',
        description: 'Active noise cancellation, MagSafe charging case. Best price in months.',
        price: 179,
        originalPrice: 249,
        currency: 'USD',
        discountPercentage: 28,
        imageUrl: 'https://images.unsplash.com/photo-1603351154351-5cf99703f6a8?auto=format&fit=crop&q=80&w=800',
        storeName: 'Amazon',
        storeUrl: '#',
        votes: 134,
        comments: 37,
        timestamp: '2024-01-20T10:00:00Z',
        author: 'tech_lover'
    },
    {
        id: '2',
        title: 'LG 4K UHD Smart TV 65"',
        description: 'High resolution, HDR support, perfect for gaming and movies.',
        price: 899,
        originalPrice: 1199,
        currency: 'USD',
        discountPercentage: 25,
        imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=800',
        storeName: 'BestBuy',
        storeUrl: '#',
        votes: 243,
        comments: 54,
        timestamp: '2024-01-21T14:30:00Z',
        author: 'screen_master'
    },
    {
        id: '3',
        title: 'Lenovo ThinkPad X1 Carbon',
        description: 'Lightweight ultrabook with Intel i7 processor, 16GB RAM, 512GB SSD.',
        price: 1299,
        originalPrice: 1799,
        currency: 'USD',
        discountPercentage: 28,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800',
        storeName: 'Lenovo',
        storeUrl: '#',
        votes: 491,
        comments: 12,
        timestamp: '2024-01-22T09:15:00Z',
        author: 'dev_pro'
    }
];
