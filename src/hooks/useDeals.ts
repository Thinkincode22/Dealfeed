import { useState, useEffect, useCallback } from 'react';
type DBCommentRow = {
  id: string;
  content: string;
  created_at: string;
  author?: { username?: string; avatar_url?: string };
};
type DBDealRow = {
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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockDeals } from '../data/mockDeals';
import type { Deal } from '../types/deal';

const PAGE_SIZE = 20;

interface UseDealsResult {
    deals: Deal[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>;
    addDeal: (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => Promise<void>;
}

export const useDeals = (): UseDealsResult => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const transformDeals = (data: DBDealRow[]): Deal[] => {
        return (data || []).map((deal: DBDealRow) => ({
            id: deal.id,
            title: deal.title,
            description: deal.description || '',
            price: Number(deal.price),
            originalPrice: Number(deal.original_price) || Number(deal.price),
            discount: deal.discount || 0,
            image: deal.image_url || '',
            store: deal.store || '',
            storeUrl: deal.store_url || '',
            category: deal.category || 'Other',
            upvotes: 0,
            downvotes: 0,
            temperature: deal.temperature || 0,
            createdAt: new Date(deal.created_at ?? new Date().toISOString()),
            expiresAt: deal.expires_at ? new Date(deal.expires_at) : undefined,
            couponCode: deal.coupon_code,
            shippingInfo: deal.shipping_info,
            author: {
                username: deal.author?.username || 'Anonymous',
                avatar: deal.author?.avatar_url || ''
            },
            comments: (deal.comments || []).map((comment: DBCommentRow) => ({
                id: comment.id,
                content: comment.content,
                createdAt: new Date(comment.created_at ?? new Date().toISOString()),
                upvotes: 0,
                downvotes: 0,
                author: {
                    username: comment.author?.username || 'Anonymous',
                    avatar: comment.author?.avatar_url || ''
                }
            }))
        }));
    };

    const fetchDeals = async () => {
        if (!isSupabaseConfigured || !supabase) {
            setDeals(mockDeals);
            setLoading(false);
            setHasMore(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const from = 0;
            const to = PAGE_SIZE - 1;

            const { data, error: fetchError } = await supabase
                .from('deals')
                .select(`
                    *,
                    author:profiles(*),
                    comments(
                        *,
                        author:profiles(*)
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (fetchError) throw fetchError;

            const transformed = transformDeals(data || []);
            setDeals(transformed);
            setHasMore((data || []).length === PAGE_SIZE);
            setPage(0);
        } catch (err) {
            console.error('Error fetching deals:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch deals');
            setDeals(mockDeals);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = useCallback(async () => {
        if (!isSupabaseConfigured || !supabase || !hasMore || loading) return;

        try {
            setLoading(true);
            const nextPage = page + 1;
            const from = nextPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error: fetchError } = await supabase
                .from('deals')
                .select(`
                    *,
                    author:profiles(*),
                    comments(
                        *,
                        author:profiles(*)
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (fetchError) throw fetchError;

            const transformed = transformDeals(data || []);
            setDeals(prev => [...prev, ...transformed]);
            setHasMore((data || []).length === PAGE_SIZE);
            setPage(nextPage);
        } catch (err) {
            console.error('Error loading more deals:', err);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, loading]);

    useEffect(() => {
        fetchDeals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addDeal = async (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => {
        const dealWithId: Deal = {
            ...newDeal,
            id: `deal-${Date.now()}`,
            temperature: 0,
            upvotes: 0,
            downvotes: 0,
        };

        if (isSupabaseConfigured && supabase) {
            try {
                const { error } = await supabase.from('deals').insert({
                    title: newDeal.title,
                    description: newDeal.description,
                    price: newDeal.price,
                    original_price: newDeal.originalPrice,
                    discount: newDeal.discount,
                    image_url: newDeal.image,
                    store: newDeal.store,
                    store_url: newDeal.storeUrl,
                    category: newDeal.category,
                    coupon_code: newDeal.couponCode,
                    shipping_info: newDeal.shippingInfo,
                    expires_at: newDeal.expiresAt,
                });

                if (error) throw error;
                await fetchDeals();
            } catch (err) {
                console.error('Error adding deal to Supabase:', err);
                setDeals(prev => [dealWithId, ...prev]);
            }
        } else {
            setDeals(prev => [dealWithId, ...prev]);
        }
    };

    return { deals, loading, error, hasMore, loadMore, refetch: fetchDeals, addDeal };
};
