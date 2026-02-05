import { Users, TrendingUp, Award, Info, Tag, X } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

const CATEGORIES = [
    'Electronics',
    'Home',
    'Fashion',
    'Sports',
    'Gaming',
    'Grocery'
];

export const Sidebar = () => {
    const { filters, setCategory } = useSearch();

    return (
        <aside className="space-y-6">
            {/* Categories Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-blue-600" />
                    Categories
                </h2>
                <div className="space-y-2">
                    <button
                        onClick={() => setCategory(undefined)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.category
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        All Categories
                    </button>
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setCategory(category)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${filters.category === category
                                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {category}
                            {filters.category === category && <X size={14} onClick={(e) => { e.stopPropagation(); setCategory(undefined); }} className="hover:text-blue-900" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* About DealFeed Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    About DealFeed
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                    The community for finding and sharing the best deals. Join us to save money and share your finds.
                </p>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Join Community
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Community Stats
                </h2>
                <div className="space-y-3">
                    <StatItem
                        icon={<Users size={18} />}
                        label="Active Members"
                        value="12,543"
                    />
                    <StatItem
                        icon={<TrendingUp size={18} />}
                        label="Deals Today"
                        value="234"
                    />
                    <StatItem
                        icon={<Award size={18} />}
                        label="Money Saved"
                        value="$2.4M"
                    />
                </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Quick Links
                </h2>
                <div className="space-y-2">
                    <QuickLink href="/guidelines">Community Guidelines</QuickLink>
                    <QuickLink href="/faq">FAQ</QuickLink>
                    <QuickLink href="/contact">Contact Support</QuickLink>
                    <QuickLink href="/about">About Us</QuickLink>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            How It Works
                        </h3>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            Vote on deals you love! Higher votes = hotter deals. Share your finds and help others save.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// Helper component for stats
interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const StatItem = ({ icon, label, value }: StatItemProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
    );
};

// Helper component for quick links
interface QuickLinkProps {
    href: string;
    children: React.ReactNode;
}

const QuickLink = ({ href, children }: QuickLinkProps) => {
    return (
        <a
            href={href}
            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1.5 rounded transition-colors"
        >
            {children}
        </a>
    );
};
