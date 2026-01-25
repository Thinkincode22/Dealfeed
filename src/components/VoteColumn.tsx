import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoteColumnProps {
    initialVotes: number;
}

export function VoteColumn({ initialVotes }: VoteColumnProps) {
    const [votes, setVotes] = useState(initialVotes);
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

    const handleUpvote = () => {
        if (userVote === 'up') {
            setVotes(v => v - 1);
            setUserVote(null);
        } else {
            setVotes(v => v + (userVote === 'down' ? 2 : 1));
            setUserVote('up');
        }
    };

    const handleDownvote = () => {
        if (userVote === 'down') {
            setVotes(v => v + 1);
            setUserVote(null);
        } else {
            setVotes(v => v - (userVote === 'up' ? 2 : 1));
            setUserVote('down');
        }
    };

    return (
        <div className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-50/50 rounded-l-xl border-r border-gray-100 min-w-[56px] justify-start pt-4 h-full">
            <button
                onClick={handleUpvote}
                className={cn(
                    "p-1 rounded-lg hover:bg-gray-200 transition-colors",
                    userVote === 'up' ? "text-orange-600 bg-orange-50" : "text-gray-400"
                )}
            >
                <ChevronUp size={28} strokeWidth={2.5} />
            </button>

            <span className={cn(
                "font-bold text-sm select-none py-1",
                userVote === 'up' ? "text-orange-600" : userVote === 'down' ? "text-blue-600" : "text-gray-700"
            )}>
                {votes}
            </span>

            <button
                onClick={handleDownvote}
                className={cn(
                    "p-1 rounded-lg hover:bg-gray-200 transition-colors",
                    userVote === 'down' ? "text-blue-600 bg-blue-50" : "text-gray-400"
                )}
            >
                <ChevronDown size={28} strokeWidth={2.5} />
            </button>
        </div>
    );
}
