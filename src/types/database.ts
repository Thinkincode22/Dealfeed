/**
 * Shared DB row types used across hooks and components.
 * Matches the Supabase query shapes for deals and comments.
 */

export type DBCommentRow = {
    id: string;
    content: string;
    created_at: string;
    author?: { username?: string; avatar_url?: string };
};

export type DBDealRow = {
    id: string;
    title: string;
    description?: string;
    price: number;
    original_price?: number;
    discount?: number;
    image_url?: string;
    store?: string;
    store_url?: string;
    category?: string;
    temperature?: number;
    created_at?: string;
    expires_at?: string;
    coupon_code?: string;
    shipping_info?: string;
    is_active?: boolean;
    author?: { username?: string; avatar_url?: string };
    comments?: DBCommentRow[];
};
