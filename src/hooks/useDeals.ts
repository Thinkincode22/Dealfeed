import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockDeals } from '../data/mockDeals';
import type { Deal } from '../types/deal';

interface UseDealsResult {
    deals: Deal[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addDeal: (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => Promise<void>;
}

export const useDeals = (): UseDealsResult => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDeals = async () => {
        // Fallback to mock data if Supabase is not configured
        if (!isSupabaseConfigured || !supabase) {
            setDeals(mockDeals);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

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
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Transform data to match our Deal interface
            const transformedDeals: Deal[] = (data || []).map((deal: any) => ({
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
                upvotes: 0, // Will be calculated from votes
                downvotes: 0,
                temperature: deal.temperature || 0,
                createdAt: new Date(deal.created_at),
                expiresAt: deal.expires_at ? new Date(deal.expires_at) : undefined,
                couponCode: deal.coupon_code,
                shippingInfo: deal.shipping_info,
                author: {
                    username: deal.author?.username || 'Anonymous',
                    avatar: deal.author?.avatar_url || ''
                },
                comments: (deal.comments || []).map((comment: any) => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: new Date(comment.created_at),
                    upvotes: 0,
                    downvotes: 0,
                    author: {
                        username: comment.author?.username || 'Anonymous',
                        avatar: comment.author?.avatar_url || ''
                    }
                }))
            }));

            setDeals(transformedDeals);
        } catch (err) {
            console.error('Error fetching deals:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch deals');
            // Fallback to mock data on error
            setDeals(mockDeals);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const addDeal = async (newDeal: Omit<Deal, 'id' | 'temperature' | 'upvotes' | 'downvotes'>) => {
        // Create the full deal object with generated fields
        const dealWithId: Deal = {
            ...newDeal,
            id: `deal-${Date.now()}`,
            temperature: 0,
            upvotes: 0,
            downvotes: 0,
        };

        // If Supabase is configured, insert into database
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

                // Refetch to get the latest data including the new deal
                await fetchDeals();
            } catch (err) {
                console.error('Error adding deal to Supabase:', err);
                // Fallback: add to local state anyway
                setDeals(prev => [dealWithId, ...prev]);
            }
        } else {
            // Mock mode: just add to local state
            setDeals(prev => [dealWithId, ...prev]);
        }
    };

    return { deals, loading, error, refetch: fetchDeals, addDeal };
};
