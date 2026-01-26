import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Deal } from '../types/deal';

interface SearchFilters {
    query: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
}

interface SearchContextType {
    filters: SearchFilters;
    setQuery: (query: string) => void;
    setCategory: (category: string | undefined) => void;
    setPriceRange: (min?: number, max?: number) => void;
    setMinDiscount: (discount?: number) => void;
    clearFilters: () => void;
    filteredDeals: Deal[];
    setFilteredDeals: (deals: Deal[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
    });
    const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);

    const setQuery = (query: string) => {
        setFilters(prev => ({ ...prev, query }));
    };

    const setCategory = (category: string | undefined) => {
        setFilters(prev => ({ ...prev, category }));
    };

    const setPriceRange = (min?: number, max?: number) => {
        setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    };

    const setMinDiscount = (discount?: number) => {
        setFilters(prev => ({ ...prev, minDiscount: discount }));
    };

    const clearFilters = () => {
        setFilters({ query: '' });
        setFilteredDeals([]);
    };

    return (
        <SearchContext.Provider
            value={{
                filters,
                setQuery,
                setCategory,
                setPriceRange,
                setMinDiscount,
                clearFilters,
                filteredDeals,
                setFilteredDeals,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
