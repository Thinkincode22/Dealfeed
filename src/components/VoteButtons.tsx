import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface VoteButtonsProps {
    initialTemperature: number;
    dealId: string;
    variant?: 'default' | 'pill';
}

type VoteState = 'none' | 'up' | 'down';

export const VoteButtons = ({ initialTemperature, dealId, variant = 'default' }: VoteButtonsProps) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [temperature, setTemperature] = useState(initialTemperature);
    const [voteState, setVoteState] = useState<VoteState>('none');
    const lastVoteTime = useRef<number>(0);

    // Load existing vote from DB on mount
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase || !user) return;

        const fetchVote = async () => {
            const client = supabase!;
            const { data, error } = await client
                .from('votes')
                .select('value')
                .eq('deal_id', dealId)
                .eq('user_id', user.id)
                .single();

            // PGRST116 = no matching row, expected when the user hasn't voted yet
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching vote:', error);
                return;
            }

            if (data) {
                setVoteState(data.value === 1 ? 'up' : 'down');
            }
        };

        fetchVote();
    }, [dealId, user]);

    const handleVote = async (value: 1 | -1) => {
        // Require authentication to vote
        if (!user) return;

        // Rate limit: 1 vote per second
        if (Date.now() - lastVoteTime.current < 1000) return;
        lastVoteTime.current = Date.now();

        const isSameVote = voteState === (value === 1 ? 'up' : 'down');
        const newValue = isSameVote ? 0 : value;
        const newVoteState: VoteState = newValue === 1 ? 'up' : newValue === -1 ? 'down' : 'none';

        // Optimistic UI update: shift the aggregate temperature by the
        // difference between the new and previous vote value (-1/0/1)
        const prevTemperature = temperature;
        const prevVoteState = voteState;
        const prevValue = prevVoteState === 'up' ? 1 : prevVoteState === 'down' ? -1 : 0;

        setTemperature(prevTemperature + (newValue - prevValue));
        setVoteState(newVoteState);

        // Persist to DB if Supabase is configured and user is logged in
        if (isSupabaseConfigured && supabase && user) {
            try {
                const client = supabase;
                if (newValue === 0) {
                    // Remove vote
                    await client
                        .from('votes')
                        .delete()
                        .eq('deal_id', dealId)
                        .eq('user_id', user.id);
                } else {
                    // Upsert vote (insert or update)
                    const { error } = await client
                        .from('votes')
                        .upsert(
                            { deal_id: dealId, user_id: user.id, value: newValue },
                            { onConflict: 'deal_id,user_id' }
                        );
                    if (error) throw error;
                }

                // Add notification for new votes (not when removing)
                if (newValue !== 0) {
                    addNotification({
                        type: 'vote',
                        title: 'New vote',
                        message: `${user.profile?.username || 'Someone'} ${newValue === 1 ? 'upvoted' : 'downvoted'} a deal`,
                        dealId,
                    });
                }
            } catch (err) {
                console.error('Error persisting vote:', err);
                // Rollback optimistic update
                setTemperature(prevTemperature);
                setVoteState(prevVoteState);
            }
        }
    };

    if (variant === 'pill') {
        return (
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full pl-1 pr-2 py-1 shadow-md border border-white/70 dark:border-gray-700/60 whitespace-nowrap">
                <button
                    onClick={() => handleVote(1)}
                    className={`p-1 rounded-full transition-colors ${voteState === 'up'
                        ? 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40'
                        : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                        }`}
                    aria-label="Upvote"
                >
                    <ChevronUp size={14} strokeWidth={3} />
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[1.2ch] text-center">
                    {temperature}
                </span>
                <button
                    onClick={() => handleVote(-1)}
                    className={`p-1 rounded-full transition-colors ${voteState === 'down'
                        ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                    aria-label="Downvote"
                >
                    <ChevronDown size={14} strokeWidth={3} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-1 min-w-[40px] sm:min-w-[50px] w-full sm:w-auto">
            <button
                onClick={() => handleVote(1)}
                className={`p-1.5 rounded transition-colors ${voteState === 'up'
                    ? 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-900/40'
                    : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}
                aria-label="Upvote"
            >
                <ChevronUp size={24} strokeWidth={2.5} />
            </button>

            <span className="text-lg font-bold text-gray-900 dark:text-white my-0.5">
                {temperature}
            </span>

            <button
                onClick={() => handleVote(-1)}
                className={`p-1.5 rounded transition-colors ${voteState === 'down'
                    ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                aria-label="Downvote"
            >
                <ChevronDown size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
};
