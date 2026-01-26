import { useState, useEffect } from 'react';
import type { Deal } from '../types/deal';
import { mockDeals } from '../data/mockDeals';

export const useDeals = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            setDeals(mockDeals);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return { deals, loading };
};
