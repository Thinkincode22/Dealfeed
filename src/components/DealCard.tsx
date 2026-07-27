import { useState } from 'react';
import { MessageCircle, Flame, Store, Pencil, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoteButtons } from './VoteButtons';
import { EditDealModal } from './EditDealModal';
import { sanitizeUrl } from '../lib/sanitize';
import { useAuth } from '../contexts/AuthContext';
import { useUserRole } from '../hooks/useUserRole';
import type { Deal } from '../types/deal';

interface DealCardProps {
    deal: Deal;
    onUpdated?: () => void;
}

export const DealCard = ({ deal, onUpdated }: DealCardProps) => {
    const {
        id,
        title,
        description,
        price,
        originalPrice,
        image,
        storeUrl,
        upvotes,
        downvotes,
        comments,
        temperature,
        author
    } = deal;

    const { user } = useAuth();
    const { canModerate } = useUserRole();
    const [isEditing, setIsEditing] = useState(false);
    const canEdit = canModerate || user?.profile?.username === author.username;

    // Визначаємо колір температури
    const getTempColor = (temp: number) => {
        if (temp >= 300) return 'text-orange-600';
        if (temp >= 200) return 'text-orange-500';
        if (temp >= 100) return 'text-orange-400';
        return 'text-gray-500';
    };

    const safeImageUrl = sanitizeUrl(image) || 'https://via.placeholder.com/300x300?text=No+Image';
    const safeStoreUrl = sanitizeUrl(storeUrl) || '#';

    return (
        <div className="relative bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-shadow p-5 sm:p-6">
            {canEdit && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-violet-600 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                    title="Edytuj ofertę"
                    aria-label="Edytuj ofertę"
                >
                    <Pencil size={16} />
                </button>
            )}

            <div className="flex flex-nowrap gap-4">
                {/* Image + overlaid vote pill */}
                <div className="relative shrink-0 pb-3">
                    <Link to={`/deal/${id}`} className="block w-28 h-28 rounded-2xl overflow-hidden bg-gray-100">
                        <img
                            src={safeImageUrl}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </Link>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <VoteButtons
                            variant="pill"
                            initialUpvotes={upvotes}
                            initialDownvotes={downvotes}
                            dealId={id}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                    <div className="inline-flex items-center gap-1.5 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        <Store size={12} className="flex-shrink-0" />
                        <span className="truncate max-w-[160px]">by {author.username}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3">
                        <Link to={`/deal/${id}`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            {title}
                        </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{price} zł</span>
                        {originalPrice > price && (
                            <span className="text-base text-gray-400 line-through">{originalPrice} zł</span>
                        )}
                        <div className={`flex items-center gap-1 ml-auto ${getTempColor(temperature)}`}>
                            <Flame size={16} fill="currentColor" />
                            <span className="font-bold text-sm">{temperature}°</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description — fills the space freed up by keeping the content block beside the image */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 line-clamp-2">
                {description}
            </p>

            {/* Footer */}
            <div className="border-t border-white/60 dark:border-gray-700/50 mt-4 pt-4 flex flex-wrap items-center justify-between gap-3">
                <Link
                    to={`/deal/${id}`}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{comments.length} Comments</span>
                </Link>

                <a
                    href={safeStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 hover:opacity-90 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-purple-500/30 transition-opacity"
                >
                    Go to Deal
                    <ArrowUpRight size={18} />
                </a>
            </div>

            {isEditing && (
                <EditDealModal
                    deal={deal}
                    onClose={() => setIsEditing(false)}
                    onSaved={() => onUpdated?.()}
                />
            )}
        </div>
    );
};
