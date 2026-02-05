import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VoteButtonsProps {
    initialUpvotes: number;
    initialDownvotes: number;
    dealId: string;
}

type VoteState = 'none' | 'up' | 'down';

export const VoteButtons = ({ initialUpvotes, initialDownvotes }: VoteButtonsProps) => {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [voteState, setVoteState] = useState<VoteState>('none');

    const temperature = upvotes - downvotes;

    const handleUpvote = () => {
        if (voteState === 'up') {
            // Відміна upvote
            setUpvotes(upvotes - 1);
            setVoteState('none');
        } else if (voteState === 'down') {
            // Зміна з downvote на upvote
            setUpvotes(upvotes + 1);
            setDownvotes(downvotes - 1);
            setVoteState('up');
        } else {
            // Новий upvote
            setUpvotes(upvotes + 1);
            setVoteState('up');
        }
    };

    const handleDownvote = () => {
        if (voteState === 'down') {
            // Відміна downvote
            setDownvotes(downvotes - 1);
            setVoteState('none');
        } else if (voteState === 'up') {
            // Зміна з upvote на downvote
            setDownvotes(downvotes + 1);
            setUpvotes(upvotes - 1);
            setVoteState('down');
        } else {
            // Новий downvote
            setDownvotes(downvotes + 1);
            setVoteState('down');
        }
    };

    return (
        <div className="flex flex-col items-center gap-1 min-w-[40px] sm:min-w-[50px]">
            {/* Upvote button */}
            <button
                onClick={handleUpvote}
                className={`p-1.5 rounded transition-colors ${voteState === 'up'
                    ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40'
                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                aria-label="Upvote"
            >
                <ChevronUp size={24} strokeWidth={2.5} />
            </button>

            {/* Temperature display */}
            <span className="text-lg font-bold text-gray-900 dark:text-white my-0.5">
                {temperature}
            </span>

            {/* Downvote button */}
            <button
                onClick={handleDownvote}
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