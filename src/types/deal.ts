export interface Deal {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    discount: number;
    image: string;
    store: string;
    storeUrl: string;
    category: string;
    upvotes: number;
    downvotes: number;
    comments: number;
    temperature: number;
    createdAt: Date;
    expiresAt?: Date;
    couponCode?: string;
    shippingInfo?: string;
    author: {
        username: string;
        avatar?: string;
    };
}

export type SortOption = 'hot' | 'new' | 'discount' | 'price-low' | 'price-high';
