export interface Author {
    username: string;
    avatar: string;
}

export interface Comment {
    id: string;
    author: Author;
    content: string;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
}

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
    comments: Comment[];
    temperature: number;
    createdAt: Date;
    author: Author;
    expiresAt?: Date;
    couponCode?: string;
    shippingInfo?: string;
}

export type SortOption = 'hot' | 'new' | 'discount' | 'price-low' | 'price-high';
