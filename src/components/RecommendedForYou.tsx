import { Link } from 'react-router-dom';
import { sanitizeUrl } from '../lib/sanitize';
import type { Deal } from '../types/deal';

interface RecommendedForYouProps {
    deals: Deal[];
}

export const RecommendedForYou = ({ deals }: RecommendedForYouProps) => {
    const recommended = [...deals]
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 4);

    if (recommended.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
                <a href="#all-deals" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                    View All
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map((deal) => (
                    <Link
                        key={deal.id}
                        to={`/deal/${deal.id}`}
                        className="relative h-48 rounded-2xl overflow-hidden group block"
                    >
                        <img
                            src={sanitizeUrl(deal.image) || 'https://via.placeholder.com/600x400?text=No+Image'}
                            alt={deal.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        {deal.discount > 0 && (
                            <span className="absolute top-3 right-3 bg-white text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                {deal.discount}% OFF
                            </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-0.5">{deal.store}</p>
                            <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">{deal.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
