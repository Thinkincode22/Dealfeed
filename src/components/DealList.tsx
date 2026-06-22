import { DealCard } from './DealCard';
import type { Deal, SortOption } from '../types/deal';
import { ChevronDown } from 'lucide-react';
import { useFilteredDeals } from '../hooks/useFilteredDeals';
import { useSearch } from '../contexts/SearchContext';

interface DealListProps {
    deals: Deal[];
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
}

export const DealList = ({ deals, hasMore, onLoadMore, loading }: DealListProps) => {
    const { sortBy, setSortBy } = useSearch();
    const filteredDeals = useFilteredDeals(deals);

    // Сортуємо deals
    const sortedDeals = [...filteredDeals].sort((a, b) => {
        switch (sortBy) {
            case 'hot':
                return b.temperature - a.temperature;
            case 'new':
                return b.createdAt.getTime() - a.createdAt.getTime();
            case 'discount':
                return b.discount - a.discount;
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header with Title and Sort Dropdown */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Today's Best Deals {filteredDeals.length > 0 && <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">({sortedDeals.length})</span>}
                </h1>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
                    >
                        <option value="hot">🔥 Trending</option>
                        <option value="new">🆕 Newest</option>
                        <option value="discount">💰 Best Discount</option>
                        <option value="price-low">💵 Price: Low to High</option>
                        <option value="price-high">💸 Price: High to Low</option>
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                    />
                </div>
            </div>

            {/* Deals Grid */}
            <div className="space-y-4">
                {sortedDeals.length > 0 ? (
                    sortedDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center transition-colors">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No deals found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                            {filteredDeals.length === 0 && deals.length > 0
                                ? 'Try adjusting your search filters'
                                : 'Check back later for amazing deals!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {hasMore && sortedDeals.length > 0 && (
                <div className="text-center pt-6">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Deals'}
                    </button>
                </div>
            )}
        </div>
    );
};
