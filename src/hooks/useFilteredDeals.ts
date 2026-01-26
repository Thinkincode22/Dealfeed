import { useMemo } from 'react';
import type { Deal } from '../types/deal';
import { useSearch } from '../contexts/SearchContext';

export const useFilteredDeals = (deals: Deal[]): Deal[] => {
    const { filters } = useSearch();

    return useMemo(() => {
        let filtered = deals;

        // Filter by search query
        if (filters.query.trim()) {
            const query = filters.query.toLowerCase();
            filtered = filtered.filter(
                deal =>
                    deal.title.toLowerCase().includes(query) ||
                    deal.description.toLowerCase().includes(query) ||
                    deal.store.toLowerCase().includes(query) ||
                    deal.category.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (filters.category) {
            filtered = filtered.filter(deal => deal.category === filters.category);
        }

        // Filter by price range
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(deal => deal.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(deal => deal.price <= filters.maxPrice!);
        }

        // Filter by minimum discount
        if (filters.minDiscount !== undefined) {
            filtered = filtered.filter(deal => deal.discount >= filters.minDiscount!);
        }

        return filtered;
    }, [deals, filters]);
};
