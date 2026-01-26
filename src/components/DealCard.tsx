import { MessageCircle, ExternalLink, Flame, Store } from 'lucide-react';
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
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4">
            <div className="flex gap-4">
                {/* Vote Buttons Section */}
                <div className="flex-shrink-0">
                    <VoteButtons
                        initialUpvotes={upvotes}
                        initialDownvotes={downvotes}
                        dealId={id}
                    />
                </div>

                {/* Image Section */}
                <div className="flex-shrink-0">
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        {discount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{discount}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    {/* Header with store and author */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Store size={14} className="flex-shrink-0" />
                        <span className="font-medium">{store}</span>
                        <span className="text-gray-400">•</span>
                        <span>Posted by {author.username}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {description}
                    </p>

                    {/* Footer with price, comments, and button */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Price section */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ${price}
                            </span>
                            {originalPrice > price && (
                                <span className="text-lg text-gray-400 line-through">
                                    ${originalPrice}
                                </span>
                            )}
                        </div>

                        {/* Comments and button */}
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                                <MessageCircle size={18} />
                                <span className="text-sm font-medium">{comments} Comments</span>
                            </button>

                            <a
                                href={storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                Go to Deal
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Temperature Badge */}
                <div className="flex-shrink-0">
                    <div className={`flex items-center gap-1 ${getTempColor(temperature)}`}>
                        <Flame size={18} fill="currentColor" />
                        <span className="font-bold text-sm">{temperature}°</span>
                    </div>
                </div>
            </div>
        </div>
    );
};