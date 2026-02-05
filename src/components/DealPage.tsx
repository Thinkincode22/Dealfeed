import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Store, Clock, Share2 } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { CommentsSection } from './CommentsSection';
import type { Deal } from '../types/deal';

interface DealPageProps {
    deals: Deal[];
}

export const DealPage = ({ deals }: DealPageProps) => {
    const { id } = useParams<{ id: string }>();
    const deal = deals.find(d => d.id === id);

    if (!deal) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Deal Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">The deal you are looking for might have been removed or expired.</p>
                <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                    &larr; Back to Deals
                </Link>
            </div>
        );
    }

    const {
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
        author,
        createdAt
    } = deal;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Deals
            </Link>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Image Section */}
                    <div className="p-6 lg:border-r border-gray-200 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                        <div className="relative w-full max-w-sm aspect-square">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                    -{discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 lg:col-span-2">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Store size={16} />
                                        <span className="font-medium">{store}</span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        <span>{new Date(createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1.5">
                                        <img src={author.avatar} alt={author.username} className="w-5 h-5 rounded-full" />
                                        <span>Posted by <span className="font-medium text-gray-900">{author.username}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{price} zł</span>
                                    {originalPrice > price && (
                                        <span className="text-xl text-gray-400 line-through">{originalPrice} zł</span>
                                    )}
                                </div>
                                <span className="text-sm text-green-600 font-medium">
                                    You save {originalPrice - price} zł
                                </span>
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <VoteButtons
                                    initialUpvotes={upvotes}
                                    initialDownvotes={downvotes}
                                    dealId={deal.id}
                                />
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                            <a
                                href={storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                            >
                                Get Deal
                                <ExternalLink size={18} />
                            </a>

                            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700 transition-colors ml-auto">
                                <Share2 size={20} />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        </div>

                        {/* Description */}
                        <div className="prose prose-blue dark:prose-invert max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this deal</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Comments Section */}
                <div className="mt-8">
                    <CommentsSection initialComments={comments} />
                </div>
            </div>
        </div>
    );
};
