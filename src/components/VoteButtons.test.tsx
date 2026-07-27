import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { VoteButtons } from './VoteButtons';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock mode's signIn ignores credentials and just sets a fixed mock user —
// this logs the test in so handleVote's `if (!user) return` guard doesn't
// silently swallow the click.
const LoggedInVoteButtons = (props: React.ComponentProps<typeof VoteButtons>) => {
    const { signIn } = useAuth();
    // signIn isn't memoized in AuthContext, so depending on it here would
    // re-fire this effect (and re-login) on every render, since it produces
    // a new user object each call — run once on mount only.
    useEffect(() => {
        signIn('test@example.com', 'password');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <VoteButtons {...props} />;
};

const renderLoggedIn = (props: React.ComponentProps<typeof VoteButtons>) =>
    render(
        <AuthProvider>
            <NotificationProvider>
                <LoggedInVoteButtons {...props} />
            </NotificationProvider>
        </AuthProvider>
    );

// Clears VoteButtons' internal 1-vote-per-second rate limit between clicks
// in the same test (real timers — fake timers deadlock with RTL's waitFor).
const waitOutRateLimit = () => new Promise(resolve => setTimeout(resolve, 1100));

describe('VoteButtons', () => {
    it('renders initialTemperature as-is when the deal has no upvotes/downvotes columns to derive it from', () => {
        render(
            <AuthProvider>
                <NotificationProvider>
                    <VoteButtons initialTemperature={42} dealId="deal-1" />
                </NotificationProvider>
            </AuthProvider>
        );
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('increments by 1 on upvote from no prior vote', async () => {
        renderLoggedIn({ initialTemperature: 10, dealId: 'deal-1' });
        await waitFor(() => expect(screen.getByLabelText('Upvote')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText('Upvote'));

        await waitFor(() => expect(screen.getByText('11')).toBeInTheDocument());
    });

    it('decrements by 1 on downvote from no prior vote', async () => {
        renderLoggedIn({ initialTemperature: 10, dealId: 'deal-1' });
        await waitFor(() => expect(screen.getByLabelText('Downvote')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText('Downvote'));

        await waitFor(() => expect(screen.getByText('9')).toBeInTheDocument());
    });

    it('swings by 2 when switching an upvote directly to a downvote', async () => {
        renderLoggedIn({ initialTemperature: 10, dealId: 'deal-1' });
        await waitFor(() => expect(screen.getByLabelText('Upvote')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText('Upvote'));
        await waitFor(() => expect(screen.getByText('11')).toBeInTheDocument());

        await waitOutRateLimit();

        fireEvent.click(screen.getByLabelText('Downvote'));
        await waitFor(() => expect(screen.getByText('9')).toBeInTheDocument());
    });

    it('returns to the original value when the same vote is toggled off', async () => {
        renderLoggedIn({ initialTemperature: 10, dealId: 'deal-1' });
        await waitFor(() => expect(screen.getByLabelText('Upvote')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText('Upvote'));
        await waitFor(() => expect(screen.getByText('11')).toBeInTheDocument());

        await waitOutRateLimit();

        fireEvent.click(screen.getByLabelText('Upvote'));
        await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    });

    it('does not change the count when a logged-out user clicks vote', () => {
        render(
            <AuthProvider>
                <NotificationProvider>
                    <VoteButtons initialTemperature={10} dealId="deal-1" />
                </NotificationProvider>
            </AuthProvider>
        );

        fireEvent.click(screen.getByLabelText('Upvote'));

        expect(screen.getByText('10')).toBeInTheDocument();
    });
});
