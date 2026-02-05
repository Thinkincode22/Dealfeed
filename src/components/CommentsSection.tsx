import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import type { Comment } from '../types/deal';

interface CommentsSectionProps {
    initialComments: Comment[];
}

export const CommentsSection = ({ initialComments }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: `c-${Date.now()}`,
            author: {
                username: 'Guest User',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
            },
            content: newComment,
            createdAt: new Date(),
            upvotes: 0,
            downvotes: 0
        };

        setComments(prev => [comment, ...prev]);
        setNewComment('');
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="text-blue-600" />
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What do you think about this deal?"
                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 pr-12 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <img
                                src={comment.author.avatar}
                                alt={comment.author.username}
                                className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                            />
                            <div className="flex-1">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {comment.author.username}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 ml-2">
                                    <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <ThumbsUp size={14} />
                                        <span>{comment.upvotes}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <ThumbsDown size={14} />
                                        <span>{comment.downvotes}</span>
                                    </button>
                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
};
