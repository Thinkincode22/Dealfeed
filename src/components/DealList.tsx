import { useState } from 'react';
import { DealCard } from './DealCard';
import type { Deal, SortOption } from '../types/deal';
import { ChevronDown } from 'lucide-react';
import { useFilteredDeals } from '../hooks/useFilteredDeals';

interface DealListProps {
    deals: Deal[];
}

export const DealList = ({ deals }: DealListProps) => {
    const [sortBy, setSortBy] = useState<SortOption>('hot');
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
                <h1 className="text-3xl font-bold text-gray-900">
                    Today's Best Deals {filteredDeals.length > 0 && <span className="text-lg text-gray-600 font-normal">({sortedDeals.length})</span>}
                </h1>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                        <option value="hot">🔥 Trending</option>
                        <option value="new">🆕 Newest</option>
                        <option value="discount">💰 Best Discount</option>
                        <option value="price-low">💵 Price: Low to High</option>
                        <option value="price-high">💸 Price: High to Low</option>
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
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
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">No deals found</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {filteredDeals.length === 0 && deals.length > 0
                                ? 'Try adjusting your search filters'
                                : 'Check back later for amazing deals!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {sortedDeals.length > 0 && (
                <div className="text-center pt-6">
                    <button className="bg-white border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors">
                        Load More Deals
                    </button>
                </div>
            )}
        </div>
    );
};
