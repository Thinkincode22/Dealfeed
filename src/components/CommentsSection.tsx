import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Comment } from '../types/deal';
import type { DBCommentRow } from '../types/database';

interface CommentsSectionProps {
    dealId: string;
    initialComments: Comment[];
}

export const CommentsSection = ({ dealId, initialComments }: CommentsSectionProps) => {
    const { user, isAuthenticated } = useAuth();
    const { addNotification } = useNotifications();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Load comments from DB if Supabase is configured
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const fetchComments = async () => {
            const client = supabase!;
            const { data, error } = await client
                .from('comments')
                .select('id, content, created_at, author:profiles(username, avatar_url)')
                .eq('deal_id', dealId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const mapped: Comment[] = (data as DBCommentRow[]).map(c => ({
                    id: c.id,
                    content: c.content,
                    createdAt: new Date(c.created_at),
                    upvotes: 0,
                    downvotes: 0,
                    author: {
                        username: c.author?.username || 'Anonymous',
                        avatar: c.author?.avatar_url || '',
                    },
                }));
                setComments(mapped);
            }
        };

        fetchComments();
    }, [dealId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setSubmitError('');

        if (isSupabaseConfigured && supabase && user) {
            try {
                const client = supabase;
                const { data, error } = await client
                    .from('comments')
                    .insert({
                        deal_id: dealId,
                        author_id: user.id,
                        content: newComment.trim(),
                    })
                    .select('id, content, created_at')
                    .single();

                if (error) throw error;

                const comment: Comment = {
                    id: data.id,
                    content: data.content,
                    createdAt: new Date(data.created_at),
                    upvotes: 0,
                    downvotes: 0,
                    author: {
                        username: user.profile?.username || 'User',
                        avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                    },
                };

                setComments(prev => [comment, ...prev]);
                setNewComment('');
                addNotification({
                    type: 'comment',
                    title: 'New comment',
                    message: `${user.profile?.username || 'Someone'} commented on a deal`,
                    dealId,
                });
            } catch (err) {
                console.error('Error posting comment:', err);
                setSubmitError('Failed to post comment. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        } else if (user) {
            // Mock mode — only if logged in
            const comment: Comment = {
                id: `c-${Date.now()}`,
                author: {
                    username: user.profile?.username || 'Guest User',
                    avatar: user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
                },
                content: newComment,
                createdAt: new Date(),
                upvotes: 0,
                downvotes: 0,
            };

            setComments(prev => [comment, ...prev]);
            setNewComment('');
            setIsSubmitting(false);
            addNotification({
                type: 'comment',
                title: 'New comment',
                message: `${user.profile?.username || 'Someone'} commented on a deal`,
                dealId,
            });
        } else {
            setSubmitError('Please sign in to comment.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="text-blue-600" />
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What do you think about this deal?"
                            maxLength={1000}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 pr-12 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    {submitError && (
                        <p className="mt-2 text-sm text-red-600">{submitError}</p>
                    )}
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Sign in to leave a comment
                    </p>
                </div>
            )}

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
