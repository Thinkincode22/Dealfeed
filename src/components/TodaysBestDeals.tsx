import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sanitizeUrl } from '../lib/sanitize';
import type { Deal } from '../types/deal';

interface TodaysBestDealsProps {
    deals: Deal[];
}

export const TodaysBestDeals = ({ deals }: TodaysBestDealsProps) => {
    const featured = [...deals]
        .sort((a, b) => b.temperature - a.temperature)
        .slice(0, 8);

    if (featured.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Today's Best Deals</h2>
                <a href="#all-deals" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5">
                    View All
                </a>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
                {featured.map((deal, i) => (
                    <Link
                        key={deal.id}
                        to={`/deal/${deal.id}`}
                        className="shrink-0 w-40 sm:w-48 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                    >
                        <div className="relative h-32 sm:h-36 bg-gray-100 dark:bg-gray-800">
                            <img
                                src={sanitizeUrl(deal.image) || 'https://via.placeholder.com/300x300?text=No+Image'}
                                alt={deal.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-violet-700 dark:text-violet-300 text-[10px] font-bold px-2 py-1 rounded-full">
                                <Star size={11} fill="currentColor" />
                                {i === 0 ? 'Best Today' : 'Trending'}
                            </div>
                        </div>
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                {deal.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-gray-900 dark:text-white">{deal.price} zł</span>
                                {deal.discount > 0 && (
                                    <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[11px] font-bold px-1.5 py-0.5 rounded-md">
                                        -{deal.discount}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
