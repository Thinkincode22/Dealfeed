import type { Deal } from '../types';
import { VoteColumn } from './VoteColumn';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface DealPostProps {
    deal: Deal;
}

export function DealPost({ deal }: DealPostProps) {
    const { t } = useLanguage();

    return (
        <div className="flex bg-white rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] transition-shadow duration-200 border border-gray-100 overflow-hidden group">
            {/* Vote Column */}
            <VoteColumn initialVotes={deal.votes} />

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Image */}
                <div className="shrink-0 self-start">
                    <div className="relative w-full h-48 sm:w-36 sm:h-36 rounded-lg overflow-hidden bg-white border border-gray-100">
                        <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="mb-2">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                            {deal.title}
                        </h2>

                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="text-2xl font-bold text-gray-900">
                                ${deal.price}
                            </span>
                            <span className="text-sm text-gray-500 line-through decoration-gray-400">
                                ${deal.originalPrice}
                            </span>
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                -{deal.discountPercentage}%
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                                • {deal.storeName}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {deal.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between sm:justify-start gap-4 pt-2 border-t border-gray-50 sm:border-t-0 sm:pt-0">
                        <a
                            href={deal.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-full transition-colors w-full sm:w-auto shadow-sm hover:shadow"
                        >
                            <span className="whitespace-nowrap">{t.goToStore}</span>
                            <ExternalLink size={16} />
                        </a>

                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-gray-100">
                            <MessageSquare size={18} />
                            <span>{deal.comments}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
