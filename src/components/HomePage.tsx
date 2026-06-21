import { DealList } from './DealList';
import { Sidebar } from './Sidebar';
import type { Deal } from '../types/deal';

interface HomePageProps {
    deals: Deal[];
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
}

export const HomePage = ({ deals, hasMore, onLoadMore, loading }: HomePageProps) => {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Deals List */}
                <div className="lg:col-span-2">
                    <DealList deals={deals} hasMore={hasMore} onLoadMore={onLoadMore} loading={loading} />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </main>
    );
};
