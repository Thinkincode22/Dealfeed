import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface VoteButtonsProps {
    initialUpvotes: number;
    initialDownvotes: number;
    dealId: string;
}

type VoteState = 'none' | 'up' | 'down';

export const VoteButtons = ({ initialUpvotes, initialDownvotes, dealId }: VoteButtonsProps) => {
    const { user } = useAuth();
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [voteState, setVoteState] = useState<VoteState>('none');
    const lastVoteTime = useRef<number>(0);

    const temperature = upvotes - downvotes;

    // Load existing vote from DB on mount
    useEffect(() => {
        if (!isSupabaseConfigured || !supabase || !user) return;

        const fetchVote = async () => {
            const client = supabase!;
            const { data } = await client
                .from('votes')
                .select('value')
                .eq('deal_id', dealId)
                .eq('user_id', user.id)
                .single();

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

        // Optimistic UI update
        const prevUp = upvotes;
        const prevDown = downvotes;
        const prevVoteState = voteState;

        if (newVoteState === 'up') {
            if (prevVoteState === 'down') {
                setUpvotes(prevUp + 1);
                setDownvotes(prevDown - 1);
            } else if (prevVoteState === 'none') {
                setUpvotes(prevUp + 1);
            }
        } else if (newVoteState === 'down') {
            if (prevVoteState === 'up') {
                setUpvotes(prevUp - 1);
                setDownvotes(prevDown + 1);
            } else if (prevVoteState === 'none') {
                setDownvotes(prevDown + 1);
            }
        } else {
            // Removing vote
            if (prevVoteState === 'up') setUpvotes(prevUp - 1);
            if (prevVoteState === 'down') setDownvotes(prevDown - 1);
        }
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
            } catch (err) {
                console.error('Error persisting vote:', err);
                // Rollback optimistic update
                setUpvotes(prevUp);
                setDownvotes(prevDown);
                setVoteState(prevVoteState);
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-1 min-w-[40px] sm:min-w-[50px]">
            <button
                onClick={() => handleVote(1)}
                className={`p-1.5 rounded transition-colors ${voteState === 'up'
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40'
                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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
