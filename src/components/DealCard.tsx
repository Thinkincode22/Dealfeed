import { MessageCircle, ExternalLink, Flame, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoteButtons } from './VoteButtons';
import type { Deal } from '../types/deal';

interface DealCardProps {
    deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
    const {
        id,
        title,
        description,
        price,
        originalPrice,
        discount,
        image,
        store,
        storeUrl,
        upvotes,
        downvotes,
        comments,
        temperature,
        author
    } = deal;

    // Визначаємо колір температури
    const getTempColor = (temp: number) => {
        if (temp >= 300) return 'text-orange-600';
        if (temp >= 200) return 'text-orange-500';
        if (temp >= 100) return 'text-orange-400';
        return 'text-gray-500';
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Vote Buttons Section */}
                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 sm:gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:min-w-[70px] transition-colors order-2 sm:order-1">
                    <VoteButtons
                        initialUpvotes={upvotes}
                        initialDownvotes={downvotes}
                        dealId={id}
                    />
                </div>

                {/* Main Card Content Area */}
                <div className="flex flex-1 gap-4 order-1 sm:order-2">
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                        <Link to={`/deal/${id}`} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 block">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {discount > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                                    -{discount}%
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        {/* Header with store and author */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                            <Store size={14} className="flex-shrink-0" />
                            <span className="font-medium truncate">{store}</span>
                            <span className="text-gray-400">•</span>
                            <span className="truncate">by {author.username}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                            <Link to={`/deal/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {title}
                            </Link>
                        </h3>

                        {/* Price & Temperature (Compact for mobile) */}
                        <div className="flex items-center justify-between sm:hidden mb-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{price} zł</span>
                                {originalPrice > price && (
                                    <span className="text-sm text-gray-400 line-through">{originalPrice} zł</span>
                                )}
                            </div>
                            <div className={`flex items-center gap-1 ${getTempColor(temperature)}`}>
                                <Flame size={14} fill="currentColor" />
                                <span className="font-bold text-xs">{temperature}°</span>
                            </div>
                        </div>

                        {/* Description (Hidden on mobile) */}
                        <p className="hidden sm:block text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {description}
                        </p>

                        {/* Desktop Footer (Hidden on mobile) */}
                        <div className="hidden sm:flex items-center justify-between gap-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">{price} zł</span>
                                {originalPrice > price && (
                                    <span className="text-lg text-gray-400 line-through">{originalPrice} zł</span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Link to={`/deal/${id}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <MessageCircle size={18} />
                                    <span className="text-sm font-medium">{comments.length}</span>
                                </Link>

                                <a
                                    href={storeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                                >
                                    Get Deal
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Footer Buttons */}
                <div className="flex sm:hidden items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-3 order-3">
                    <Link to={`/deal/${id}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-medium text-sm">
                        <MessageCircle size={18} />
                        <span>{comments.length} Comments</span>
                    </Link>
                    <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        Go to Deal
                        <ExternalLink size={14} />
                    </a>
                </div>

                {/* Desktop Temperature Badge */}
                <div className="hidden sm:block flex-shrink-0 order-3">
                    <div className={`flex items-center gap-1 ${getTempColor(temperature)}`}>
                        <Flame size={18} fill="currentColor" />
                        <span className="font-bold text-sm">{temperature}°</span>
                    </div>
                </div>
            </div>
        </div>
    );
};